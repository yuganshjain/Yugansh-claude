#!/bin/bash
# ReviewAI — Start both backend and frontend

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# Setup backend
if [ ! -f "$BACKEND/.env" ]; then
  echo "Creating .env from example..."
  cp "$ROOT/.env.example" "$BACKEND/.env"
  echo "Add your ANTHROPIC_API_KEY to backend/.env then re-run."
fi

if [ ! -d "$BACKEND/venv" ]; then
  echo "Creating Python venv..."
  python3 -m venv "$BACKEND/venv"
  source "$BACKEND/venv/bin/activate"
  pip install -r "$BACKEND/requirements.txt" -q
else
  source "$BACKEND/venv/bin/activate"
fi

# Setup frontend
if [ ! -d "$FRONTEND/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd "$FRONTEND" && npm install -s
fi

echo ""
echo "Starting ReviewAI..."
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo ""

# Start backend in background
cd "$BACKEND"
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
cd "$FRONTEND"
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
