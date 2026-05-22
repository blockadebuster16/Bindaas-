"""
Smart Refund Calculator — Option A
====================================
Computes a precise, policy-aware refund recommendation using only
internal data. Zero external APIs.

Formula:
    recommended = anger_score * intent_weight * order_value
    capped by   = policy_cap[compensation_type]

Returns a RefundRecommendation dataclass with amount, type, and reasoning.
"""
from dataclasses import dataclass

# How much weight each intent type carries in the refund calculation
INTENT_WEIGHTS: dict[str, float] = {
    "get_refund":               1.00,
    "cancel_order":             0.90,
    "payment_issue":            0.85,
    "complaint":                0.80,
    "delivery_period":          0.70,
    "track_order":              0.55,
    "delivery_options":         0.50,
    "contact_customer_service": 0.45,
    "edit_account":             0.20,
    "recover_password":         0.10,
    "greeting":                 0.00,
    "gratitude":                0.00,
}

# Hard cap per compensation type (in USD equivalent)
POLICY_CAPS: dict[str, float] = {
    "refund":           100.0,
    "store_credit":      50.0,
    "discount":          30.0,   # treated as $ value for simplicity
    "priority_support":   0.0,
    "none":               0.0,
}

# Anger level acts as a gate: CALM customers get nothing automatically
ANGER_GATE: dict[str, float] = {
    "ANGRY":      1.0,
    "FRUSTRATED": 0.6,
    "CALM":       0.0,
}

DEFAULT_ORDER_VALUE = 50.0   # assumed order value when not provided


@dataclass
class RefundRecommendation:
    amount: float           # recommended refund amount in $
    comp_type: str          # e.g. "store_credit"
    reasoning: str          # human-readable explanation shown in Co-Pilot panel


def calculate(
    anger_score: float,
    anger_level: str,
    intent: str,
    compensation_type: str,
    order_value: float = DEFAULT_ORDER_VALUE,
) -> RefundRecommendation:
    """
    Compute a data-driven refund recommendation.
    All values come from the existing ML pipeline — no external calls.
    """
    anger_gate   = ANGER_GATE.get(anger_level, 0.0)
    intent_wt    = INTENT_WEIGHTS.get(intent, 0.5)
    policy_cap   = POLICY_CAPS.get(compensation_type, 25.0)

    if anger_gate == 0.0 or policy_cap == 0.0:
        return RefundRecommendation(
            amount=0.0,
            comp_type=compensation_type or "none",
            reasoning=f"No compensation needed — customer sentiment is {anger_level} "
                      f"with a low-priority intent ({intent}).",
        )

    raw = anger_score * anger_gate * intent_wt * order_value
    recommended = round(min(raw, policy_cap), 2)

    reasoning = (
        f"Anger score {anger_score:.2f} × intent weight {intent_wt:.2f} "
        f"× order value ${order_value:.2f} = ${raw:.2f}, "
        f"capped to ${recommended:.2f} by {compensation_type} policy."
    )

    return RefundRecommendation(
        amount=recommended,
        comp_type=compensation_type,
        reasoning=reasoning,
    )
