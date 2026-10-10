# Jalaprahari (जलप्रहरी)
### AI-Powered First-Flush Plastic Risk Intelligence Platform

Jalaprahari is a predictive urban environmental intelligence platform engineered to prevent plastic waste and urban debris from discharging into water bodies during monsoon first-flush events.

---

## Architecture Overview

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons (Deploys to **Vercel**)
- **Backend API**: Python FastAPI + Uvicorn + Pydantic (Deploys to **Render**)
- **Risk Computation**: Continuous multi-factor heuristic assessment (drain priority, antecedent dry days, rainfall intensity, historical blockage, and catchment run-off).

---

## Deployment Guide

### 1. Backend Deployment (Render)

You can deploy the backend to Render either using the included Blueprint (`render.yaml`) or as a manual Web Service:

#### Option A: Manual Web Service
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository (`jalaprahari`).
4. Configure the settings:
   - **Name**: `jalaprahari-api` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://jalaprahari-api.onrender.com`).

#### Option B: Render Blueprint
1. Click **New +** > **Blueprint**.
2. Select your repository. Render will automatically read `render.yaml` and configure the service.
3. Click **Apply**.

---

### 2. Frontend Deployment (Vercel)

1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** > **Project** and import your GitHub repository (`jalaprahari`).
3. Vercel automatically detects **Vite** via `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-render-backend-name>.onrender.com` (Your Render Web Service URL from Step 1)
5. Click **Deploy**.

---

## Local Development

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+

### Start Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend runs at `http://localhost:8000` (docs at `http://localhost:8000/docs`).

### Start Frontend
```bash
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`. Vite automatically proxies `/api` calls to `http://localhost:8000`.

---

## Testing

Run frontend build check:
```bash
npm run build
```

Run backend test suite:
```bash
cd backend
venv/bin/pytest tests/ -v
```
