"""
POST /api/predict  — Core Sentiment-to-Resolution Inference Endpoint
"""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from services import sentiment as sentiment_svc
from services import resolution as resolution_svc

router = APIRouter()


class PredictRequest(BaseModel):
    message: str
    owner_id: str
    customer_meta: Optional[dict] = {}   # {customer_name, order_id, ...}


class PredictResponse(BaseModel):
    domain: str
    intent: str
    confidence: float
    anger_level: str          # CALM | FRUSTRATED | ANGRY
    anger_score: float        # 0.0 – 1.0
    anger_emoji: str
    response: str
    compensation_type: str
    compensation_value: str
    resolution_source: str    # "policy" | "kb" | "global" | "default"
    handover_suggested: bool
    models_loaded: bool


@router.post("/predict", response_model=PredictResponse)
async def predict(body: PredictRequest, request: Request):
    db = request.app.state.db
    preprocessor = request.app.state.preprocessor
    classifier = request.app.state.classifier

    models_loaded = preprocessor is not None and classifier is not None

    if models_loaded:
        # ── ML Pipeline ──────────────────────────────────────────────
        feature_vector = preprocessor.transform(body.message)
        clf_result = classifier.predict(feature_vector)
        domain = clf_result.domain
        intent = clf_result.intent
        confidence = clf_result.confidence
    else:
        # ── Fallback: keyword-based routing ──────────────────────────
        domain, intent, confidence = _keyword_fallback(body.message)

    # ── Sentiment Analysis ────────────────────────────────────────────
    sent = sentiment_svc.analyze(body.message)

    # ── Resolution Drafting ───────────────────────────────────────────
    resolution = await resolution_svc.draft_resolution(
        db=db,
        owner_id=body.owner_id,
        domain=domain,
        intent=intent,
        anger_bucket=sent.anger_bucket,
        raw_message=body.message,
        customer_meta=body.customer_meta,
    )

    # ── Log Ticket to MongoDB ─────────────────────────────────────────
    handover_suggested = sent.anger_bucket == "ANGRY"
    
    ticket = {
        "owner_id": body.owner_id,
        "raw_message": body.message,
        "domain": domain,
        "intent": intent,
        "confidence": confidence,
        "anger_level": sent.anger_bucket,
        "anger_score": sent.anger_score,
        "polarity": sent.polarity,
        "resolution_response": resolution.response,
        "compensation_type": resolution.compensation_type,
        "compensation_value": resolution.compensation_value,
        "resolution_source": resolution.source,
        "handover_suggested": handover_suggested,
        "timestamp": datetime.now(timezone.utc),
    }
    await db["tickets"].insert_one(ticket)

    return PredictResponse(
        domain=domain,
        intent=intent,
        confidence=confidence,
        anger_level=sent.anger_bucket,
        anger_score=sent.anger_score,
        anger_emoji=sent.emoji,
        response=resolution.response,
        compensation_type=resolution.compensation_type,
        compensation_value=resolution.compensation_value,
        resolution_source=resolution.source,
        handover_suggested=handover_suggested,
        models_loaded=models_loaded,
    )


def _keyword_fallback(message: str):
    """Basic keyword router used when ML models aren't loaded yet."""
    msg = message.lower()
    social_keywords = ["hello", "hi", "hey", "thanks", "thank you", "bye", "goodbye", "great", "awesome"]
    business_map = {
        "refund": "get_refund",
        "cancel": "cancel_order",
        "track": "track_order",
        "invoice": "get_invoice",
        "payment": "payment_issue",
        "deliver": "delivery_period",
        "ship": "delivery_options",
        "complaint": "complaint",
        "password": "recover_password",
        "account": "edit_account",
    }

    if any(kw in msg for kw in social_keywords):
        return "social", "greeting", 0.7

    for kw, intent in business_map.items():
        if kw in msg:
            return "business", intent, 0.65

    return "business", "contact_customer_service", 0.5
