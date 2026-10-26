from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Need = Literal["housing", "livelihood", "documents", "financial", "dependents"]
NeedLevel = Literal["none", "partial", "severe", "unknown"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class ReportInput(StrictModel):
    disasterId: str = Field(min_length=3, max_length=80)
    language: str = Field(default="en", min_length=2, max_length=12)
    story: str = Field(min_length=1, max_length=8000)
    alias: str | None = Field(default=None, max_length=80)
    members: int = Field(ge=1, le=50)
    occupation: str | None = Field(default=None, max_length=100)
    area: str = Field(min_length=2, max_length=120)
    immediateDanger: Literal["yes", "no", "unknown"] = "unknown"
    needs: dict[Need, NeedLevel] = Field(default_factory=dict)

    @field_validator("needs")
    @classmethod
    def bound_need_keys(cls, value: dict[str, str]) -> dict[str, str]:
        allowed = {"housing", "livelihood", "documents", "financial", "dependents"}
        if set(value) - allowed:
            raise ValueError("Unsupported need category")
        return value


class LoginInput(StrictModel):
    username: str = Field(min_length=2, max_length=80)
    password: str = Field(min_length=1, max_length=256)


class ReviewInput(StrictModel):
    outcome: Literal["needs_visit", "confirmed", "disputed"]
    observationMethod: Literal["field_visit", "remote_review"]
    notes: str = Field(default="", max_length=2000)
    reviewedNeeds: dict[Need, NeedLevel]
    reviewedImmediateDanger: Literal["yes", "no", "unknown"]

    @field_validator("reviewedNeeds")
    @classmethod
    def validate_reviewed_needs(cls, value: dict[str, str]) -> dict[str, str]:
        allowed = {"housing", "livelihood", "documents", "financial", "dependents"}
        if set(value) != allowed:
            raise ValueError("A review must record all five need categories")
        return value


class AssignmentInput(StrictModel):
    workerId: str | None

