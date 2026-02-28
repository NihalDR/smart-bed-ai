from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
import datetime

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String) # admin, nurse, manager

class Ward(Base):
    __tablename__ = "wards"

    id = Column(String, primary_key=True, index=True) # UUID string
    name = Column(String, index=True)
    capacity = Column(Integer)
    staff_ratio = Column(Float)
    
    beds = relationship("Bed", back_populates="ward")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True) # UUID string
    name = Column(String)
    age = Column(Integer)
    condition = Column(String)
    triage_level = Column(String) # Red, Yellow, Green
    acuity_score = Column(Integer)
    admission_time = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String) # In Queue, Assigned, Discharged
    wait_time = Column(Integer, default=0) # minutes waiting
    
    # Relational reference -- bed will have the FK
    assigned_bed = relationship("Bed", back_populates="patient", uselist=False)

class Bed(Base):
    __tablename__ = "beds"

    id = Column(String, primary_key=True, index=True) # UUID string
    ward_id = Column(String, ForeignKey("wards.id"))
    bed_type = Column(String) # ICU, General, Step-Down
    status = Column(String) # Available, Occupied, Cleaning, Maintenance
    
    # Foreign key to patient
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True)
    
    ward = relationship("Ward", back_populates="beds")
    patient = relationship("Patient", back_populates="assigned_bed", uselist=False)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    severity = Column(String) # info, warning, critical
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)
