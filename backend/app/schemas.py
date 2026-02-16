from __future__ import annotations

from pydantic import BaseModel, Field
from typing import List, Optional


class Entitlement(BaseModel):
    is_paid: bool = False
    plan: Optional[str] = None
    expires_at: Optional[str] = None


class ProgressSummary(BaseModel):
    found_count: int = 0
    mistakes: int = 0
    completed: bool = False


class DailyPuzzleResponse(BaseModel):
    date: str
    board: List[str]
    total_sets: int
    progress: ProgressSummary
    entitlement: Entitlement


class GuessRequest(BaseModel):
    cards: List[str] = Field(min_length=3, max_length=3)


class GuessResponse(BaseModel):
    is_set: bool
    already_found: bool = False
    found_count: int = 0
    total_sets: int = 0
    completed: bool = False
