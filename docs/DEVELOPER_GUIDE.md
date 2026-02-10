# Developer Guide

This guide helps contributors set up a local development environment, run the app, debug common issues, and prepare changes for push.

## Recommended environment

- macOS / Linux: supported for development. Windows should work but commands differ.
- Python: **3.11** recommended (some binary wheels, e.g., Pillow, are built for 3.11).
- Node: LTS (>=18)

## Setup steps (local)

1. Clone the repo and open it in VSCode.

2. Backend

```bash
cd backend
# create venv with python3.11
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
cp .env.example .env
# Edit backend/.env: set SECRET_KEY, GEMINI_API_KEY, DATABASE_URL
pip install -r requirements.txt
```

3. Create database

```bash
# on mac with homebrew postgres running
createdb handwriting_db
# or using psql
psql -U <your_pg_user> -c "CREATE DATABASE handwriting_db;"
```

## Developer guide — quick and friendly

This guide helps you get up and running quickly, debug issues, and contribute without friction.

### Recommended environment

- macOS / Linux (Windows works but commands differ)
- Python 3.11 (recommended for binary compatibility)
- Node LTS (>=18)

### Local setup (short)

Backend:

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
cp .env.example .env
# Edit backend/.env: set SECRET_KEY, GEMINI_API_KEY, DATABASE_URL
pip install -r requirements.txt
```

Create DB:

```bash
createdb handwriting_db
# or
psql -U <your_pg_user> -c "CREATE DATABASE handwriting_db;"
```

Run backend:

```bash
source venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd ../frontend
npm install
npm run dev
```

### Quick debugging

- `No module named 'jwt'`: activate your venv, then `pip install PyJWT` or re-run `pip install -r requirements.txt`.
- `Failed to build Pillow`: use Python 3.11 or run the Pillow wheel install (see `docs/SETUP.md`).
- `psycopg2-binary` errors: install libpq and add its bin to your PATH.
- `pytesseract` missing: `brew install tesseract` and verify with `tesseract --version`.

### Working on the code

1. Branch: `git checkout -b feat/your-feature`
2. Make the change and run the app locally
3. Add tests where it makes sense
4. Commit and push: `git push origin feat/your-feature`
5. Open a PR and ask for review

### Small improvements to consider

- Add Alembic migrations for DB changes
- Move image blobs out of the DB and into S3 (store references)
- Add CI for linting and tests

---
That's it — if you want, I can add a basic `pytest` setup or an example GitHub Actions workflow next.
