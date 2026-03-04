# Smart Bed AI

_Are we optimizing hospital resources with intelligence? Yes!_

## Hackathon Context

This project was built during a hackathon focused on healthcare optimization and real-time resource allocation. The goal was to demonstrate how AI can improve hospital bed management and patient forecasting in a fast-paced environment.

## Project Overview

Smart Bed AI is a system designed to forecast patient admissions, allocate available beds using optimization techniques, and provide a web-based dashboard for hospital staff to manage wards, simulate patient flow, and react to changing conditions.

## Live Demo

A live demo can be accessed at [[https://smart-bed-ai.example.com](https://drive.google.com/file/d/1hL8k_r9xtPHUefhkvhhLKywKAp1bIKPY/view?usp=drivesdk](https://drive.google.com/file/d/1hL8k_r9xtPHUefhkvhhLKywKAp1bIKPY/view?usp=drivesdk)) (replace with real URL when deployed). The demo allows users to log in, view current bed allocations, forecasted demand, and run simulations.

## How It Works

1. **Forecasting**: Historical admission data is fed into a forecaster (likely using ML or time-series models) located in `backend/engine/forecaster.py`.
2. **Allocation**: A Mixed Integer Linear Program (MILP) in `backend/engine/milp_allocator.py` determines optimal bed assignments given predicted demand and ward constraints.
3. **Backend**: FastAPI-based service defined in `backend/main.py` with routers handling allocation, forecasting, patients, wards, and more.
4. **Frontend**: React with Vite (`src/`) presents dashboards, controls, and simulation views.
5. **WebSocket**: Real-time updates are pushed via WebSocket to client dashboards.

## Tech Stack

- **Backend**: Python, FastAPI, Pydantic, SQLAlchemy (presumably), uvicorn
- **Optimization**: MILP solver (could be OR-Tools or similar)
- **Frontend**: TypeScript, React, Vite, TailwindCSS or custom UI components
- **Database**: SQLite/PostgreSQL (check `backend/database.py` for config)
- **Testing**: Pytest for backend (`test_beds_api.py`, others); likely Jest for frontend

## Setup Instructions

1. Clone repo: `git clone <repo-url>`
2. Navigate to backend: `cd backend` and create a virtualenv: `python -m venv venv` then `source venv/bin/activate`.
3. Install dependencies: `pip install -r requirements.txt`.
4. Initialize database: `python seed.py` or run migration scripts.
5. Start backend server: `uvicorn main:app --reload`.
6. Open another terminal for frontend: `cd ../src` and run `npm install && npm run dev`.
7. Visit `http://localhost:3000` (or appropriate port) to access the UI.

## Troubleshooting

- **Cannot connect to database**: Verify `DATABASE_URL` in environment or `backend/database.py` settings.
- **Port conflicts**: Ensure backend and frontend ports (8000 and 3000) are free.
- **Dependency issues**: Run `pip install --upgrade -r requirements.txt` and `npm audit fix`.

## Demo Mode

The application supports a demo mode where sample data is preloaded and user actions are sandboxed. Enable by setting `DEMO_MODE=true` in the environment before starting the backend.

## Demo Controls

Use the web UI to:
- Start/stop patient simulation
- Adjust forecast parameters
- Reset bed allocations
- View historical trends

## Project Structure

```
backend/             # Python API and logic
  engine/            # Forecasting and allocation engines
  routers/           # FastAPI route handlers
  scripts/           # utility scripts
  models.py          # data models
  database.py        # DB configuration
  main.py            # FastAPI application
src/                 # Frontend React application
  components/        # UI components and views
  lib/               # shared utilities
index.html           # main HTML entry
package.json         # frontend dependencies
```

## Environment Variables

- `DATABASE_URL` - connection string for the database
- `DEMO_MODE` - enable demo data and sandbox environment
- `SECRET_KEY` - application secret for signing tokens
- `PORT` - backend server port
- `FRONTEND_URL` - allowed origins for CORS

## Running Tests

- Backend: `pytest` from the project root. See `test_beds_api.py` and `test_quick_add.py`.
- Frontend: `npm run test` inside `src` if tests exist.

## Performance SLAs

- Forecast generation: <500ms per run
- Allocation solver: <1s for typical ward sizes
- API response: <200ms for read operations

## Hard Constraints

- Each ward has a hard bed count limit
- Patients cannot be double-assigned
- Forecasting models must use only past data

## Use Case Story

A nurse logs into the dashboard on a busy morning. She views the forecast, which predicts a surge of admissions in the next 24 hours. Using the simulator, she tests reallocating beds from less-critical wards. The MILP engine suggests an optimal layout, and she approves it. Real-time updates push to all staff screens as patients are admitted, keeping everyone informed.

## Team
- M Tanusree Reddy 
- Nihal DR
- P Devesh Reddy



Thank you for checking out Smart Bed AI! Enhance hospital care with intelligent resource management.
