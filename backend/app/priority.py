from __future__ import annotations

from typing import Any

POLICY_VERSION = "hrvs-demo-v1"
MAXIMUMS = {"housing": 25, "livelihood": 25, "documents": 20, "financial": 20, "dependents": 10}
POINTS = {
    "housing": {"none": 0, "partial": 12, "severe": 25},
    "livelihood": {"none": 0, "partial": 12, "severe": 25},
    "documents": {"none": 0, "partial": 10, "severe": 20},
    "financial": {"none": 0, "partial": 10, "severe": 20},
    "dependents": {"none": 0, "partial": 5, "severe": 10},
}


def calculate(data: dict[str, Any], review: str = "unreviewed") -> dict[str, Any]:
    needs = data.get("needs", {})
    missing = [key for key in MAXIMUMS if needs.get(key, "unknown") == "unknown"]
    factors = [
        {
            "code": key,
            "level": needs.get(key, "unknown"),
            "points": None if key in missing else POINTS[key][needs[key]],
            "maxPoints": maximum,
            "source": "citizen" if review == "unreviewed" else "reviewer",
        }
        for key, maximum in MAXIMUMS.items()
    ]
    score = None if missing else sum(item["points"] for item in factors)
    band = (
        "unscored" if score is None else "critical" if score >= 80 else "high"
        if score >= 60 else "moderate" if score >= 40 else "low"
    )
    return {
        "policyVersion": POLICY_VERSION,
        "score": score,
        "band": band,
        "basis": "self_reported" if review == "unreviewed" else "human_reviewed",
        "urgentReview": data.get("immediateDanger") == "yes",
        "missingFields": missing,
        "factors": factors,
    }

