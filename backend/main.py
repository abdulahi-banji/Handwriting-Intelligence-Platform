from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import jwt
import bcrypt
import os
import uuid
import json
import base64
from datetime import datetime, timedelta
from dotenv import load_dotenv
from PIL import Image
import io
import psycopg2
from psycopg2.extras import RealDictCursor

# Try to import pytesseract, but don't fail if not available
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

load_dotenv()

# --- Config ---
SECRET_KEY = os.getenv("SECRET_KEY", "supersecret-dev-key-change-in-prod")
ALGORITHM = "HS256"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "")

# CORS allowed origins - allow all for now, can be restricted in production
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

app = FastAPI(title="Handwriting Intelligence Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini client
import google.generativeai as genai
gemini_client = None
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_client = genai.GenerativeModel('gemini-1.5-flash')
        print("✅ Gemini client initialized")
    except Exception as e:
        print(f"⚠️  Gemini client init failed: {e}")

if not TESSERACT_AVAILABLE:
    print("⚠️  Tesseract OCR not available - OCR features will be limited")

security = HTTPBearer()

# --- DB Connection ---
def get_db():
    if not DATABASE_URL:
        raise HTTPException(status_code=503, detail="Database not configured. Please set DATABASE_URL environment variable.")
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    if not DATABASE_URL:
        print("⚠️  DATABASE_URL not set, skipping DB init")
        return
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(100) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS handwriting_samples (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                sample_name VARCHAR(100),
                ocr_text TEXT,
                style_data JSONB,
                image_base64 TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS notes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                original_content TEXT,
                processed_content TEXT,
                style_applied VARCHAR(100),
                subject VARCHAR(100),
                tags TEXT[],
                is_favorite BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
            CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_samples_user_id ON handwriting_samples(user_id);
        """)
        conn.commit()
        cur.close()
        conn.close()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"⚠️  DB init skipped (running without DB): {e}")

@app.on_event("startup")
async def startup():
    init_db()

# --- Auth Helpers ---
def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Pydantic Models ---
class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class NoteCreateRequest(BaseModel):
    title: str
    content: str
    subject: Optional[str] = "General"
    tags: Optional[List[str]] = []

class NoteUpdateRequest(BaseModel):
    title: Optional[str] = None
    is_favorite: Optional[bool] = None
    tags: Optional[List[str]] = None

# --- Auth Routes ---
@app.post("/api/auth/register")
async def register(data: RegisterRequest, db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (data.email,))
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    user_id = str(uuid.uuid4())
    cur.execute(
        "INSERT INTO users (id, email, username, password_hash) VALUES (%s, %s, %s, %s)",
        (user_id, data.email, data.username, hashed)
    )
    db.commit()
    
    token = create_token(user_id, data.email)
    return {"token": token, "user": {"id": user_id, "email": data.email, "username": data.username}}

@app.post("/api/auth/login")
async def login(data: LoginRequest, db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE email = %s", (data.email,))
    user = cur.fetchone()
    
    if not user or not bcrypt.checkpw(data.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(str(user["id"]), user["email"])
    return {"token": token, "user": {"id": str(user["id"]), "email": user["email"], "username": user["username"]}}

@app.get("/api/auth/me")
async def get_me(payload=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("SELECT id, email, username, created_at FROM users WHERE id = %s", (payload["sub"],))
    user = cur.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(user)

# --- Handwriting Sample Routes ---
@app.post("/api/samples/upload")
async def upload_sample(
    file: UploadFile = File(...),
    sample_name: str = Form("My Handwriting"),
    payload=Depends(verify_token),
    db=Depends(get_db)
):
    contents = await file.read()
    
    # OCR Processing with graceful fallback
    ocr_text = ""
    style_data = {"font_style": "casual", "slant": "upright", "size": "medium", "spacing": "normal"}
    
    if TESSERACT_AVAILABLE:
        try:
            image = Image.open(io.BytesIO(contents))
            ocr_text = pytesseract.image_to_string(image)
            style_data = await analyze_handwriting_style(ocr_text, contents)
        except Exception as e:
            print(f"⚠️  OCR processing failed: {e}")
    
    img_b64 = base64.b64encode(contents).decode()
    sample_id = str(uuid.uuid4())
    
    cur = db.cursor()
    cur.execute(
        """INSERT INTO handwriting_samples (id, user_id, sample_name, ocr_text, style_data, image_base64)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (sample_id, payload["sub"], sample_name, ocr_text, json.dumps(style_data), img_b64)
    )
    db.commit()
    
    return {
        "id": sample_id,
        "sample_name": sample_name,
        "ocr_text": ocr_text[:200] if ocr_text else "OCR not available",
        "style_data": style_data,
        "message": "Handwriting sample processed successfully!"
    }

@app.get("/api/samples")
async def get_samples(payload=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute(
        "SELECT id, sample_name, ocr_text, style_data, created_at FROM handwriting_samples WHERE user_id = %s ORDER BY created_at DESC",
        (payload["sub"],)
    )
    samples = cur.fetchall()
    return [dict(s) for s in samples]

# --- Notes Routes ---
@app.post("/api/notes/generate")
async def generate_note(
    file: UploadFile = File(...),
    title: str = Form("Untitled Note"),
    subject: str = Form("General"),
    tags: str = Form("[]"),
    sample_id: Optional[str] = Form(None),
    payload=Depends(verify_token),
    db=Depends(get_db)
):
    contents = await file.read()
    file_ext = file.filename.split(".")[-1].lower() if file.filename else "txt"
    
    # Extract text from file
    raw_text = await extract_text_from_file(contents, file_ext, file.content_type)
    
    # Get user's handwriting style
    style_data = {}
    if sample_id:
        cur = db.cursor()
        cur.execute("SELECT style_data FROM handwriting_samples WHERE id = %s AND user_id = %s", (sample_id, payload["sub"]))
        sample = cur.fetchone()
        if sample:
            style_data = sample["style_data"]
    
    # Process with Gemini
    processed = await process_with_gemini(raw_text, style_data, subject)
    
    note_id = str(uuid.uuid4())
    tags_list = json.loads(tags) if isinstance(tags, str) else tags
    
    cur = db.cursor()
    cur.execute(
        """INSERT INTO notes (id, user_id, title, original_content, processed_content, style_applied, subject, tags)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        (note_id, payload["sub"], title, raw_text, processed, sample_id or "default", subject, tags_list)
    )
    db.commit()
    
    return {
        "id": note_id,
        "title": title,
        "processed_content": processed,
        "subject": subject,
        "tags": tags_list,
        "created_at": datetime.utcnow().isoformat()
    }

@app.post("/api/notes/create")
async def create_note_text(data: NoteCreateRequest, payload=Depends(verify_token), db=Depends(get_db)):
    processed = await process_with_gemini(data.content, {}, data.subject)
    note_id = str(uuid.uuid4())
    
    cur = db.cursor()
    cur.execute(
        """INSERT INTO notes (id, user_id, title, original_content, processed_content, subject, tags)
           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (note_id, payload["sub"], data.title, data.content, processed, data.subject, data.tags)
    )
    db.commit()
    
    return {"id": note_id, "title": data.title, "processed_content": processed, "subject": data.subject}

@app.get("/api/notes")
async def get_notes(
    subject: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 12,
    payload=Depends(verify_token),
    db=Depends(get_db)
):
    cur = db.cursor()
    offset = (page - 1) * limit
    
    query = "SELECT id, title, subject, tags, is_favorite, created_at, LEFT(processed_content, 200) as preview FROM notes WHERE user_id = %s"
    params = [payload["sub"]]
    
    if subject and subject != "All":
        query += " AND subject = %s"
        params.append(subject)
    
    if search:
        query += " AND (title ILIKE %s OR processed_content ILIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])
    
    query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    cur.execute(query, params)
    notes = cur.fetchall()
    
    # Count total
    count_q = "SELECT COUNT(*) FROM notes WHERE user_id = %s"
    count_p = [payload["sub"]]
    if subject and subject != "All":
        count_q += " AND subject = %s"
        count_p.append(subject)
    cur.execute(count_q, count_p)
    total = cur.fetchone()["count"]
    
    return {"notes": [dict(n) for n in notes], "total": total, "page": page, "pages": -(-total // limit)}

@app.get("/api/notes/{note_id}")
async def get_note(note_id: str, payload=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("SELECT * FROM notes WHERE id = %s AND user_id = %s", (note_id, payload["sub"]))
    note = cur.fetchone()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return dict(note)

@app.patch("/api/notes/{note_id}")
async def update_note(note_id: str, data: NoteUpdateRequest, payload=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor()
    updates = []
    params = []
    
    if data.title is not None:
        updates.append("title = %s")
        params.append(data.title)
    if data.is_favorite is not None:
        updates.append("is_favorite = %s")
        params.append(data.is_favorite)
    if data.tags is not None:
        updates.append("tags = %s")
        params.append(data.tags)
    
    updates.append("updated_at = NOW()")
    params.extend([note_id, payload["sub"]])
    
    cur.execute(f"UPDATE notes SET {', '.join(updates)} WHERE id = %s AND user_id = %s", params)
    db.commit()
    return {"message": "Note updated"}

@app.delete("/api/notes/{note_id}")
async def delete_note(note_id: str, payload=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("DELETE FROM notes WHERE id = %s AND user_id = %s", (note_id, payload["sub"]))
    db.commit()
    return {"message": "Note deleted"}

@app.get("/api/notes/stats/summary")
async def get_stats(payload=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_favorite) as favorites FROM notes WHERE user_id = %s", (payload["sub"],))
    stats = cur.fetchone()
    cur.execute("SELECT subject, COUNT(*) as count FROM notes WHERE user_id = %s GROUP BY subject ORDER BY count DESC LIMIT 5", (payload["sub"],))
    subjects = cur.fetchall()
    cur.execute("SELECT COUNT(*) as samples FROM handwriting_samples WHERE user_id = %s", (payload["sub"],))
    samples = cur.fetchone()
    
    return {
        "total_notes": stats["total"],
        "favorites": stats["favorites"],
        "samples": samples["samples"],
        "subjects": [dict(s) for s in subjects]
    }

# --- AI Processing Helpers ---
async def analyze_handwriting_style(ocr_text: str, image_bytes: bytes) -> dict:
    if not gemini_client:
        return {"font_style": "casual-handwritten", "slant": "slight-right", "size": "medium", "spacing": "relaxed", "pressure": "medium"}
    
    try:
        prompt = f"""Analyze this handwriting sample OCR text and return a JSON object with writing style characteristics.
OCR Text: {ocr_text[:500]}

Return ONLY valid JSON like:
{{"font_style": "casual/formal/print/cursive", "slant": "left/upright/slight-right/right", "size": "small/medium/large", "spacing": "tight/normal/relaxed", "pressure": "light/medium/heavy", "style_description": "brief description"}}"""
        
        response = gemini_client.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1].replace("json", "").strip()
        return json.loads(text)
    except:
        return {"font_style": "casual-handwritten", "slant": "slight-right", "size": "medium", "spacing": "relaxed", "pressure": "medium"}

def extract_text_with_ocr(image: Image.Image) -> str:
    """Extract text from image using pytesseract with graceful fallback"""
    if not TESSERACT_AVAILABLE:
        return ""
    try:
        return pytesseract.image_to_string(image)
    except Exception as e:
        print(f"⚠️  Tesseract OCR error: {e}")
        return ""

async def extract_text_from_file(contents: bytes, ext: str, content_type: str) -> str:
    if ext in ["txt", "md"]:
        return contents.decode("utf-8", errors="ignore")
    
    if ext in ["jpg", "jpeg", "png", "webp", "gif"]:
        try:
            image = Image.open(io.BytesIO(contents))
            text = extract_text_with_ocr(image)
            return text if text else "OCR not available. Please enter text manually."
        except Exception as e:
            return f"Could not process image: {str(e)}"
    
    if ext == "pdf":
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(contents)) as pdf:
                text = "\n\n".join(page.extract_text() or "" for page in pdf.pages)
                if text.strip():
                    return text
        except:
            pass
        
        # Fallback to image-based extraction
        try:
            image = Image.open(io.BytesIO(contents))
            text = extract_text_with_ocr(image)
            return text if text else "PDF processing failed. Please enter text manually."
        except:
            return "Could not process PDF. Please enter text manually."
    
    return contents.decode("utf-8", errors="ignore")

async def process_with_gemini(text: str, style_data: dict, subject: str) -> str:
    if not gemini_client:
        # Return nicely structured demo content
        return f"""📚 {subject} Notes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{text[:800] if text else "Your notes content will appear here, beautifully formatted in your handwriting style!"}

Key Takeaways:
• Review and understand core concepts
• Practice with examples
• Connect ideas to prior knowledge

💡 Note: Connect Gemini API for AI-powered restructuring!
"""
    
    try:
        style_desc = style_data.get("style_description", "casual handwritten") if style_data else "student-friendly"
        
        prompt = f"""You are an expert note-taking assistant. Transform the following content into well-structured, 
engaging study notes optimized for learning. 

Subject: {subject}
Writing Style to emulate: {style_desc}

Content to transform:
{text[:3000]}

Create structured notes with:
1. A clear title/header
2. Key concepts highlighted with ★
3. Important definitions marked with →
4. Examples labeled clearly  
5. Summary points at the end
6. Use emojis sparingly for visual interest
7. Keep a conversational, student-friendly tone
8. Use --- for section dividers
9. Keep adequate space within sections
10. you can add things like stickers that will make it appealing 

Format it as if written in a notebook. Make it engaging and memorable."""
        
        response = gemini_client.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"[Gemini processing failed: {str(e)}]\n\nOriginal content:\n{text}"

@app.get("/")
async def root():
    return {"message": "Handwriting Intelligence Platform API", "version": "1.0.0", "docs": "/docs"}

