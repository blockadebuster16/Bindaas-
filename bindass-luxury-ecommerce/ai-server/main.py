"""
FastAPI Main Application
========================
NEXA AI Customer Support Agent — Backend Service
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import motor.motor_asyncio
from config import settings
from routers import predict, cases, owners, analytics, kb, live, widget
from services.socket_manager import manager
from fastapi import WebSocket, WebSocketDisconnect
import json

@asynccontextmanager
async def lifespan(app: FastAPI):
    # MongoDB connection
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
    app.state.db = client[settings.MONGODB_DB]
    print(f"[v] Connected to MongoDB: {settings.MONGODB_DB}")

    # Pre-load ML models
    from services.preprocessor import Preprocessor
    from services.classifier import HierarchicalClassifier
    from pathlib import Path

    if all(Path(p).exists() for p in [settings.TFIDF_MODEL_PATH, settings.ROUTER_MODEL_PATH, settings.SOCIAL_MODEL_PATH, settings.BUSINESS_MODEL_PATH]):
        app.state.preprocessor = Preprocessor(settings.TFIDF_MODEL_PATH)
        app.state.classifier = HierarchicalClassifier(settings.ROUTER_MODEL_PATH, settings.SOCIAL_MODEL_PATH, settings.BUSINESS_MODEL_PATH)
        print("[v] ML models loaded successfully (ONNX/CUDA)")
    else:
        app.state.preprocessor = None
        app.state.classifier = None
        print("[!] ML models not found - check models/ directory")

    yield
    client.close()

app = FastAPI(
    title="NEXA AI",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(predict.router,   prefix="/api", tags=["Inference"])
app.include_router(cases.router,     prefix="/api", tags=["Cases"])
app.include_router(kb.router,        prefix="/api/kb", tags=["Knowledge Base"])
app.include_router(live.router,      prefix="/api/live", tags=["Live Agent"])
app.include_router(owners.router,    prefix="/api/owners", tags=["Auth"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(widget.router,    prefix="/api/widget", tags=["Widget Config"])

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Message routing logic
            # type: "chat" | "handover_request" | "agent_join"
            msg_type = message.get("type")
            
            if msg_type == "chat":
                target_id = message.get("target_id")
                await manager.send_personal_message({
                    "type": "chat",
                    "sender_id": client_id,
                    "text": message.get("text"),
                    "timestamp": message.get("timestamp")
                }, target_id)
            
            elif msg_type == "agent_join":
                customer_id = message.get("customer_id")
                manager.assign_agent_to_customer(customer_id, client_id)
                await manager.send_personal_message({
                    "type": "status",
                    "text": "A human agent has joined the chat.",
                    "mode": "human"
                }, customer_id)

    except WebSocketDisconnect:
        manager.disconnect(client_id)

@app.get("/")
async def root():
    return {"status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
