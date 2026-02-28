# SmartBed AI - Architecture

## System Overview
SmartBed AI solves the complex NP-Hard problem of dynamic hospital bed allocation using AI optimization.

## The Stack
- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Backend API**: Python FastAPI
- **Database**: SQLite (SQLAlchemy ORM)
- **Real-Time**: FastAPI WebSockets
- **Optimization Engine**: PuLP (MILP Solver using CBC backend)
- **Forecasting**: statsmodels (`ARIMA` algorithm)

## AI / ML Implementation Details

### 1. Mixed-Integer Linear Programming (MILP) Allocator
The core engine (`/backend/engine/milp_allocator.py`) handles the ED Triage queue.
- **Goal:** Maximally allocate incoming patients to available beds.
- **Objective Function:** Maximize patient survival probability while minimizing wait time penalty.
- **Constraints:**
  1. A patient can be assigned to at most one bed.
  2. A bed can hold at most one patient.
  3. Strict Acuity matching (Red triage cannot go to General Wards).
- **Tooling:** Uses the open-source `PuLP` library.

### 2. Time-Series Forecasting (ARIMA)
The forecasting engine (`/backend/engine/forecaster.py`) projects the upcoming 7 days of hospital emergency admissions.
- **Model:** ARIMA (AutoRegressive Integrated Moving Average).
- **Data:** Trained dynamically on 60 days of synthetic historical records including weekly seasonality (weekend dips).
- **Output:** Returns forecasted daily admissions bounded by a 95% Confidence Interval. 
- **Use Case:** Used in the `AI Predictions` view to warn administrators of incoming surges before they happen.

## Database Schema (SQLAlchemy)
Located in `backend/models.py`:
- `User`: Roles (admin, nurse, manager) with bcrypt hashed passwords.
- `Patient`: Stores triage_level, acuity_score, wait_time.
- `Ward` & `Bed`: Track real-time unit availability.
- `Alert`: Real-time system notifications pushed to UI.

## File Structure
```
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── database.py          # SQLite setup
│   ├── models.py            # SQLAlchemy schemas
│   ├── seed.py              # Mock data generator
│   ├── engine/              # ML Models (ARIMA, MILP)
│   └── routers/             # API Endpoints (Auth, Dashboard, Allocator, WebSockets)
└── src/                     # React Frontend
    ├── components/
    │   └── views/           # Main UI sections (Dashboard, Triage, etc)
    ├── App.tsx              # Main wrapper + Sidebar + Dark Mode Layout
    └── index.css            # Tailwind + Glassmorphism Custom Variables
```
