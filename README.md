# Handwriting Intelligence Platform

An AI-powered full stack web application that converts content from uploaded images, PDFs, or typed text into structured digital notes rendered in the user's handwriting style.

This platform helps students retain information more effectively by allowing them to view notes in their own handwriting instead of generic fonts.

---

# Features

• Upload images, PDFs, or typed notes  
• Extract text using OCR  
• Containerized deployment with Docker
• Generate notes styled after a user's handwriting  
• Manage handwriting profiles  
• Organize notes by subject  
• Favorite important notes  
• Secure JWT authentication  

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
- JWT Tokens

Infrastructure
- Docker & Docker Compose
- GitHub Actions (CI/CD)


---

# Architecture

User
 
React Frontend
 ↓
FastAPI Backend
 ↓
File Processing Pipeline
 ↓
OCR Extraction
 ↓
Handwriting Style Generation
 ↓
PostgreSQL Database

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

tests  

docs  

---




# GETTING STARTED

## Clone repository

git clone https://github.com/abdulahi-banji/Handwriting-Intelligence-Platform

cd Handwriting-Intelligence-Platform

---

## Backend Setup

cd backend

pip install -r requirements.txt

run server

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


## Example Workflow

1. User uploads handwriting sample
2. Platform extracts style features
3. User uploads PDF or image notes
4. OCR extracts text
5. AI renders notes in user handwriting

---


# CI/CD Pipeline

1. Lint — Ruff (Python), ESLint (JavaScript)
2. Test — pytest with coverage gate ≥ 80%
3. Build — Docker image built and pushed to container registry
4. Deploy — Automated deploy to staging on merge to main

# Future Improvements

• Train handwriting style embedding model  
• Real-time handwriting rendering  
• Mobile application  
• Graphical illustration of material for enhanced learning
• Collaborative note sharing  

---

# Contributing

Contributions are welcome.  
Please open an issue or submit a pull request.

---

# License

MIT License. 
