#!/usr/bin/env bash
# Jalaprahari FastAPI Server Launcher
set -e
cd "$(dirname "$0")/.."
if [ -d "backend/venv" ]; then
    echo "Starting Jalaprahari FastAPI backend on http://127.0.0.1:8000..."
    PYTHONPATH=. backend/venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
else
    echo "Python virtual environment not found in backend/venv. Run: python3 -m venv backend/venv && backend/venv/bin/pip install -r backend/requirements.txt"
    exit 1
fi
