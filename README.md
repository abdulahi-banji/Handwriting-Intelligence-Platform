# — Handwriting Intelligence Platform

Welcome — this repo is a tiny full-stack app that helps you extract text from handwriting, analyze writing style, and generate nicely formatted notes. Think of it as a playground for OCR + small-scale AI-driven text processing.

Where things live
- `backend/` — FastAPI service (Python)
- `frontend/` — React + Vite app
- `docs/` — setup, API reference, and developer notes

Quick start (the short version)
1. Copy the example env: `cp backend/.env.example backend/.env` and edit `backend/.env` (set `SECRET_KEY`, `GEMINI_API_KEY`, and `DATABASE_URL`).
2. Create the database: `createdb handwriting_db` (or use `psql` to create it).
3. Backend (Python 3.11 recommended):
   - `cd backend`
   - `python3.11 -m venv venv`
   - `source venv/bin/activate`
   - `pip install --upgrade pip setuptools wheel`
   - `pip install -r requirements.txt`
   - `uvicorn main:app --reload --host 127.0.0.1 --port 8000`
4. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev` (open http://localhost:5173)

Why Python 3.11?
Some libraries (Pillow in particular) often ship prebuilt wheels for popular Python versions. Using 3.11 avoids painful source builds on macOS.

Need more help?
- Full setup and troubleshooting: `docs/SETUP.md`
- API reference: `docs/API.md`

If you want, I can tidy these docs further or prepare a branch/PR for you to review before you push.
