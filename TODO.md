# Hosting on Render - TODO

## ✅ Completed:
- [x] 1. Fix render.yaml build commands for backend
- [x] 2. Make pytesseract optional (graceful fallback) in main.py
- [x] 3. Fix CORS configuration for production
- [x] 4. Update frontend build command in render.yaml
- [x] 5. Push changes to GitHub
- [x] 6. Add Vercel configuration (vercel.json)
- [x] 7. Update vite.config.js for production API

## 🚀 Next Steps - Manual Deployment Required:

### For Backend (Render):
1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL**
3. Create database: `handwriting-db`
4. Click **New +** → **Web Service**
5. Connect GitHub repo: `abdulahi-banji/Handwriting-Intelligence-Platform`
6. Configure:
   - Name: `handwriting-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Add Environment Variables:
   - SECRET_KEY: (generate secure random string)
   - GEMINI_API_KEY: (optional - from Google AI Studio)
   - CORS_ORIGINS: https://handwriting-frontend.vercel.app
8. Add from Database: Select `handwriting-db`
9. Click **Create Web Service**

### For Frontend (Vercel):
1. Go to https://vercel.com/new
2. Import GitHub repo: `abdulahi-banji/Handwriting-Intelligence-Platform`
3. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable:
   - VITE_API_URL: https://handwriting-backend.onrender.com/api
5. Click **Deploy**

