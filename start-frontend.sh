#!/bin/bash
cd frontend
[ -d node_modules ] || npm install
[ -f .env ] || cp .env.example .env
npm run dev
