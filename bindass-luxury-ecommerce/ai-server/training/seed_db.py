"""
Seed Script — MongoDB Collections
===================================
Creates indexes and seeds demo data for a test owner.

Run: python training/seed_db.py
"""
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import bcrypt
from datetime import datetime, timezone

def _hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

DEMO_OWNER = {
    "email": "demo@nexa.ai",
    "password_hash": _hash_password("demo1234"),
    "company_name": "NEXA Demo Store",
    "created_at": datetime.now(timezone.utc),
}

DEMO_CASES = [
    {
        "intent": "get_refund",
        "anger_bucket": "CALM",
        "response_template": "Hi {customer_name}! Your refund request has been received and will be processed within 5-7 business days.",
        "compensation_type": "none",
        "compensation_value": "",
    },
    {
        "intent": "get_refund",
        "anger_bucket": "FRUSTRATED",
        "response_template": "Hi {customer_name}, I completely understand your frustration. I've escalated your refund for express processing (2-3 days) and added a {compensation_value} discount to your next order.",
        "compensation_type": "discount",
        "compensation_value": "10%",
    },
    {
        "intent": "get_refund",
        "anger_bucket": "ANGRY",
        "response_template": "I sincerely apologize, {customer_name}. This is unacceptable and I'm processing your full refund immediately. We're also crediting {compensation_value} to your store account as a token of apology.",
        "compensation_type": "store_credit",
        "compensation_value": "$25",
    },
    {
        "intent": "track_order",
        "anger_bucket": "CALM",
        "response_template": "Hi! Your order {order_id} is on its way and expected to arrive within 2 business days.",
        "compensation_type": "none",
        "compensation_value": "",
    },
    {
        "intent": "track_order",
        "anger_bucket": "FRUSTRATED",
        "response_template": "I'm sorry for the delay on order {order_id}. I've flagged this for priority investigation and will update you within 2 hours.",
        "compensation_type": "discount",
        "compensation_value": "5%",
    },
    {
        "intent": "track_order",
        "anger_bucket": "ANGRY",
        "response_template": "I sincerely apologize for the terrible experience with order {order_id}. I'm treating this as an emergency and will have a full resolution within the hour. You'll receive {compensation_value} store credit for the inconvenience.",
        "compensation_type": "store_credit",
        "compensation_value": "$15",
    },
    {
        "intent": "complaint",
        "anger_bucket": "ANGRY",
        "response_template": "We take your complaint extremely seriously. I'm connecting you with our chief customer officer immediately and processing a {compensation_value} refund as a gesture of goodwill.",
        "compensation_type": "refund",
        "compensation_value": "100%",
    },
    {
        "intent": "cancel_order",
        "anger_bucket": "CALM",
        "response_template": "Your cancellation request for order {order_id} has been received. You'll receive confirmation within 24 hours.",
        "compensation_type": "none",
        "compensation_value": "",
    },
]


async def seed():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB]

    # Create indexes
    await db["owners"].create_index("email", unique=True)
    await db["tickets"].create_index("owner_id")
    await db["tickets"].create_index("timestamp")
    await db["cases"].create_index([("owner_id", 1), ("intent", 1), ("anger_bucket", 1)])
    print("[v] Indexes created")

    # Upsert demo owner
    existing = await db["owners"].find_one({"email": DEMO_OWNER["email"]})
    if existing:
        owner_id = str(existing["_id"])
        print(f"[i] Demo owner already exists: {owner_id}")
    else:
        result = await db["owners"].insert_one(DEMO_OWNER.copy())
        owner_id = str(result.inserted_id)
        print(f"[v] Demo owner created: {owner_id}")

    # Seed cases
    for case in DEMO_CASES:
        existing_case = await db["cases"].find_one({
            "owner_id": owner_id,
            "intent": case["intent"],
            "anger_bucket": case["anger_bucket"],
        })
        if not existing_case:
            await db["cases"].insert_one({**case, "owner_id": owner_id})

    print(f"[v] {len(DEMO_CASES)} demo cases seeded")
    print("\n--- Demo credentials ---")
    print(f"   Email: {DEMO_OWNER['email']}")
    print(f"   Password: demo1234")
    print(f"   Owner ID: {owner_id}")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
