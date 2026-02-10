# ✏️ Scribble AI — Handwriting Intelligence Platform
### Step-by-Step Setup Guide for VSCode

---

## 🗂️ Project Structure

```
handwriting-platform/
├── backend/              ← FastAPI Python server
│   ├── main.py           ← All API routes + logic
│   ├── requirements.txt  ← Python packages
│   └── .env.example      ← Environment template
└── frontend/             ← React + Vite app
    ├── src/
    │   ├── App.jsx
    │   ├── index.css
    │   ├── hooks/        ← useAuth context
    │   ├── pages/        ← Dashboard, Notes, Generate, etc.
    │   ├── components/   ← Sidebar
    │   └── utils/        ← API axios instance
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 📋 PREREQUISITES — Install These First

### 1. Python 3.10+
Download from https://python.org
- During install on Windows: ✅ CHECK "Add Python to PATH"
- Verify: Open terminal → `python --version` (should say 3.10+)

### 2. Node.js 18+
Download from https://nodejs.org (LTS version)
- Verify: `node --version` and `npm --version`

### 3. PostgreSQL
Download from https://postgresql.org/download
- During install: remember the password you set for the "postgres" user
- Default port: 5432
- Verify: `psql --version`

### 4. Tesseract OCR
For the OCR (handwriting extraction) feature:
- **Windows:** Download installer from https://github.com/UB-Mannheim/tesseract/wiki
  - Install to `C:\Program Files\Tesseract-OCR\`
  - Add to PATH: System Properties → Environment Variables → PATH → Add `C:\Program Files\Tesseract-OCR`
- **Mac:** `brew install tesseract`
- **Linux:** `sudo apt install tesseract-ocr`
- Verify: `tesseract --version`

### 5. VSCode Extensions (recommended)
Install these from the Extensions panel (Ctrl+Shift+X):
- Python (by Microsoft)
- ES7+ React/Redux snippets
- Prettier
- Thunder Client (for testing APIs)

---

## 🚀 STEP-BY-STEP SETUP

### STEP 1 — Create the database

Open your terminal (Terminal menu → New Terminal in VSCode):

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql, create the database:
CREATE DATABASE handwriting_db;

# Exit psql
\q
```

---

### STEP 2 — Set up the Backend

Open a new terminal in VSCode (you can have multiple tabs):

```bash
# Navigate into the backend folder
cd handwriting-platform/backend

# Create a Python virtual environment
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# You should see (venv) in your terminal prompt now ✅

# Install all Python packages
pip install -r requirements.txt
```

> ⚠️ If pip install fails on `psycopg2-binary`, try: `pip install psycopg2-binary --no-binary psycopg2-binary`

---

### STEP 3 — Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Open .env in VSCode and fill in your values:
```

Edit `.env`:
```
SECRET_KEY=any-random-long-string-like-this-abc123xyz789
GEMINI_API_KEY=your-key-from-google-ai-studio
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/handwriting_db
```

#### Getting your Gemini API Key (FREE):
1. Go to https://aistudio.google.com
2. Sign in with Google
3. Click "Get API key" → "Create API key"
4. Copy the key and paste it in `.env`

> 💡 The app still works WITHOUT a Gemini key — it just won't AI-restructure the content.

---

### STEP 4 — Run the Backend

In the backend terminal (make sure venv is activated):

```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
✅ Database initialized successfully
```

Test it: Open http://localhost:8000 in your browser — you should see:
```json
{"message": "Handwriting Intelligence Platform API", "version": "1.0.0"}
```

Also check the auto-generated API docs at: http://localhost:8000/docs

---

### STEP 5 — Set up and Run the Frontend

Open a **NEW terminal** in VSCode (keep the backend running!):

```bash
# Navigate to frontend
cd handwriting-platform/frontend

# Install packages
npm install

# Start the development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

### STEP 6 — Open the App!

Go to http://localhost:5173 in your browser.

1. Click **"Create one →"** to register an account
2. Enter username, email, password
3. You'll be taken to the Dashboard!

---

## 🎮 Using the App

### Creating Notes
1. Click **"Generate Note"** in the sidebar
2. Choose **"Upload File"** tab → drag in an image/PDF/text file
   OR choose **"Type Content"** tab → paste text
3. Give it a title and subject
4. Click **"✨ Generate Note"**
5. Watch the AI process it in real-time!

### Adding Handwriting Samples
1. Go to **"Handwriting"** in the sidebar
2. Upload a clear photo of your handwriting
3. It runs OCR to extract your writing patterns
4. Next time you generate a note, select your sample style

### Managing Notes
- Click any note card to read it
- Star notes to favorite them
- Search and filter by subject

---

## 🐛 Troubleshooting

### "Module not found" errors on backend
```bash
# Make sure venv is activated (you see "(venv)" in terminal)
# Then reinstall:
pip install -r requirements.txt
```

### "Database connection failed"
- Check PostgreSQL is running: `pg_ctl status` or look in Windows Services
- Verify your DATABASE_URL password matches what you set during PostgreSQL install
- Try connecting manually: `psql -U postgres -d handwriting_db`

### "npm install" fails
```bash
# Clear cache and retry
npm cache clean --force
npm install
```

### CORS errors in browser
- Make sure backend is running on port 8000
- Make sure frontend is on port 5173
- The vite.config.js already has a proxy set up

### Tesseract not found
- Windows: Restart VSCode after adding to PATH
- Check: `where tesseract` (Windows) or `which tesseract` (Mac/Linux)
- If path is different, add this to backend main.py after imports:
  ```python
  pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
  ```

### PDF extraction not working
```bash
pip install pdfplumber
```

---

## 🔌 Running Both Servers (Quick Start)

Every time you want to work on the project:

**Terminal 1 — Backend:**
```bash
cd handwriting-platform/backend
venv\Scripts\activate        # Windows
# OR source venv/bin/activate # Mac/Linux
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd handwriting-platform/frontend
npm run dev
```

Then open: http://localhost:5173

---

## 🌐 Tech Stack Explained

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | React 18 + Vite | Fast, component-based UI |
| Routing | React Router v6 | Client-side navigation |
| Styling | Pure CSS (custom) | Handwritten notebook aesthetic |
| HTTP | Axios | API calls with JWT interceptors |
| File Upload | React Dropzone | Drag & drop UX |
| Backend | FastAPI (Python) | Fast async API with auto-docs |
| Auth | JWT (PyJWT) + bcrypt | Secure stateless auth |
| Database | PostgreSQL | Relational, fast indexed queries |
| DB Driver | psycopg2 | Python-PostgreSQL bridge |
| OCR | Tesseract + pytesseract | Extract text from images |
| AI | Google Gemini 1.5 Flash | Free tier, great for structured text |
| PDF | pdfplumber | Extract text from PDFs |

---

## 📁 Adding More Features

### To add a new page:
1. Create `frontend/src/pages/NewPage.jsx`
2. Add route in `App.jsx`: `<Route path="/new" element={<ProtectedLayout><NewPage /></ProtectedLayout>} />`
3. Add nav item in `Sidebar.jsx`

### To add a new API endpoint:
1. Add function in `backend/main.py`
2. Use `@app.get/post/patch/delete("/api/yourroute")`

### To change the AI behavior:
Edit the `process_with_gemini()` function in `main.py` — change the prompt!

---

## 🎨 Customizing the Design

All styles are in `frontend/src/index.css`. Key CSS variables at the top:
```css
--yellow: #f9e45a;      /* Primary accent */
--mint: #b8e8d4;        /* Success/positive */
--coral: #f4876a;       /* Alerts/delete */
--font-hand: 'Caveat';  /* Handwriting font */
--font-body: 'Nunito';  /* Body text */
```

Change these to completely retheme the app!
