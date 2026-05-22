import asyncio
import motor.motor_asyncio
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "nexa_db")

async def seed():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB]
    
    owner_id = "system_admin"
    
    # 1. Ensure Owner exists (in nexa_db owners collection)
    owner = await db["owners"].find_one({"_id": owner_id}) # Note: using string ID for local dev simplicity
    if not owner:
        await db["owners"].update_one(
            {"email": "admin@local.dev"},
            {"$set": {
                "email": "admin@local.dev",
                "company_name": "Bindass Luxury",
                "password_hash": "dummy_hash"
            }},
            upsert=True
        )
        # We'll use "system_admin" or the hardcoded ID for simplicity in local dev bypass
        print(f"Set up default owner admin@local.dev")

    # 2. Setup Widget Config
    await db["widget_config"].update_one(
        {"owner_id": owner_id},
        {"$set": {
            "bot_name": "NEXA Assistant",
            "bot_logo": "",
            "primary_color": "#6366f1",
            "position": "bottom-right",
            "greeting": "Welcome to Bindass Luxury! I'm NEXA, your personal shopping assistant. How can I help you today?"
        }},
        upsert=True
    )
    print(f"Set up widget config for {owner_id}")

    # 3. Setup Knowledge Base
    await db["knowledge_base"].update_one(
        {"owner_id": owner_id},
        {"$set": {
            "content": """
            BINDASS LUXURY POLICIES:
            1. Shipping: We offer free express shipping on all orders above $500. Standard delivery takes 3-5 business days.
            2. Returns: Items can be returned within 14 days of delivery if they are in original condition with tags.
            3. Refunds: Once we receive the returned item, refunds are processed within 7 business days to the original payment method.
            4. Sustainability: All our packaging is 100% recyclable. We source materials from ethical suppliers.
            5. Contact: For urgent matters, email support@bindassluxury.com or call our 24/7 hotline.
            """
        }},
        upsert=True
    )
    print(f"Set up knowledge base for {owner_id}")

    # 4. Setup some default cases
    cases = [
        {"intent": "get_refund", "anger_bucket": "CALM", "response_template": "I can help you with a refund. Please provide your order ID and the reason for the return.", "compensation_type": "none"},
        {"intent": "get_refund", "anger_bucket": "ANGRY", "response_template": "I'm very sorry for the frustration. I've prioritized your refund request. A manager will review this within 2 hours.", "compensation_type": "discount", "compensation_value": "10%"},
        {"intent": "greeting", "anger_bucket": "CALM", "response_template": "Hello! How can I assist you with your luxury shopping today?", "compensation_type": "none"}
    ]
    
    for case in cases:
        await db["cases"].update_one(
            {"owner_id": owner_id, "intent": case["intent"], "anger_bucket": case["anger_bucket"]},
            {"$set": case},
            upsert=True
        )
    print(f"Set up {len(cases)} default cases for {owner_id}")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
