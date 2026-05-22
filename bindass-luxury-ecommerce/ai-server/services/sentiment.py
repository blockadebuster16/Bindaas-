"""
Sentiment & Anger-Level Engine
================================
Uses TextBlob polarity to derive an anger score and classify into:
  - CALM       (0.0 – 0.35)
  - FRUSTRATED (0.35 – 0.65)
  - ANGRY      (0.65 – 1.0)

TextBlob polarity ranges from -1.0 (very negative) to +1.0 (very positive).
We invert and normalize so high negativity = high anger.
"""
from textblob import TextBlob
from dataclasses import dataclass


ANGER_THRESHOLDS = {
    "CALM": (0.0, 0.35),
    "FRUSTRATED": (0.35, 0.65),
    "ANGRY": (0.65, 1.0),
}

BUCKET_LABELS = ["CALM", "FRUSTRATED", "ANGRY"]

BUCKET_EMOJI = {
    "CALM": "🟢",
    "FRUSTRATED": "🟡",
    "ANGRY": "🔴",
}


@dataclass
class SentimentResult:
    polarity: float          # raw TextBlob polarity [-1, 1]
    anger_score: float       # normalized [0, 1]; higher = angrier
    anger_bucket: str        # "CALM" | "FRUSTRATED" | "ANGRY"
    emoji: str


def analyze(text: str) -> SentimentResult:
    """
    Analyze the anger level of a customer message.

    Returns:
        SentimentResult with polarity, anger_score, anger_bucket, emoji.
    """
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity  # -1.0 to +1.0

    # Invert: very negative polarity → high anger score
    # polarity = -1 → anger_score = 1.0
    # polarity = +1 → anger_score = 0.0
    anger_score = round((1.0 - polarity) / 2.0, 4)  # normalized to [0, 1]

    bucket = _classify_bucket(anger_score)

    return SentimentResult(
        polarity=round(polarity, 4),
        anger_score=anger_score,
        anger_bucket=bucket,
        emoji=BUCKET_EMOJI[bucket],
    )


def _classify_bucket(score: float) -> str:
    if score < ANGER_THRESHOLDS["FRUSTRATED"][0]:
        return "CALM"
    elif score < ANGER_THRESHOLDS["ANGRY"][0]:
        return "FRUSTRATED"
    else:
        return "ANGRY"
