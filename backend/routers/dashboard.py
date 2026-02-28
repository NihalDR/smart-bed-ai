from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import datetime

from ..database import get_db
from ..models import Ward, Bed, Alert

router = APIRouter(prefix="/api", tags=["dashboard"])

@router.get("/dashboard/kpis")
def get_dashboard_kpis(db: Session = Depends(get_db)):
    beds = db.query(Bed).all()
    total_beds = len(beds)
    occupied_beds = sum(1 for b in beds if b.status == "Occupied")
    occupancy_rate = int((occupied_beds / total_beds) * 100) if total_beds > 0 else 0

    icu_beds = [b for b in beds if b.bed_type == "ICU"]
    total_icu = len(icu_beds)
    occupied_icu = sum(1 for b in icu_beds if b.status == "Occupied")
    icu_rate = int((occupied_icu / total_icu) * 100) if total_icu > 0 else 0

    return {
        "total_beds": total_beds,
        "occupied_beds": occupied_beds,
        "occupancy_rate": occupancy_rate,
        "total_icu": total_icu,
        "occupied_icu": occupied_icu,
        "icu_rate": icu_rate,
        "expected_admissions_24h": 145, # Will connect to forecaster
        "avg_wait_time_mins": 18
    }

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(Alert.is_active == True).order_by(Alert.timestamp.desc()).all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "severity": a.severity,
            "timestamp": a.timestamp.isoformat()
        }
        for a in alerts
    ]
