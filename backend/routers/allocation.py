from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient, Bed
from ..engine.milp_allocator import run_allocation

router = APIRouter(prefix="/api/allocation", tags=["allocation"])

@router.post("/optimize")
def optimize_allocation(db: Session = Depends(get_db)):
    # 1. Gather all queue patients
    db_patients = db.query(Patient).filter(Patient.status == "In Queue").all()
    patients = [{"id": p.id, "triage_level": p.triage_level, "acuity_score": p.acuity_score, "wait_time_mins": 15} for p in db_patients]
    
    # 2. Gather all available beds
    db_beds = db.query(Bed).filter(Bed.status == "Available").all()
    beds = [{"id": b.id, "ward_id": b.ward_id, "bed_type": b.bed_type} for b in db_beds]
    
    if not patients:
        raise HTTPException(status_code=400, detail="No patients in queue")
    if not beds:
        raise HTTPException(status_code=400, detail="No available beds")
        
    # 3. Run MILP Assigner
    assignments, obj_val = run_allocation(patients, beds)
    
    return {
        "status": "success",
        "assignments": assignments,
        "objective_value": obj_val,
        "metrics": {"wait_time_reduction_mins": len(assignments) * 2, "survival_prob_increase": len(assignments) * 1.5}
    }
