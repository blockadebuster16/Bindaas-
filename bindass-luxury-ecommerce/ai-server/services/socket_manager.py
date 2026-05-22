"""
NEXA Socket Manager
===================
Handles real-time communication between customers (via the widget) 
and human agents (via the dashboard). 
"""
from fastapi import WebSocket
from typing import Dict, List
import json

class SocketManager:
    def __init__(self):
        # Maps client_id (customer or agent) to their WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}
        # Maps customer_id to a list of connected agent_ids for that session
        self.session_map: Dict[str, List[str]] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"[Socket] Client {client_id} connected")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            print(f"[Socket] Client {client_id} disconnected")

    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(json.dumps(message))

    async def broadcast_to_session(self, message: dict, customer_id: str):
        """Send message to the customer and any agents assigned to them."""
        # Send to customer
        await self.send_personal_message(message, customer_id)
        
        # Send to all agents watching this customer
        agents = self.session_map.get(customer_id, [])
        for agent_id in agents:
            await self.send_personal_message(message, agent_id)

    def assign_agent_to_customer(self, customer_id: str, agent_id: str):
        if customer_id not in self.session_map:
            self.session_map[customer_id] = []
        if agent_id not in self.session_map[customer_id]:
            self.session_map[customer_id].append(agent_id)

# Global instance
manager = SocketManager()
