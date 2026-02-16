from __future__ import annotations

from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .db import init_db
from .schemas import DailyPuzzleResponse, GuessRequest, GuessResponse, ProgressSummary, Entitlement
from .progress import (
    ensure_device,
    get_or_create_daily_puzzle,
    get_or_create_progress,
    record_guess,
    get_entitlement,
)

app = FastAPI(title="Daily SET API", version="0.1.0")

# CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await init_db()


def today_utc_str() -> str:
    # Daily seed date in UTC; change to local timezone if desired later.
    return datetime.utcnow().strftime("%Y-%m-%d")


def require_device_id(x_device_id: Optional[str]) -> str:
    if not x_device_id:
        raise HTTPException(status_code=400, detail="Missing X-Device-Id header")
    return x_device_id


@app.get("/api/puzzle/daily", response_model=DailyPuzzleResponse)
async def get_daily_puzzle(x_device_id: Optional[str] = Header(default=None, alias="X-Device-Id")):
    device_id = require_device_id(x_device_id)
    await ensure_device(device_id)

    date_str = today_utc_str()
    board, total_sets = await get_or_create_daily_puzzle(date_str)
    prog = await get_or_create_progress(device_id, date_str)
    ent = await get_entitlement(device_id)

    found_count = len(prog["found_sets"])
    completed = prog["completed_at"] is not None

    return DailyPuzzleResponse(
        date=date_str,
        board=board,
        total_sets=total_sets,
        progress=ProgressSummary(found_count=found_count, mistakes=prog["mistakes"], completed=completed),
        entitlement=Entitlement(**ent),
    )


@app.post("/api/puzzle/daily/guess", response_model=GuessResponse)
async def post_daily_guess(payload: GuessRequest, x_device_id: Optional[str] = Header(default=None, alias="X-Device-Id")):
    device_id = require_device_id(x_device_id)
    await ensure_device(device_id)

    date_str = today_utc_str()
    board, total_sets = await get_or_create_daily_puzzle(date_str)
    await get_or_create_progress(device_id, date_str)

    result = await record_guess(device_id, date_str, board, total_sets, payload.cards)
    return GuessResponse(**result)
