import os
import sys

# Ensure project root is on sys.path so `backend` package can be imported
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, ROOT)

from backend.database import SessionLocal
from backend.models import Patient, Bed
import json

session = SessionLocal()

# Assign queued patients to occupied beds without a patient
patients = session.query(Patient).filter(Patient.status=='In Queue').order_by(Patient.acuity_score.desc()).all()
beds = session.query(Bed).filter(Bed.status=='Occupied').all()
empty_occupied = [b for b in beds if not b.current_patient]

assignments = []
for p, b in zip(patients, empty_occupied):
    p.assigned_bed_id = b.id
    p.status = 'Assigned'
    b.current_patient = p
    session.add(p)
    session.add(b)
    assignments.append({'patient_id': p.id, 'patient_name': p.name, 'bed_id': b.id})

session.commit()

# Print first 12 beds with patient info
beds_all = session.query(Bed).limit(12).all()
out = []
for b in beds_all:
    out.append({
        'id': b.id,
        'status': b.status,
        'patient_id': b.current_patient.id if b.current_patient else None,
        'patient_name': b.current_patient.name if b.current_patient else None,
        'patient_triage_level': b.current_patient.triage_level if b.current_patient else None,
        'patient_acuity_score': b.current_patient.acuity_score if b.current_patient else None
    })

print('Assigned:', json.dumps(assignments, indent=2))
print('Sample beds:', json.dumps(out, indent=2))

session.close()
