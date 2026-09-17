# DermaSmart

AI-powered skin analysis application.
Based on DermaSmart by Ravi Kiran Reddy Bada (https://github.com/Ravikiranreddybada/dermasmart). UI redesigned by Antigravity.

## Features
- Smart Capture image quality gate
- Skin condition classification (MobileNetV2 TFLite)
- Ethical safety intercept for potential emergencies
- Gemini AI powered skincare routines and diet tips

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite 5, TailwindCSS 3, shadcn/ui, Framer Motion |
| Backend | FastAPI, Uvicorn, Motor (MongoDB), OpenCV headless, tflite-runtime |
| ML | MobileNetV2 on Dermnet (23 classes) |
| Deploy | Frontend on Vercel, backend on Render |

## Setup

### Backend
Requires Python 3.11.4.
```bash
./start-backend.sh
```
Env vars needed: `MONGO_URI`, `MONGO_DB_NAME`, `GEMINI_API_KEY`.

### Frontend
```bash
./start-frontend.sh
```
Env vars needed: `VITE_API_URL` (optional: `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`).

## Disclaimer
DermaSmart is an AI-powered educational tool and does not provide medical advice. Results are not a substitute for professional diagnosis or treatment. Always consult a certified dermatologist.
