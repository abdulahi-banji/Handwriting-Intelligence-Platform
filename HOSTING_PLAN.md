# Plan: Host Handwriting Intelligence Platform on Local Server

## Information Gathered
- **Frontend**: React + Vite, runs on port 5173, uses proxy to forward `/api` requests to backend
- **Backend**: FastAPI (Python), runs on port 8000, requires PostgreSQL database
- **Dependencies**: Node.js (npm), Python 3.11+, PostgreSQL, Tesseract OCR, Google Generative AI (optional)
- **API Config**: Frontend proxies `/api` to `http://localhost:8000`

## Plan

### Step 1: Install System Dependencies
- Check/install Python 3.11
- Check/install Node.js
- Check/install PostgreSQL
- Check/install Tesseract OCR

### Step 2: Set Up Backend
- Create Python virtual environment
- Install Python dependencies
- Create `.env` file with configuration
- Start PostgreSQL and create database

### Step 3: Set Up Frontend
- Install npm dependencies

### Step 4: Run the Application
- Start backend server (Terminal 1)
- Start frontend server (Terminal 2)

## Dependent Files
- `backend/main.py` - Main FastAPI application
- `backend/requirements.txt` - Python dependencies
- `frontend/package.json` - Node dependencies
- `frontend/vite.config.js` - Vite configuration with proxy

## Followup Steps
1. Run backend: `cd backend && source venv/bin/activate && uvicorn main:app --reload`
2. Run frontend: `cd frontend && npm run dev`
3. Access at: http://localhost:5173

