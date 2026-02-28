import uuid
import datetime
import random
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import Ward, Bed, Patient, User, Alert
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()

    # 1. Users
    users = [
        User(email="admin@smartbed.ai", hashed_password=hash_password("admin123"), full_name="System Admin", role="admin"),
        User(email="nurse@smartbed.ai", hashed_password=hash_password("nurse123"), full_name="Triage Nurse", role="nurse"),
        User(email="manager@smartbed.ai", hashed_password=hash_password("manager123"), full_name="Bed Manager", role="manager"),
    ]
    db.add_all(users)

    # 2. Wards
    ward_names = ['ICU', 'Emergency', 'Cardiology', 'Neurology', 'Pediatrics', 'Oncology', 'Orthopedics', 'General']
    ward_capacities = [50, 100, 40, 30, 60, 40, 60, 120]
    ward_types = ['ICU', 'General', 'General', 'Step-Down', 'General', 'Step-Down', 'General', 'General']
    
    wards = []
    beds = []
    
    for i, name in enumerate(ward_names):
        ward_id = str(uuid.uuid4())
        ward = Ward(
            id=ward_id,
            name=name,
            capacity=ward_capacities[i],
            staff_ratio=0.2 if name == 'ICU' else 0.1
        )
        wards.append(ward)
        
        # Populate Beds
        for j in range(ward_capacities[i]):
            bed_id = f"{name[:3].upper()}-{j+1}"
            
            # Determine initial occupancy based on ward type (simulating high load)
            is_occupied = random.random() < (0.92 if name == 'ICU' else 0.85)
            
            bed = Bed(
                id=bed_id,
                ward_id=ward_id,
                bed_type=ward_types[i],
                status="Occupied" if is_occupied else "Available"
            )
            beds.append(bed)

    db.add_all(wards)
    db.add_all(beds)

    # 3. Triage Queue Patients with hackathon demo patients
    patients = [
        # Demo patients - high acuity
        Patient(id="P-2001", name="Ramesh Kumar", age=58, condition="Severe myocardial infarction", triage_level="Red", acuity_score=9, status="In Queue", wait_time=42),
        Patient(id="P-2002", name="Arjun Patel", age=74, condition="Acute respiratory distress", triage_level="Red", acuity_score=8, status="In Queue", wait_time=55),
        Patient(id="P-2003", name="Priya Sharma", age=32, condition="Moderate internal bleeding", triage_level="Yellow", acuity_score=6, status="In Queue", wait_time=28),
        Patient(id="P-2004", name="Meera Nair", age=41, condition="Minor fracture", triage_level="Green", acuity_score=3, status="In Queue", wait_time=12),
        # Original patients
        Patient(id="P-1042", name="John Doe", age=65, condition="Cardiac Arrest", triage_level="Red", acuity_score=98, status="In Queue", wait_time=0),
        Patient(id="P-1045", name="Jane Smith", age=42, condition="Severe Trauma", triage_level="Red", acuity_score=95, status="In Queue", wait_time=0),
        Patient(id="P-1038", name="Robert Chen", age=55, condition="Respiratory Distress", triage_level="Yellow", acuity_score=72, status="In Queue", wait_time=0),
        Patient(id="P-1041", name="Emily Davis", age=28, condition="Fractured Femur", triage_level="Yellow", acuity_score=65, status="In Queue", wait_time=0),
        Patient(id="P-1035", name="Michael Brown", age=34, condition="Mild Concussion", triage_level="Green", acuity_score=35, status="In Queue", wait_time=0),
    ]
    db.add_all(patients)
    db.flush()  # Flush to ensure patients are in session
    
    # 4. Initial Alerts
    alerts = [
        Alert(title="ICU Surge Warning", description="92% occupancy. Predicted to hit 100% in 4 hours. Recommend preemption protocol.", severity="warning"),
        Alert(title="Optimization Complete", description="RL Agent reallocated 12 beds, reducing wait time by 4 mins.", severity="info")
    ]
    db.add_all(alerts)

    db.commit()
    db.close()
    print("Database seeded successfully with demo data.")

if __name__ == "__main__":
    seed_data()
