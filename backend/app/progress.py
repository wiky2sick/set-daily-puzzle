from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import List, Tuple

from .db import get_db
from .puzzle import generate_daily_puzzle, board_from_json, is_set, set_signature

UTC_NOW = lambda: datetime.now(timezone.utc).isoformat()


async def ensure_device(device_id: str) -> None:
    conn = await get_db()
    try:
        await conn.execute(
            "INSERT OR IGNORE INTO devices(device_id, created_at) VALUES (?, ?)",
            (device_id, UTC_NOW()),
        )
        await conn.commit()
    finally:
        await conn.close()


async def get_or_create_daily_puzzle(date_str: str) -> Tuple[List[str], int]:
    conn = await get_db()
    try:
        row = await (await conn.execute(
            "SELECT board_json, total_sets FROM puzzles WHERE date = ?",
            (date_str,),
        )).fetchone()

        if row:
            return board_from_json(row["board_json"]), int(row["total_sets"])

        puzzle = generate_daily_puzzle(date_str=date_str)
        await conn.execute(
            "INSERT INTO puzzles(date, seed, board_json, total_sets, created_at) VALUES (?, ?, ?, ?, ?)",
            (puzzle.date, puzzle.seed, json.dumps(puzzle.board), puzzle.total_sets, UTC_NOW()),
        )
        await conn.commit()
        return puzzle.board, puzzle.total_sets
    finally:
        await conn.close()


async def get_entitlement(device_id: str) -> dict:
    conn = await get_db()
    try:
        row = await (await conn.execute(
            "SELECT is_paid, plan, expires_at FROM entitlements WHERE device_id = ?",
            (device_id,),
        )).fetchone()
        if not row:
            return {"is_paid": False, "plan": None, "expires_at": None}
        return {
            "is_paid": bool(row["is_paid"]),
            "plan": row["plan"],
            "expires_at": row["expires_at"],
        }
    finally:
        await conn.close()


async def get_or_create_progress(device_id: str, date_str: str) -> dict:
    conn = await get_db()
    try:
        row = await (await conn.execute(
            "SELECT found_sets_json, mistakes, started_at, completed_at FROM progress WHERE device_id = ? AND date = ?",
            (device_id, date_str),
        )).fetchone()

        if row:
            found = json.loads(row["found_sets_json"])
            return {
                "found_sets": found,
                "mistakes": int(row["mistakes"]),
                "started_at": row["started_at"],
                "completed_at": row["completed_at"],
            }

        await conn.execute(
            "INSERT INTO progress(device_id, date, found_sets_json, mistakes, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?)",
            (device_id, date_str, json.dumps([]), 0, UTC_NOW(), None),
        )
        await conn.commit()
        return {"found_sets": [], "mistakes": 0, "started_at": UTC_NOW(), "completed_at": None}
    finally:
        await conn.close()


async def record_guess(device_id: str, date_str: str, board: List[str], total_sets: int, cards: List[str]) -> dict:
    """
    Validates a guess, updates progress if correct and new, increments mistakes if wrong.
    Returns: {is_set, already_found, found_count, total_sets, completed}
    """
    # Must be cards on the board
    if any(c not in board for c in cards):
        return {"is_set": False, "already_found": False, "found_count": 0, "total_sets": total_sets, "completed": False}

    valid = is_set(cards[0], cards[1], cards[2])
    sig = set_signature(cards)

    conn = await get_db()
    try:
        row = await (await conn.execute(
            "SELECT found_sets_json, mistakes, completed_at FROM progress WHERE device_id = ? AND date = ?",
            (device_id, date_str),
        )).fetchone()

        if not row:
            # progress should exist, but be safe
            await conn.execute(
                "INSERT INTO progress(device_id, date, found_sets_json, mistakes, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?)",
                (device_id, date_str, json.dumps([]), 0, UTC_NOW(), None),
            )
            await conn.commit()
            found_sets = []
            mistakes = 0
            completed_at = None
        else:
            found_sets = json.loads(row["found_sets_json"])
            mistakes = int(row["mistakes"])
            completed_at = row["completed_at"]

        if completed_at is not None:
            # Daily already completed: do not allow further progress changes
            return {
                "is_set": False,
                "already_found": False,
                "found_count": len(found_sets),
                "total_sets": total_sets,
                "completed": True,
            }

        if not valid:
            mistakes += 1
            await conn.execute(
                "UPDATE progress SET mistakes = ? WHERE device_id = ? AND date = ?",
                (mistakes, device_id, date_str),
            )
            await conn.commit()
            return {
                "is_set": False,
                "already_found": False,
                "found_count": len(found_sets),
                "total_sets": total_sets,
                "completed": False,
            }

        # valid set
        if sig in found_sets:
            return {
                "is_set": True,
                "already_found": True,
                "found_count": len(found_sets),
                "total_sets": total_sets,
                "completed": False,
            }

        found_sets.append(sig)
        completed = len(found_sets) >= total_sets
        await conn.execute(
            "UPDATE progress SET found_sets_json = ?, completed_at = ? WHERE device_id = ? AND date = ?",
            (json.dumps(found_sets), UTC_NOW() if completed else None, device_id, date_str),
        )
        await conn.commit()

        return {
            "is_set": True,
            "already_found": False,
            "found_count": len(found_sets),
            "total_sets": total_sets,
            "completed": completed,
        }
    finally:
        await conn.close()
