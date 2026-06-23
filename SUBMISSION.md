# Devpost Submission Draft

## Project Name

Threat Monitor

## Project Description

Threat Monitor is a web-based cybersecurity solution that helps small website owners understand and respond to suspicious traffic hitting their applications. The system monitors nginx access logs, parses incoming requests, and scores them using a hybrid detection pipeline that combines rule-based checks with machine learning models. Medium and high severity events are stored and presented in a live dashboard where users can inspect request details, review model scores, understand why a request was flagged, and follow recommended response steps.

The project is designed to make threat monitoring more accessible for student projects, personal websites, and lightweight deployments that may not have access to expensive security tools. In the demo setup, a sample static website is hosted locally with nginx, and Threat Monitor watches the site’s real access logs. When suspicious requests such as encoded SQL injection or XSS-style payloads are sent to the site, they are detected and shown in the frontend in near real time.

Threat Monitor also includes retrainable machine learning models, allowing the system to adapt to new traffic patterns using stored events plus supplemental synthetic attack data. This makes the project more than a static dashboard: it is a lightweight threat detection and investigation layer for web traffic.

## Live Website URL

Optional. Best demo uses a local nginx-hosted site connected to live access logs.

## Public Source Code Repository

Add your GitHub or GitLab link here.

## Demo Video

Record a 2-5 minute video covering:

1. Protected sample site running on nginx
2. Threat Monitor dashboard open
3. Suspicious request sent with `curl`
4. Live alert appears
5. Threat detail panel shows severity, scores, reasons, and response steps
6. Models page shows hybrid detection and retraining support

## Screenshots To Capture

1. Dashboard overview
2. Threats table with detected requests
3. Threat detail panel with recommended action
4. Models page with loaded models and metrics
5. Local nginx site being monitored

## Installation and Usage

See `README.md`.

## Technologies Used

- Python
- FastAPI
- SQLModel / SQLAlchemy
- Redis
- PyTorch
- scikit-learn
- ONNX Runtime
- React
- TypeScript
- Vite
- Zustand
- TanStack Query
- Sass
- nginx

## Team Information

Add team member names here before submission.
