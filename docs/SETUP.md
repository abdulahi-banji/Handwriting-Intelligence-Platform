# Setup & Troubleshooting — friendly guide

This page helps you get the app running locally and includes the common fixes I've seen while onboarding new developers. If something trips you up, copy the command and paste the error back here — I'll help.

## What you'll need
- Homebrew (macOS) — https://brew.sh/
- Python 3.11 (recommended)
- Node.js (LTS)
- PostgreSQL
- Tesseract OCR (for handwriting extraction)

## Quick backend setup

1. Install Python 3.11 (macOS):

```bash
brew install python@3.11
```

2. Create and activate the virtualenv:

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
```

3. Copy the example env and edit it:

```bash
cp .env.example .env
# open backend/.env and set:
# SECRET_KEY (long random string)
# GEMINI_API_KEY (optional — leave blank to skip AI features)
# DATABASE_URL (e.g. postgresql://<youruser>@localhost:5432/handwriting_db)
```

4. Install Python deps:

```bash
pip install -r requirements.txt
```

### If Pillow fails to build

Try this quick step first:

```bash
pip install --no-cache-dir Pillow==10.3.0
pip install -r requirements.txt
```

If that still fails, install system libraries (macOS):

```bash
xcode-select --install
brew install pkg-config libpng libjpeg zlib
export LDFLAGS="-L/opt/homebrew/opt/zlib/lib -L/opt/homebrew/opt/libpng/lib -L/opt/homebrew/opt/jpeg/lib"
export CPPFLAGS="-I/opt/homebrew/opt/zlib/include -I/opt/homebrew/opt/libpng/include -I/opt/homebrew/opt/jpeg/include"
pip install -r requirements.txt
```

## PostgreSQL (create the DB)

Start Postgres (Homebrew):

```bash
brew services start postgresql
```

Create the DB:

```bash
createdb handwriting_db
# or
psql -U postgres -c "CREATE DATABASE handwriting_db;"
```

Check tables after running the backend once (the app initializes tables on startup):

```bash
psql -U <your_pg_user> -d handwriting_db -c "\dt"
```

If the backend logs `✅ Database initialized successfully` your tables are ready.

## Tesseract

Install and check it:

```bash
brew install tesseract
tesseract --version
```

If `pytesseract` can't find the binary, add this line to `backend/main.py` (adjust the path):

```python
pytesseract.pytesseract.tesseract_cmd = r'/opt/homebrew/bin/tesseract'
```

## Common quick fixes

- `ModuleNotFoundError: No module named 'jwt'` — make sure venv is activated, then `pip install PyJWT`.
- `Failed to build Pillow` — try Python 3.11 or the Pillow wheel install above.
- `psycopg2-binary` issues — install `libpq` and ensure its bin is on your PATH:

```bash
brew install libpq
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
```

## Run the app (two terminals)

Terminal 1 — backend:

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2 — frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend at http://localhost:5173 and the backend at http://localhost:8000

## Secrets

- Local dev: `backend/.env` (don't commit this file).
- Production: use a secret manager or host-provided env vars.

---

If anything fails, copy the error here and I'll walk you through the fix.
