from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
import uuid
from datetime import datetime

from ..database import get_db
from ..models import Patient, Bed

router = APIRouter(prefix="/api/patients", tags=["patients"])

class AssignRequest(BaseModel):
    bed_id: str

class CreatePatientRequest(BaseModel):
    name: str
    age: int
    condition: str
    triage_level: str  # Red, Yellow, Green
    acuity_score: int

@router.get("/queue")
def get_patient_queue(db: Session = Depends(get_db)):
    patients = db.query(Patient).filter(Patient.status == "In Queue").order_by(Patient.acuity_score.desc()).all()
    
    result = []
    for p in patients:
        result.append({
            "id": p.id,
            "name": p.name,
            "age": p.age,
            "condition": p.condition,
            "triage_level": p.triage_level,
            "acuity_score": p.acuity_score,
            "wait_time": "14m", # Mock calculate based on admission time
            "recommended_bed": "Pending..." # To be filled by MILP
        })
    return result

@router.post("/{patient_id}/assign")
def assign_patient(patient_id: str, payload: AssignRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    bed = db.query(Bed).filter(Bed.id == payload.bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
        
    if bed.status == "Occupied" and bed.patient:
        raise HTTPException(status_code=400, detail="Bed is already occupied")
        
    # Update Bed
    bed.status = "Occupied"
    bed.patient_id = patient.id
    
    # Update Patient
    patient.status = "Assigned"
    
    db.commit()
    
    return {"status": "success", "patient_id": patient_id, "bed_id": bed.id}

@router.post("")
def create_patient(payload: CreatePatientRequest, db: Session = Depends(get_db)):
    # Generate unique patient ID
    patient_id = f"P-{uuid.uuid4().hex[:6].upper()}"
    
    new_patient = Patient(
        id=patient_id,
        name=payload.name,
        age=payload.age,
        condition=payload.condition,
        triage_level=payload.triage_level,
        acuity_score=payload.acuity_score,
        status="In Queue",
        wait_time=0,
        admission_time=datetime.utcnow()
    )
    
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    
    return {
        "id": new_patient.id,
        "name": new_patient.name,
        "age": new_patient.age,
        "condition": new_patient.condition,
        "triage_level": new_patient.triage_level,
        "acuity_score": new_patient.acuity_score,
        "status": new_patient.status,
        "wait_time": new_patient.wait_time
    }
