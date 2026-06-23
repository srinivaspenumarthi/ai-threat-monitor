# Threat Monitor

Threat Monitor is a web-based cybersecurity tool that monitors web server access logs, detects suspicious requests, and presents the results in a live investigation dashboard. It is designed for small websites, student projects, and lightweight deployments that want practical threat visibility without enterprise security tooling.

## Why It Matters

Small websites still receive suspicious traffic such as login abuse, XSS payloads, path traversal attempts, and encoded injection requests. Most of them have logs, but not a clear way to turn those logs into security insight. Threat Monitor closes that gap by turning raw nginx access logs into a live threat investigation workflow.

## What It Does

- Monitors nginx access logs in near real time
- Detects suspicious requests with hybrid rules + machine learning scoring
- Stores medium and high severity threats for investigation
- Streams live alerts to the frontend over WebSocket
- Shows severity, model scores, recommended actions, and a response playbook
- Supports retraining the detection models from observed events plus synthetic data

## Key Features

- Live dashboard with severity distribution, top source IPs, and attacked paths
- Searchable threat investigation table with filter controls
- Threat detail panel with payload visibility, detector scores, explanations, and response guidance
- Hybrid detection engine combining rules with retrainable ML models
- Local protected-site demo workflow using nginx access logs

## Screens To Expect

- `Dashboard` for live detection overview
- `Threats` for investigation and event review
- `Models` for active model status, metrics, and retraining

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

## Quick Start

### Requirements

- Python 3.14+
- Node.js 20+
- npm
- nginx
- `uv` installed at `/opt/homebrew/bin/uv` or available on your `PATH`

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Start the protected sample site

```bash
cd ..
./scripts/local_site_demo.sh start /absolute/path/to/site 8088
```

This prints the local site URL and the nginx access log path. Keep that access log path for the backend step below.

### 3. Start the backend

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

### 4. Start the frontend

```bash
cd ../frontend
npm run dev
```

The frontend usually runs at `http://localhost:5173`.

### 5. Send test traffic

```bash
curl "http://localhost:8088/login?id=%27%20OR%20%271%27%3D%271"
curl "http://localhost:8088/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E"
```

Then open the frontend and inspect the newest threat entries.

## Local Setup Details

### Frontend

```bash
cd frontend
npm run dev
```

The frontend usually runs at `http://localhost:5173`.

### Backend

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

### Protected Site Demo

Host any static site locally with nginx:

```bash
./scripts/local_site_demo.sh start /absolute/path/to/site 8088
```

This prints the local site URL and access log path. Use that access log path as `NGINX_LOG_PATH` for the backend.

## Example Test Requests

```bash
curl "http://localhost:8088/login?id=%27%20OR%20%271%27%3D%271"
curl "http://localhost:8088/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E"
curl "http://localhost:8088/view?page=..%2F..%2Fsecret.txt"
```

## How Detection Works

1. nginx writes incoming requests to an access log.
2. Threat Monitor tails the log in near real time.
3. Requests are parsed into structured events.
4. Rule-based checks and ML models score the request.
5. Medium and high severity events are stored and streamed to the frontend.
6. The UI explains why the request was flagged and suggests what to do next.

## Technologies Used

- Backend: Python, FastAPI, SQLModel, SQLAlchemy, Redis, Uvicorn
- Detection: PyTorch, scikit-learn, ONNX Runtime
- Frontend: React, TypeScript, Vite, Zustand, TanStack Query, Sass
- Demo Hosting: nginx

## Repository Notes

- The strongest demo flow is a local nginx-hosted site feeding real access logs into the detector.
- The frontend, backend, and demo helper script are all included in this repository.
- Submission-specific text is available in `SUBMISSION.md`.
