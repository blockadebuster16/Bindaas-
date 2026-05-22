"""
Resolution Drafter — Sentiment-to-Resolution Engine
=====================================================
Hybrid Resolution Logic:
1. Structured Policy (MongoDB Cases)
2. Unstructured Knowledge Base (Local Retrieval)
3. Global Default Policies (MongoDB Global)
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from dataclasses import dataclass
from typing import Optional, List
import re
from services.retriever import retriever

@dataclass
class Resolution:
    response: str
    compensation_type: str   # "none" | "discount" | "store_credit" | "refund" | "priority_support"
    compensation_value: str  # e.g. "15%" or "$25"
    source: str              # "policy" | "kb" | "global" | "default"

async def draft_resolution(
    db: AsyncIOMotorDatabase,
    owner_id: str,
    domain: str,
    intent: str,
    anger_bucket: str,
    raw_message: str,
    customer_meta: Optional[dict] = None,
) -> Resolution:
    """
    Hybrid drafting logic combining structured and unstructured knowledge.
    """
    customer_meta = customer_meta or {}

    # 1. Check Structured Policy (Owner Specific)
    policy = await db["cases"].find_one({
        "owner_id": owner_id,
        "intent": intent,
        "anger_bucket": anger_bucket,
    })

    if policy:
        return Resolution(
            response=_interpolate(policy["response_template"], customer_meta),
            compensation_type=policy.get("compensation_type", "none"),
            compensation_value=policy.get("compensation_value", ""),
            source="policy",
        )

    # 2. Check Unstructured Knowledge Base (Semantic Search)
    # We fetch the KB text for this owner and build a transient index if needed
    # In a production environment, we'd cache this index
    kb_doc = await db["knowledge_base"].find_one({"owner_id": owner_id})
    if kb_doc and kb_doc.get("content"):
        retriever.build_index(kb_doc["content"])
        kb_results = retriever.search(raw_message, top_k=1)
        if kb_results:
            return Resolution(
                response=f"According to our policy: {kb_results[0]}",
                compensation_type="none",
                compensation_value="",
                source="kb",
            )

    # 3. Check Global Policies (actual data fallbacks)
    global_policy = await db["global_policies"].find_one({
        "intent": intent,
        "anger_bucket": anger_bucket
    })
    if global_policy:
        return Resolution(
            response=_interpolate(global_policy["response_template"], customer_meta),
            compensation_type=global_policy.get("compensation_type", "none"),
            compensation_value=global_policy.get("compensation_value", ""),
            source="global",
        )

    # 4. Final Hardcoded Fallback (Last Resort)
    return Resolution(
        response="I understand your request. Let me look into this further for you.",
        compensation_type="none",
        compensation_value="",
        source="default",
    )

def _interpolate(template: str, meta: dict) -> str:
    def replace(match):
        key = match.group(1)
        return str(meta.get(key, f"{{{key}}}"))
    return re.sub(r"\{(\w+)\}", replace, template)
