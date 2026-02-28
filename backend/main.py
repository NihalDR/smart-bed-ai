from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import dashboard, wards, patients, simulator, allocation, forecast, auth, websocket

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SmartBed AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(wards.router)
app.include_router(patients.router)
app.include_router(simulator.router)
app.include_router(allocation.router)
app.include_router(forecast.router)
app.include_router(websocket.router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
