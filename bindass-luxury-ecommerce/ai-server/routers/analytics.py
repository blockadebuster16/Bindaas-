"""
Analytics — GET /api/analytics/{owner_id}
Ticket history, anger distribution, intent frequency.
"""
from fastapi import APIRouter, Request, Depends
from .owners import get_current_owner

router = APIRouter()


@router.get("/analytics/{owner_id}")
async def get_analytics(owner_id: str, request: Request, owner=Depends(get_current_owner)):
    db = request.app.state.db

    # Total tickets
    total = await db["tickets"].count_documents({"owner_id": owner_id})

    # Anger distribution
    anger_pipeline = [
        {"$match": {"owner_id": owner_id}},
        {"$group": {"_id": "$anger_level", "count": {"$sum": 1}}},
    ]
    anger_cursor = db["tickets"].aggregate(anger_pipeline)
    anger_dist = {doc["_id"]: doc["count"] async for doc in anger_cursor}

    # Intent frequency (top 10)
    intent_pipeline = [
        {"$match": {"owner_id": owner_id}},
        {"$group": {"_id": "$intent", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    intent_cursor = db["tickets"].aggregate(intent_pipeline)
    intent_freq = [{"intent": doc["_id"], "count": doc["count"]} async for doc in intent_cursor]

    # Average anger score
    avg_pipeline = [
        {"$match": {"owner_id": owner_id}},
        {"$group": {"_id": None, "avg_anger": {"$avg": "$anger_score"}}},
    ]
    avg_cursor = db["tickets"].aggregate(avg_pipeline)
    avg_result = await avg_cursor.to_list(length=1)
    avg_anger = round(avg_result[0]["avg_anger"], 4) if avg_result else 0.0

    # Recent tickets (last 20)
    recent_cursor = db["tickets"].find(
        {"owner_id": owner_id},
        {"raw_message": 1, "intent": 1, "anger_level": 1, "anger_score": 1,
         "compensation_type": 1, "compensation_value": 1, "timestamp": 1}
    ).sort("timestamp", -1).limit(20)
    recent = []
    async for doc in recent_cursor:
        doc["id"] = str(doc.pop("_id"))
        doc["timestamp"] = doc["timestamp"].isoformat()
        recent.append(doc)

    # Resolutions served (non-default)
    resolutions_served = await db["tickets"].count_documents(
        {"owner_id": owner_id, "resolution_source": "policy"}
    )

    return {
        "total_tickets": total,
        "anger_distribution": anger_dist,
        "intent_frequency": intent_freq,
        "avg_anger_score": avg_anger,
        "resolutions_served": resolutions_served,
        "recent_tickets": recent,
    }
