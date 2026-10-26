from __future__ import annotations

import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator
from uuid import uuid4

from .catalog import DISASTERS
from .config import Settings


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class AutoClosingConnection(sqlite3.Connection):
    def __exit__(self, exc_type, exc_value, traceback):
        try:
            return super().__exit__(exc_type, exc_value, traceback)
        finally:
            self.close()


def connect(path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(path, timeout=5, isolation_level=None, factory=AutoClosingConnection)
    os.chmod(path, 0o600)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys=ON")
    connection.execute("PRAGMA busy_timeout=5000")
    connection.execute("PRAGMA journal_mode=WAL")
    return connection


def initialize(settings: Settings) -> None:
    settings.data_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    settings.evidence_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(settings.data_dir, 0o700)
    os.chmod(settings.evidence_dir, 0o700)
    migration = Path(__file__).with_name("migrations") / "001_initial.sql"
    with connect(settings.database) as db:
        db.executescript(migration.read_text(encoding="utf-8"))
        db.execute(
            """CREATE TABLE IF NOT EXISTS disasters (
                 id TEXT PRIMARY KEY, name TEXT NOT NULL, state TEXT NOT NULL,
                 district TEXT NOT NULL, year INTEGER NOT NULL)"""
        )
        db.executemany(
            "INSERT OR IGNORE INTO disasters(id,name,state,district,year) VALUES(?,?,?,?,?)",
            [(key, value["name"], value["state"], value["district"], value["year"])
             for key, value in DISASTERS.items()],
        )
        db.execute("INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES(1, ?)", (now(),))


@contextmanager
def transaction(path: Path) -> Iterator[sqlite3.Connection]:
    db = connect(path)
    try:
        db.execute("BEGIN IMMEDIATE")
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def audit(db: sqlite3.Connection, actor: str, report: str, action: str,
          old_version: int | None, new_version: int | None, reason: str = "") -> None:
    db.execute(
        "INSERT INTO audit_events VALUES(?,?,?,?,?,?,?,?)",
        (str(uuid4()), actor, report, action, old_version, new_version, reason[:500], now()),
    )


def decode_row(row: sqlite3.Row) -> dict:
    item = dict(row)
    for key in ("input_json", "priority_json", "disaster_scopes", "facts_json"):
        if key in item and item[key] is not None:
            parsed = json.loads(item.pop(key))
            target = key.removesuffix("_json")
            item[target] = parsed
    return item
