# Handwriting Intelligence Platform

An AI-powered full stack web application that converts content from uploaded images, PDFs, or typed text into structured digital notes rendered in the user's handwriting style.

This platform helps students retain information more effectively by allowing them to view notes in their own handwriting instead of generic fonts.

---

# Features

- Upload images, PDFs, or typed notes  
- Extract text using OCR  
- Containerized deployment with Docker  
- Generate notes styled after a user's handwriting  
- Manage handwriting profiles  
- Organize notes by subject  
- Favorite important notes  
- Structured logging and observability 
- Async file processing via task queue  
- Secure JWT authentication (RS256)  

---

# Tech Stack

Frontend
- React
- TailwindCSS
- Axios

Backend
- FastAPI
- Python

Machine Learning
- Optical Character Recognition (OCR)
- Handwriting style modeling

Database
- PostgreSQL

Authentication
- JWT Tokens (RS256)

Infrastructure
- Docker & Docker Compose
- Nginx (reverse proxy)
- GitHub Actions (CI/CD)

---

# Architecture

User → React Frontend → Nginx Reverse Proxy → FastAPI Backend → Async Task Queue (Celery + Redis) → File Processing Pipeline → OCR Extraction → Handwriting Style Generation → PostgreSQL Database + Object Storage (S3)

---

# Project Structure

Handwriting-Intelligence-Platform

backend  
  api  
  services  
  models  
  core  

frontend  
  components  
  pages  

infra  
  docker-compose.yml  
  nginx  
  .env.example  

scripts  
  seed_db.py  
  run_tests.sh  
  lint.sh  

tests  
  unit  
  integration  

docs  

---

# GETTING STARTED

## Clone repository

git clone https://github.com/abdulahi-banji/Handwriting-Intelligence-Platform

cd Handwriting-Intelligence-Platform

cp infra/.env.example .env

---

## Backend Setup

cd backend

pip install -r requirements.txt

uvicorn main:app --reload

---

## Frontend Setup

cd frontend

npm install

npm run dev

---

## Run with Docker

cd infra

docker compose up --build

---


## Developer Tooling

Run linter

bash scripts/lint.sh

Run tests

bash scripts/run_tests.sh

Seed local database

python scripts/seed_db.py

---


## Example Workflow

1. User uploads handwriting sample
2. Platform extracts and models handwriting style features
3. User uploads PDF or image notes
4. OCR extracts text from the source
5. Async task queue processes the job
6. AI renders notes in user handwriting
7. Structured notes are saved and organized by subject

---

# CI/CD Pipeline

1. Lint — Ruff (Python), ESLint (JavaScript)
2. Test — pytest with coverage gate ≥ 80%
3. Build — Docker image built and pushed to container registry
4. Deploy — Automated deploy to staging on merge to main

---

# Observability

- Structured JSON logging across all services  
- Request IDs on all API responses for distributed tracing  
- Error tracking hooks for production alerting  

---

# Future Improvements

- Train handwriting style embedding model  
- Real-time handwriting rendering via WebSockets  
- Mobile application  
- Graphical illustration of material for enhanced learning  
- Collaborative note sharing 

---

# Contributing

Contributions are welcome.  
Please open an issue or submit a pull request.

---

# License

MIT License.