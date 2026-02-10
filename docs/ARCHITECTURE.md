# System Architecture



- **Frontend:** React + Vite — single-page application (SPA) that handles authentication, uploads and UI interactions.
- **Backend:** FastAPI (Python) — exposes REST endpoints for auth, notes, handwriting samples, and stats.
- **Database:** PostgreSQL — stores users, handwriting samples, notes and metadata.
- **OCR:** Tesseract via `pytesseract` — extracts text from images.
- **AI:** Google Gemini via `google-generativeai` — optional analysis and content generation when `GEMINI_API_KEY` is set.

# System architecture — simple explanation

Short version: the app is a React front-end talking to a FastAPI backend that stores data in Postgres. The backend runs OCR with Tesseract and (optionally) calls Google Gemini to analyze handwriting style or refine generated notes.

How the pieces fit together
- Frontend (React + Vite): UI, auth flows, uploads, and calling backend endpoints.
- Backend (FastAPI): REST endpoints for auth, notes, handwriting samples, and stats. It also initializes DB tables on first run.
- Database (Postgres): stores users, handwriting samples, and notes.

Key data shapes (short):
- `users`: id, email, username, password_hash, created_at
- `handwriting_samples`: id, user_id, sample_name, ocr_text, style_data (JSONB), image_base64, created_at
- `notes`: id, user_id, title, original_content, processed_content, style_applied, subject, tags, is_favorite, created_at, updated_at

Why we made a few choices
- JWT is stateless and keeps the server simple — good for horizontal scaling.
- We used raw SQL + `psycopg2` to keep dependencies small; for a real product add Alembic migrations.
- `style_data` is JSONB so the AI can return flexible, evolving info about handwriting (slant, size, pressure, etc.).

Operational notes (what you should do for production)
- Run the backend with multiple workers (gunicorn + uvicorn workers) and put a reverse proxy in front.
- Add logging, metrics, and error tracking (Sentry) before you go live.
- Back up the Postgres data regularly and verify restores.

Where to extend
- Put AI calls behind a small adapter module so you can swap providers without changing core logic.
- Add a real migration system (Alembic) instead of relying on `init_db()` at startup.

---
End of architecture notes.
