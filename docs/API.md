# API Reference (summary)

This file documents the main backend endpoints provided by `backend/main.py`.

Authentication
- POST `/api/auth/register` — Register a new user
  - Body: `{ "email": "...", "username": "...", "password": "..." }`
  - Returns: `{ token, user }` on success

- POST `/api/auth/login` — Login existing user
  - Body: `{ "email": "...", "password": "..." }`
  - Returns: `{ token, user }` on success

- GET `/api/auth/me` — Get current user
  - Headers: `Authorization: Bearer <token>`

Notes
- POST `/api/notes/create` — Create a note from text
  - Body: `{ title, content, subject, tags }`

- POST `/api/notes/generate` — Upload a file to generate a note with AI processing
  - Form fields: `file` (UploadFile), `title`, `subject`, `tags` (JSON string), `sample_id` (optional)

- GET `/api/notes` — List notes (supports `subject`, `search`, `page`, `limit` query params)

- GET `/api/notes/{note_id}` — Get a single note

- PATCH `/api/notes/{note_id}` — Update note title/tags/favorite

- DELETE `/api/notes/{note_id}` — Delete a note

# API Reference — quick and practical

Below are the main endpoints you'll use while developing or testing locally. The app also exposes interactive docs at `http://localhost:8000/docs` when the server is running.

Authentication
- POST `/api/auth/register`
  - Use to create a new user.
  - Body (JSON): `{ "email": "you@example.com", "username": "you", "password": "secret" }`
  - Response: `{ token, user }` (token is a JWT you'll use for subsequent requests).

- POST `/api/auth/login`
  - Body: `{ "email": "you@example.com", "password": "secret" }`
  - Response: `{ token, user }` on success.

- GET `/api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Returns current user details.

Notes
- POST `/api/notes/create` — Create a note from plain text
  - Body (JSON): `{ title, content, subject, tags }`

- POST `/api/notes/generate` — Upload a file and ask the AI to process it
  - Form (multipart): `file` (upload), `title`, `subject`, `tags` (JSON string), optional `sample_id` to apply handwriting style.

- GET `/api/notes` — List notes
  - Query params: `subject`, `search`, `page`, `limit`.

- GET `/api/notes/{note_id}` — Fetch one note

- PATCH `/api/notes/{note_id}` — Update a note (title/tags/is_favorite)

- DELETE `/api/notes/{note_id}` — Remove a note

Handwriting samples
- POST `/api/samples/upload` — Upload an image of handwriting
  - The server runs OCR (Tesseract) and optionally sends a prompt to Gemini to extract style data.

- GET `/api/samples` — List samples for the authenticated user

Stats
- GET `/api/notes/stats/summary` — Short summary: counts, favorites, sample count, and top subjects

Auth & tokens
- Tokens are JWTs signed with `SECRET_KEY`. Keep that secret. If you change it, existing tokens stop working.

DB init
- On startup the backend runs a small SQL block to create missing tables. Look for `✅ Database initialized successfully` in the backend logs.

Errors
- `401` usually means missing/invalid/expired token.
- If DB calls fail, confirm `DATABASE_URL` and that Postgres is running.
