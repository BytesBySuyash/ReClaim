from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    data_dir: Path
    allowed_origins: tuple[str, ...]
    cookie_secure: bool
    session_hours: int

    @classmethod
    def from_env(cls) -> "Settings":
        data_dir = Path(os.getenv("RECLAIM_DATA_DIR", "./data")).resolve()
        origins = tuple(
            item.strip().rstrip("/")
            for item in os.getenv(
                "RECLAIM_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
            ).split(",")
            if item.strip()
        )
        return cls(
            data_dir=data_dir,
            allowed_origins=origins,
            cookie_secure=os.getenv(
                "RECLAIM_COOKIE_SECURE",
                "false" if os.getenv("RECLAIM_ENV", "demo") == "development" else "true",
            ).lower() == "true",
            session_hours=min(max(int(os.getenv("RECLAIM_SESSION_HOURS", "24")), 1), 168),
        )

    @property
    def database(self) -> Path:
        return self.data_dir / "reclaim.sqlite3"

    @property
    def evidence_dir(self) -> Path:
        return self.data_dir / "evidence"

