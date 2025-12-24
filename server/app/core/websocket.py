from __future__ import annotations
from typing import Dict, List
from fastapi import WebSocket
from uuid import UUID
import json

class ConnectionManager:
    def __init__(self):
        # user_id -> list of active connections
        self.active_connections: Dict[UUID, List[WebSocket]] = {}

    async def connect(self, user_id: UUID, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: UUID, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: UUID):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Connection might be closed, it will be handled by disconnect in the websocket loop
                    pass

manager = ConnectionManager()
