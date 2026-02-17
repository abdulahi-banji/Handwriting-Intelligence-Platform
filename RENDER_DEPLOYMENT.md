# Deploy to Render - Step by Step Guide

This guide will help you deploy the Handwriting Intelligence Platform to Render.

## Prerequisites
- A [Render](https://render.com) account
- A [GitHub](https://github.com) repository with your code pushed

## Option 1: Deploy via Render Dashboard (Recommended)

### Step 1: Create PostgreSQL Database
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `handwriting-db`
   - **Database Name**: `handwriting_db`
   - **User**: `postgres`
4. Click **Create Database**
5. Wait for the database to be ready, then copy the **Internal Connection String**

### Step 2: Deploy Backend
1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `handwriting-backend`
   - **Region**: Oregon (or your preferred region)
   - **Branch**: `main`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app --workers 4 --bind 0.0.0.0:$PORT`
4. Add Environment Variables:
   - `DATABASE_URL`: (paste the PostgreSQL connection string from Step 1)
   - `SECRET_KEY`: (generate a secure random string)
   - `GEMINI_API_KEY`: (your Google Gemini API key - optional)
   - `CORS_ORIGINS`: `https://your-frontend-name.onrender.com`
5. Click **Create Web Service**

### Step 3: Deploy Frontend
1. Click **New +** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `handwriting-frontend`
   - **Region**: Oregon
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish directory**: `frontend/dist`
4. Add Environment Variables:
   - `VITE_API_URL`: `https://handwriting-backend.onrender.com/api`
5. Click **Create Static Site**

### Step 4: Update Backend CORS
1. After frontend is deployed, go to your backend service on Render
2. Update `CORS_ORIGINS` to include your frontend URL:
   - `CORS_ORIGINS`: `https://handwriting-frontend.onrender.com,https://handwriting-backend.onrender.com`
3. Click **Save Changes**

## Option 2: Deploy via render.yaml (Automatic)

You can use the `render.yaml` file for automatic deployments:

1. Push all changes to GitHub
2. Log in to Render
3. Click **New +** → **Blueprint**
4. Select your GitHub repository
5. Render will detect the `render.yaml` file
6. Fill in the required environment variables when prompted
7. Click **Apply Blueprint**

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SECRET_KEY` | JWT signing key (use a strong random string) | Yes |
| `GEMINI_API_KEY` | Google Gemini API key for AI features | No |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | Yes |
| `RENDER_EXTERNAL_URL` | Auto-set by Render | Auto |

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL (e.g., https://handwriting-backend.onrender.com/api) | No (for dev) |

## Testing Your Deployment

1. Visit your frontend URL: `https://handwriting-frontend.onrender.com`
2. Try registering a new account
3. Try logging in
4. Test uploading a handwriting sample
5. Test creating a note

## Troubleshooting

### CORS Errors
- Make sure `CORS_ORIGINS` includes your frontend URL
- The frontend URL must be exact (including https://)

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Make sure PostgreSQL is ready (green status)

### 500 Errors
- Check Render logs for detailed error messages
- Ensure all required environment variables are set

### Static Files Not Loading
- Make sure build command completed successfully
- Verify the publish directory is correct (`frontend/dist`)

## Important Notes

1. **Tesseract OCR**: The current setup uses `pytesseract` which requires Tesseract installed. Render's Python build environment may not have Tesseract. You may need to either:
   - Use a pre-installed Tesseract environment
   - Remove OCR functionality for now
   - Use an external OCR API

2. **Gemini API**: For AI features, you need a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **Free Tier Limits**: Render's free tier has limitations. Make sure to check the current limits on [Render's pricing page](https://render.com/pricing).

