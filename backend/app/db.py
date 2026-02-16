from __future__ import annotations

import aiosqlite
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "set_daily.sqlite3"


async def get_db() -> aiosqlite.Connection:
    conn = await aiosqlite.connect(DB_PATH.as_posix())
    conn.row_factory = aiosqlite.Row
    # Ensure FK constraints (future-proof)
    await conn.execute("PRAGMA foreign_keys = ON;")
    return conn


async def init_db() -> None:
    conn = await get_db()
    try:
        await conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS puzzles (
              date TEXT PRIMARY KEY,
              seed TEXT NOT NULL,
              board_json TEXT NOT NULL,
              total_sets INTEGER NOT NULL,
              created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS devices (
              device_id TEXT PRIMARY KEY,
              created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS progress (
              device_id TEXT NOT NULL,
              date TEXT NOT NULL,
              found_sets_json TEXT NOT NULL,
              mistakes INTEGER NOT NULL DEFAULT 0,
              started_at TEXT NOT NULL,
              completed_at TEXT,
              PRIMARY KEY (device_id, date),
              FOREIGN KEY (device_id) REFERENCES devices(device_id),
              FOREIGN KEY (date) REFERENCES puzzles(date)
            );

            CREATE TABLE IF NOT EXISTS entitlements (
              device_id TEXT PRIMARY KEY,
              is_paid INTEGER NOT NULL DEFAULT 0,
              plan TEXT,
              expires_at TEXT
            );
            """
        )
        await conn.commit()
    finally:
        await conn.close()
