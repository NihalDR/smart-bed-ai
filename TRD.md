# Technical Requirements Document (TRD)
## Smart Hospital Bed Allocation System

### 1. System Architecture
The Smart Hospital Bed Allocation System is designed as a scalable, modern web application.

#### 1.1. Frontend
- **Framework:** React 19 with Vite.
- **Styling:** Tailwind CSS 4.
- **Components:** Radix UI primitives (via shadcn/ui patterns) for accessible, customizable components.
- **Data Visualization:** Recharts for responsive, interactive charts (Area, Line, Composed).
- **Icons:** Lucide React.
- **State Management:** React Context / Hooks for local state; potentially React Query for API data fetching in production.

#### 1.2. Backend (Conceptual / Future Implementation)
- **API Layer:** FastAPI (Python) or Express (Node.js).
- **Database:** PostgreSQL for relational data (Patients, Beds, Wards, Staff).
- **Caching:** Redis for real-time occupancy state and rate limiting.
- **Machine Learning Pipeline:** Scikit-learn, PyTorch, or TensorFlow for model training and inference.

### 2. Machine Learning Models
The system relies on two primary AI components:

#### 2.1. Forecasting (Time-Series)
- **Model:** Hybrid LSTM (Long Short-Term Memory) and XGBoost.
- **Inputs:** Historical admission rates, weather data, local event calendars, public health alerts.
- **Outputs:** Hourly and daily predicted admissions with 95% confidence intervals.
- **Metrics:** RMSE (Root Mean Square Error), MAE (Mean Absolute Error).

#### 2.2. Optimization Engine (Allocation)
- **Algorithm:** Mixed-Integer Linear Programming (MILP) or Reinforcement Learning (RL).
- **Objective Function:** Maximize survival probability, minimize total wait time, and balance staff workload variance.
- **Constraints:**
  - Hard: ICU Capacity ≤ Max Beds.
  - Hard: Patient Acuity must match Bed Capability (e.g., Red triage requires ICU or Step-Down).
  - Soft: Staff Workload Variance < 15%.

### 3. API Specifications (External Integrations)
The system requires integration with external EHR systems (e.g., Epic, Cerner) via RESTful APIs.

#### 3.1. Authentication
- **Method:** OAuth 2.0 or API Key (Bearer Token).
- **Security:** All API communication must be over HTTPS (TLS 1.2+).

#### 3.2. Core Endpoints
- `GET /api/v1/admissions/current`: Fetch real-time ED admissions.
- `GET /api/v1/beds/status`: Retrieve current occupancy across all wards.
- `POST /api/v1/allocation/optimize`: Trigger the MILP engine to calculate optimal bed assignments for the current queue.
- `POST /api/v1/alerts/webhook`: Send surge or capacity alerts to external systems (e.g., Twilio, PagerDuty).

### 4. Data Models (Schema)
#### 4.1. Patient
- `id` (UUID, Primary Key)
- `name` (String)
- `age` (Integer)
- `condition` (String)
- `triage_level` (Enum: Red, Yellow, Green)
- `acuity_score` (Integer: 0-100)
- `admission_time` (Timestamp)

#### 4.2. Bed
- `id` (UUID, Primary Key)
- `ward_id` (UUID, Foreign Key)
- `type` (Enum: ICU, General, Step-Down)
- `status` (Enum: Available, Occupied, Cleaning, Maintenance)
- `current_patient_id` (UUID, Foreign Key, Nullable)

#### 4.3. Ward
- `id` (UUID, Primary Key)
- `name` (String)
- `capacity` (Integer)
- `current_occupancy` (Integer)
- `staff_ratio` (Float)

### 5. Security & Compliance
- **HIPAA Compliance:** All Protected Health Information (PHI) must be encrypted at rest (AES-256) and in transit (TLS 1.2+).
- **Access Control:** Role-Based Access Control (RBAC) for Administrators, Triage Nurses, and Bed Managers.
- **Audit Logging:** All bed allocations, preemption events, and system configuration changes must be logged with timestamps and user IDs.
- **Data Anonymization:** ML models must be trained on de-identified data to prevent PHI leakage.

### 6. Deployment Strategy
- **Containerization:** Docker for consistent environments across development, testing, and production.
- **Orchestration:** Kubernetes (EKS/AKS/GKE) for scaling microservices (Frontend, API, ML Inference).
- **CI/CD:** GitHub Actions or GitLab CI for automated testing, linting, and deployment.
