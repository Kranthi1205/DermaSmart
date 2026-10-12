# Root-level Dockerfile so a Render service using the default Dockerfile path
# (./Dockerfile, build context = repo root) finds one. Identical to
# backend/Dockerfile; keep the two in sync.

FROM python:3.11-slim

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    ca-certificates \
    ffmpeg \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Works whether the build context is the repo root (docker-compose, CI) or the
# backend/ folder (a Render service with Root Directory set to "backend").
# Hard-coding "./backend/..." paths made the Render build fail within seconds
# when the context was backend/.
COPY . /ctx
RUN if [ -f /ctx/backend/requirements.txt ]; then cp -a /ctx/backend/. /app/; else cp -a /ctx/. /app/; fi \
    && rm -rf /ctx

RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r /app/requirements.txt

EXPOSE 8000

# Render injects PORT; fall back to 8000 for local Docker.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
