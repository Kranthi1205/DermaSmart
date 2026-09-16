#!/bin/bash
echo "Starting DermaSmart Backend..."
cd backend
if [ ! -d "venv" ]; then python3 -m venv venv; fi
source venv/bin/activate
pip install -r requirements.txt -q
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Edit backend/.env with MongoDB URI and Gemini API key, then run again."
  exit 1
fi
uvicorn main:app --reload --host 0.0.0.0 --port 8000
