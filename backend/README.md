# Backend

This folder contains the FastAPI backend for DermaSmart.

Quick start:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MongoDB URI and Gemini API key
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Notes:
- Place the TFLite model file at `backend/model/tf_model.tflite` (see `../model/README.md` for download links).
- If `tflite-runtime` fails to install on your OS, consider using WSL or deploying on Render with Python 3.11.
