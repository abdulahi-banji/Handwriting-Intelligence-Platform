# API Documentation

## Overview

The backend is built with FastAPI and exposes RESTful endpoints for authentication, file uploads, handwriting profile management, and note generation.

All protected routes require a valid JWT token.

Base URL:
http://localhost:8000

---

## Authentication

### POST /auth/login

Authenticate user and return JWT token.

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}

---

### POST /auth/register

Create a new user.

Request:
{
  "email": "user@example.com",
  "username": "user",
  "password": "password123"
}

Response:
{
  "message": "User created successfully"
}

---

## File Upload & OCR

### POST /upload

Upload an image or PDF for OCR processing.

Request:
- multipart/form-data
- file: image or pdf

Response:
{
  "extracted_text": "Text extracted from the document"
}

---

## Handwriting Profiles

### POST /handwriting-profile

Upload handwriting sample.

Request:
- image file

Response:
{
  "profile_id": 1,
  "message": "Handwriting profile created"
}

---

### GET /handwriting-profile

Retrieve all handwriting profiles for the user.

Response:
[
  {
    "id": 1,
    "sample_name": "Sample 1",
    "created_at": "timestamp"
  }
]

---

## Notes

### POST /generate-notes

Generate handwritten styled notes.

Request:
{
  "content": "input text",
  "profile_id": 1,
  "subject": "Biology"
}

Response:
{
  "note_id": 10,
  "generated_content": "styled handwritten text"
}

---

### GET /notes

Retrieve all notes.

Response:
[
  {
    "id": 10,
    "title": "Biology Notes",
    "subject": "Biology",
    "is_favorite": false
  }
]

---

### POST /notes/favorite

Mark note as favorite.

Request:
{
  "note_id": 10
}

Response:
{
  "message": "Note marked as favorite"
}

---

## Headers (for protected routes)

Authorization: Bearer <JWT_TOKEN>

---

## Error Handling

Standard error response:

{
  "detail": "Error message"
}

Common status codes:
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 500 Internal Server Error