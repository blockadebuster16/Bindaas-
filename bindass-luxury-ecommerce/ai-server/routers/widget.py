"""
Widget Configuration Router
===========================
Handles saving and retrieving the AI chat widget's appearance and behavior.
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from routers.owners import get_current_owner

router = APIRouter()

class WidgetConfigRequest(BaseModel):
    bot_name: str
    bot_logo: Optional[str] = ""
    primary_color: str
    position: str
    greeting: str

@router.get("/")
async def get_widget_config(request: Request, owner: dict = Depends(get_current_owner)):
    db = request.app.state.db
    owner_id = owner["id"]
    doc = await db["widget_config"].find_one({"owner_id": owner_id})
    if not doc:
        # Return default config if not found
        return {
            "bot_name": "NEXA Support",
            "bot_logo": "",
            "primary_color": "#6366f1",
            "position": "bottom-right",
            "greeting": "Hi! I'm your AI support assistant. How can I help you today?"
        }
    
    # Remove MongoDB internal ID for the response
    doc.pop("_id", None)
    doc.pop("owner_id", None)
    return doc

@router.post("/save")
async def save_widget_config(body: WidgetConfigRequest, request: Request, owner: dict = Depends(get_current_owner)):
    db = request.app.state.db
    owner_id = owner["id"]
    await db["widget_config"].update_one(
        {"owner_id": owner_id},
        {"$set": body.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@router.get("/public/{owner_id}")
async def get_public_widget_config(owner_id: str, request: Request):
    from bson import ObjectId
    db = request.app.state.db
    doc = await db["widget_config"].find_one({"owner_id": owner_id})
    if not doc:
        return {
            "bot_name": "NEXA Support",
            "bot_logo": "",
            "primary_color": "#6366f1",
            "position": "bottom-right",
            "greeting": "Hi! I'm your AI support assistant. How can I help you today?"
        }
    doc.pop("_id", None)
    doc.pop("owner_id", None)
    return doc

