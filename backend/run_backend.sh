#!/bin/bash

# Navigate to backend directory
cd "$(dirname "$0")"

# Activate venv and run server
echo "Starting Jam Station Backend on port 8000..."
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
