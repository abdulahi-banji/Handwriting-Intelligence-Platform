# System Architecture

## Overview

The Handwriting Intelligence Platform is a full-stack application that transforms uploaded content (images, PDFs, or text) into structured digital notes rendered in a user's handwriting style.

At a high level, the system consists of a React frontend communicating with a FastAPI backend, which processes data, performs OCR, applies handwriting-style transformations, and persists data in a PostgreSQL database.

---

## Core Components

### Frontend
- **Tech:** React + Vite  
- Single Page Application (SPA) responsible for:
  - User authentication flows  
  - File uploads (images, PDFs, text)  
  - Managing handwriting profiles  
  - Viewing and organizing generated notes  

---

### Backend
- **Tech:** FastAPI (Python)  
- Provides RESTful APIs for:
  - Authentication (JWT-based)  
  - File ingestion and processing  
  - Handwriting profile management  
  - Notes generation and retrieval  

- Responsibilities:
  - Orchestrates OCR and AI pipelines  
  - Handles business logic  
  - Interfaces with the database  

---

### Database
- **Tech:** PostgreSQL  
- Stores:
  - Users  
  - Handwriting samples  
  - Generated notes  
  - Metadata and preferences  

---

### OCR Processing
- **Tool:** Tesseract via `pytesseract`  
- Extracts raw text from:
  - Uploaded images  
  - Scanned documents  

---

### AI / Handwriting Modeling
- **Tool:** Google Gemini (`google-generativeai`) *(optional)*  
- Used for:
  - Enhancing extracted text  
  - Analyzing handwriting style  
  - Generating stylized handwritten notes  

- Activated only when `GEMINI_API_KEY` is configured.

---

## Data Flow Pipeline

User Input  
↓  
Frontend Upload (React)  
↓  
FastAPI Backend  
↓  
File Processing Pipeline  
↓  
OCR Extraction (Tesseract)  
↓  
Text Cleaning & Normalization  
↓  
Handwriting Style Application (AI Model)  
↓  
Structured Notes Stored in PostgreSQL  
↓  
Frontend Displays Styled Notes  

---

## Data Models (Simplified)

### Users
- id  
- email  
- username  
- password_hash  
- created_at  

### Handwriting Samples
- id  
- user_id  
- sample_name  
- ocr_text  
- style_data (JSONB)  
- image_base64  
- created_at  

### Notes
- id  
- user_id  
- title  
- original_content  
- processed_content  
- style_applied  
- subject  
- tags  
- is_favorite  
- created_at  
- updated_at  

---

## Design Decisions

- **JWT Authentication**
  - Stateless and scalable  
  - Reduces server-side session management complexity  

- **JSONB for Style Data**
  - Allows flexible representation of handwriting features  
  - Easily extendable as the ML model evolves  

- **Raw SQL with psycopg2**
  - Lightweight and explicit  
  - Easier to control queries during early development  
  - Can be upgraded to ORM + migrations later  

---

## Production Considerations

For a production-ready deployment:

- Use **Gunicorn + Uvicorn workers** for concurrency  
- Place a **reverse proxy (NGINX)** in front  
- Add:
  - Logging  
  - Monitoring (Prometheus / Grafana)  
  - Error tracking (Sentry)  

- Implement:
  - Database backups  
  - Secure environment variable management  

---

## Future Improvements

- Introduce **Alembic** for database migrations  
- Abstract AI calls into a **provider adapter layer**  
- Add **real-time handwriting rendering**  
- Optimize OCR + inference performance  
- Add caching layer (Redis) for faster responses  

---