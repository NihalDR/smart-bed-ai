import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .dashboard import get_dashboard_kpis
from ..database import SessionLocal

router = APIRouter(tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections.copy():
            try:
                await connection.send_json(message)
            except Exception:
                self.active_connections.remove(connection)

manager = ConnectionManager()

@router.websocket("/ws/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Broadcast latest KPIs every 10 seconds
            db = SessionLocal()
            try:
                kpis = get_dashboard_kpis(db)
                await manager.broadcast({"type": "UPDATE_KPI", "payload": kpis})
            finally:
                db.close()
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
