from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Any

from ..database import get_db
from ..models import Ward, Bed

router = APIRouter(prefix="/api", tags=["wards"])

@router.get("/wards")
def get_wards(db: Session = Depends(get_db)):
    wards = db.query(Ward).all()
    result = []
    for w in wards:
        beds = db.query(Bed).filter(Bed.ward_id == w.id).all()
        occupied = sum(1 for b in beds if b.status == "Occupied")
        occupancy_rate = int((occupied / len(beds)) * 100) if beds else 0
        
        result.append({
            "id": w.id,
            "name": w.name,
            "capacity": w.capacity,
            "current_occupancy": occupied,
            "occupancy_rate": occupancy_rate,
            "staff_ratio": w.staff_ratio
        })
    return result

@router.get("/beds")
def get_beds(db: Session = Depends(get_db)):
    beds = db.query(Bed).options(joinedload(Bed.patient)).all()
    result = []
    for b in beds:
        bed_info = {
            "id": b.id,
            "ward_id": b.ward_id,
            "ward_name": b.ward.name if b.ward else "Unknown",
            "bed_type": b.bed_type,
            "status": b.status,
            "patient": None
        }
        
        # Include patient details if assigned
        if b.patient:
            bed_info["patient"] = {
                "id": b.patient.id,
                "name": b.patient.name,
                "age": b.patient.age,
                "condition": b.patient.condition,
                "triage_level": b.patient.triage_level,
                "acuity_score": b.patient.acuity_score,
                "status": b.patient.status,
                "wait_time": b.patient.wait_time
            }
        
        result.append(bed_info)
    return result
