"""
Seed Global Policies — MongoDB
===============================
Standard fallbacks for all tenants if no specific cases are defined.
"""
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import motor.motor_asyncio
from config import settings

GLOBAL_POLICIES = [
    {
        "intent": "get_refund",
        "anger_bucket": "CALM",
        "response_template": "Our standard refund policy allows returns within 30 days. Please provide your order ID to start the process.",
        "compensation_type": "none",
        "compensation_value": "",
    },
    {
        "intent": "get_refund",
        "anger_bucket": "ANGRY",
        "response_template": "I apologize for the frustration. I've flagged your case for immediate review. Our standard policy is a full refund within 30 days.",
        "compensation_type": "none",
        "compensation_value": "",
    },
    {
        "intent": "track_order",
        "anger_bucket": "CALM",
        "response_template": "Most orders arrive within 5-7 business days. You can track your package using the link sent to your email.",
        "compensation_type": "none",
        "compensation_value": "",
    },
    {
        "intent": "greeting",
        "anger_bucket": "CALM",
        "response_template": "Hello! I'm NEXA, your AI support assistant. How can I help you with your order today?",
        "compensation_type": "none",
        "compensation_value": "",
    }
]

async def seed():
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB]
    
    await db["global_policies"].delete_many({}) # Clear old
    await db["global_policies"].insert_many(GLOBAL_POLICIES)
    
    print(f"[v] Seeded {len(GLOBAL_POLICIES)} global fallback policies.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
