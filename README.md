# DermaSmart

DermaSmart is an AI-powered skin analysis web application. This repository contains a FastAPI backend, a React + TypeScript frontend (Vite + Tailwind), and a MobileNetV2-derived TFLite model for inferencing.

**Important:** The TFLite model binary is not included in this repository. See `model/README.md` for download instructions.

**Quick start (two terminals):**

Backend:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit backend/.env with your MongoDB URI and Gemini API key
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
# Optionally set VITE_API_URL
npm run dev
```

Docker (recommended for a consistent development environment):

```bash
# Build and start backend + local MongoDB
docker-compose up --build

# Backend will be available at http://localhost:8000
```

Environment variables:

- Backend: `MONGO_URI`, `MONGO_DB_NAME`, `GEMINI_API_KEY` (see `backend/.env.example`)
- Frontend: `VITE_API_URL`, `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID` (see `frontend/.env.example`)

API (summary):

- `GET /` — health check
- `POST /validate-face` — multipart form with `image` file → `{ valid: true }` or `{ valid: false, reason }`
- `POST /userInfo` — multipart form with `image`, `name`, `skin_type`, `age`, `email` → analysis response JSON
- `POST /api/analyses/{id}/feedback` — JSON `{ is_accurate: boolean, comments: string }`
- `GET /api/analyses/{id}`, `GET /api/analyses/user/{email}`, `POST /api/users/`, `GET /api/users/{id}` — user & analysis endpoints

Medical disclaimer:

DermaSmart is an AI-powered educational tool and does not provide medical advice. Results are not a substitute for professional diagnosis or treatment. Always consult a certified dermatologist.

Credits:

Based on DermaSmart by Kranthi Kumar (https://github.com/Kranthi1205/DermaSmart). UI redesigned.
