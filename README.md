# Threat Monitor

Threat Monitor is a web-based cybersecurity tool that watches web server access logs, scores suspicious requests, and presents the results in a live investigation dashboard. It is built for small websites and student projects that want practical threat visibility without enterprise tooling.

## What It Does

- Monitors nginx access logs in near real time
- Detects suspicious requests with hybrid rules + ML scoring
- Stores medium and high severity threats for investigation
- Streams live alerts to the frontend over WebSocket
- Shows severity, model scores, recommended actions, and a response playbook
- Supports retraining the detection models from observed events plus synthetic data

## Demo Flow

1. Host a sample static website with local nginx.
2. Point the backend at the nginx access log.
3. Open the frontend dashboard.
4. Send suspicious requests with `curl`.
5. Inspect the detected threats, reasons, and recommended actions.

## Project Structure

- `backend/` FastAPI API, ingestion pipeline, storage, detection, retraining
- `frontend/` React dashboard for alerts, threats, and model status
- `data/local-nginx/` local nginx demo state and log files
- `scripts/local_site_demo.sh` helper script to run a local protected site demo

## Local Setup

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend usually runs at `http://localhost:5173`.

### 2. Backend

Use SQLite for the simplest local demo:

```bash
cd backend
export PATH="/opt/homebrew/bin:$PATH"
DEBUG=false \
DATABASE_URL="sqlite+aiosqlite:///./threat-monitor.db" \
NGINX_LOG_PATH="/absolute/path/to/access.log" \
UV_CACHE_DIR=/private/tmp/uv-cache \
/opt/homebrew/bin/uv run --no-sync python -m app
```

The backend usually runs at `http://localhost:8000`.

### 3. Protected Site Demo

Host any static site locally with nginx:

```bash
./scripts/local_site_demo.sh start /absolute/path/to/site 8088
```

This prints the local site URL and access log path. Use that access log path as `NGINX_LOG_PATH` for the backend.

## Example Test Requests

```bash
curl "http://localhost:8088/login?id=%27%20OR%20%271%27%3D%271"
curl "http://localhost:8088/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E"
```

## Technologies Used

- Backend: Python, FastAPI, SQLModel, SQLAlchemy, Redis, Uvicorn
- Detection: PyTorch, scikit-learn, ONNX Runtime
- Frontend: React, TypeScript, Vite, Zustand, TanStack Query, Sass
- Demo Hosting: nginx

## Submission Notes

- Live website URL: optional for this project because the strongest demo is the protected local nginx site feeding real logs into the detector
- Public repo URL: add after publishing
- Team information: add before submission
