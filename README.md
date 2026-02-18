# JanSoochna

Crowdsourced Civic Issue Reporting & Resolution Platform

This repository contains a minimal scaffold for JanSoochna: backend (Node/Express + Socket.IO), a placeholder frontend, an AI microservice folder, infra with docker-compose, and an initial SQL schema.

Next steps:
- Implement authentication and RBAC in `backend`
- Build React frontend in `frontend`
- Implement AI services in `ai`

Local development (recommended):

Start full stack in dev mode (frontend Vite server, backend, MySQL, Redis):

```powershell
cd infra
docker-compose up --build
```

To use the frontend dev server (hot reload) the repository includes `docker-compose.override.yml` which runs the Vite server on port `5173`. Access the app at `http://localhost:5173` during development.

To run production-like stack (frontend built and served by nginx) use `docker-compose -f docker-compose.yml up --build` and open `http://localhost`.

Helpers:
- PowerShell helper: `run-dev.ps1` (Windows PowerShell) — starts the stack and runs smoke tests.
- Bash helper: `run-dev.sh` (WSL / macOS / Linux) — starts the stack and runs smoke tests.

Run (Bash):
```bash
cd e:/finalyearproject/jan
./run-dev.sh
```

Run (PowerShell):
```powershell
cd e:/finalyearproject/jan
.\run-dev.ps1
```
