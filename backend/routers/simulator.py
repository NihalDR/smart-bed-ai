from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/simulator", tags=["simulator"])

class SimRequest(BaseModel):
    acuity_modifier: float
    inflow_modifier: float
    staff_availability: float

@router.post("/run")
def run_simulation(payload: SimRequest):
    # Mock data output for Phase 2
    # Will be connected to an actual simulator logic later
    if payload.inflow_modifier >= 1.5:
        data = [
            {"hour": "0", "occupancy": 70, "capacity": 100},
            {"hour": "4", "occupancy": 85, "capacity": 100},
            {"hour": "8", "occupancy": 98, "capacity": 100},
            {"hour": "12", "occupancy": 115, "capacity": 100},
            {"hour": "16", "occupancy": 125, "capacity": 100},
            {"hour": "20", "occupancy": 110, "capacity": 100},
            {"hour": "24", "occupancy": 95, "capacity": 100},
        ]
        metrics = {
            "max_occupancy_pct": 125,
            "avg_wait_mins": 145,
            "patients_diverted": 42
        }
    else:
        # baseline or accident default
        data = [
            {"hour": "0", "occupancy": 70, "capacity": 100},
            {"hour": "4", "occupancy": 75, "capacity": 100},
            {"hour": "8", "occupancy": 82, "capacity": 100},
            {"hour": "12", "occupancy": 88, "capacity": 100},
            {"hour": "16", "occupancy": 92, "capacity": 100},
            {"hour": "20", "occupancy": 85, "capacity": 100},
            {"hour": "24", "occupancy": 78, "capacity": 100},
        ]
        metrics = {
            "max_occupancy_pct": 92,
            "avg_wait_mins": 25,
            "patients_diverted": 0
        }
    return {"status": "success", "timeline": data, "metrics": metrics}
