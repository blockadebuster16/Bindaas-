"""
Live Chat & Human Actions Router — Enhanced
============================================
Option A: Smart Refund Calculator (suggest endpoint)
Option B: Supabase State Machine (approve/reject endpoints)
Option D: Analytics stats endpoint
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from services.refund_calculator import calculate as calc_refund
from services.supabase_client import get_supabase
from routers.owners import get_current_owner

router = APIRouter()


# ── Request / Response Models ─────────────────────────────────────────────────

class RefundSuggestRequest(BaseModel):
    ticket_id: str
    agent_id: str
    anger_score: float
    anger_level: str
    intent: str
    compensation_type: str
    order_value: Optional[float] = 50.0

class RefundApproveRequest(BaseModel):
    refund_audit_id: str       # UUID from Supabase
    agent_id: str
    final_amount: float
    final_type: str
    override_reason: Optional[str] = None
    action: str                # "approve" | "reject"


# ── Session Fetching ──────────────────────────────────────────────────────────

@router.get("/sessions")
async def get_active_sessions(request: Request, owner: dict = Depends(get_current_owner)):
    """Fetch recent tickets from MongoDB for the live queue, scoped to owner."""
    db = request.app.state.db
    owner_id = owner["id"]
    cursor = db["tickets"].find({"owner_id": owner_id}).sort("timestamp", -1).limit(15)
    tickets = await cursor.to_list(length=15)
    for t in tickets:
        t["id"] = str(t.pop("_id"))
    return tickets


# ── Option A + B: Suggest Refund ─────────────────────────────────────────────

@router.post("/refund/suggest")
async def suggest_refund(body: RefundSuggestRequest, owner: dict = Depends(get_current_owner)):
    """
    Option A: Run the Smart Refund Calculator.
    Option B: Write an AI_SUGGESTED record to Supabase.
    Returns the audit record ID so the agent can approve/reject it.
    """
    # Option A — calculate
    rec = calc_refund(
        anger_score=body.anger_score,
        anger_level=body.anger_level,
        intent=body.intent,
        compensation_type=body.compensation_type,
        order_value=body.order_value or 50.0,
    )

    # Option B — write to Supabase
    sb = get_supabase()
    owner_id = owner["id"]
    row = {
        "ticket_id":   body.ticket_id,
        "owner_id":    owner_id,
        "agent_id":    body.agent_id,
        "ai_amount":   rec.amount,
        "ai_type":     rec.comp_type,
        "ai_reasoning": rec.reasoning,
        "anger_score": body.anger_score,
        "anger_level": body.anger_level,
        "intent":      body.intent,
        "status":      "AI_SUGGESTED",
    }
    result = sb.table("refund_audit").insert(row).execute()
    audit_id = result.data[0]["id"] if result.data else None

    return {
        "audit_id":   audit_id,
        "ai_amount":  rec.amount,
        "ai_type":    rec.comp_type,
        "reasoning":  rec.reasoning,
        "status":     "AI_SUGGESTED",
    }


# ── Option B: Approve / Reject Refund ─────────────────────────────────────────

@router.post("/refund/approve")
async def approve_refund(body: RefundApproveRequest):
    """
    Option B: Human agent approves or rejects the AI suggestion.
    Transitions the state machine: AI_SUGGESTED → APPROVED/REJECTED → PROCESSED
    """
    sb = get_supabase()

    if body.action == "approve":
        # APPROVED → PROCESSED in one step for demo simplicity
        updates = {
            "final_amount":    body.final_amount,
            "final_type":      body.final_type,
            "override_reason": body.override_reason,
            "agent_id":        body.agent_id,
            "status":          "PROCESSED",
        }
    else:
        updates = {
            "agent_id":        body.agent_id,
            "override_reason": body.override_reason or "Rejected by agent",
            "status":          "REJECTED",
        }

    sb.table("refund_audit").update(updates).eq("id", body.refund_audit_id).execute()
    return {"status": updates["status"], "refund_audit_id": body.refund_audit_id}


# ── Option D: Analytics Stats ─────────────────────────────────────────────────

@router.get("/refund/stats")
async def refund_stats(owner: dict = Depends(get_current_owner)):
    """
    Option D: Aggregate refund KPIs from Supabase for the analytics widget.
    """
    sb = get_supabase()
    owner_id = owner["id"]

    # Fetch all processed/completed records
    result = sb.table("refund_audit").select(
        "ai_amount, final_amount, status, anger_level, ai_type"
    ).eq("owner_id", owner_id).execute()

    rows = result.data or []
    processed = [r for r in rows if r["status"] in ("PROCESSED", "COMPLETED")]

    if not processed:
        return {
            "total_refunds":      0,
            "total_value":        0.0,
            "avg_amount":         0.0,
            "acceptance_rate":    0.0,
            "by_anger_level":     {},
            "rejected":           0,
        }

    total   = len(processed)
    total_v = sum(r["final_amount"] or r["ai_amount"] or 0 for r in processed)
    avg     = round(total_v / total, 2) if total else 0

    # Acceptance rate: did the agent use the AI amount (within $1)?
    accepted = sum(
        1 for r in processed
        if r["final_amount"] is not None
        and abs((r["final_amount"] or 0) - (r["ai_amount"] or 0)) <= 1.0
    )
    acceptance_rate = round((accepted / total) * 100, 1) if total else 0

    by_anger: dict[str, int] = {}
    for r in processed:
        lvl = r.get("anger_level", "UNKNOWN")
        by_anger[lvl] = by_anger.get(lvl, 0) + 1

    rejected = len([r for r in rows if r["status"] == "REJECTED"])

    return {
        "total_refunds":   total,
        "total_value":     round(total_v, 2),
        "avg_amount":      avg,
        "acceptance_rate": acceptance_rate,
        "by_anger_level":  by_anger,
        "rejected":        rejected,
    }
