from __future__ import annotations

import argparse
import getpass
import json
import sys
from uuid import uuid4

from argon2 import PasswordHasher

from backend.app.catalog import DISASTERS
from backend.app.config import Settings
from backend.app.db import initialize, now, transaction


def main() -> int:
    parser = argparse.ArgumentParser(description="Create or update a local ReClaim demo staff account.")
    parser.add_argument("--username", required=True)
    parser.add_argument("--role", choices=("fieldworker", "ngo", "govt"), required=True)
    parser.add_argument("--scope", choices=tuple(DISASTERS) + ("*",), action="append", default=[])
    args = parser.parse_args()
    if len(args.username) < 2 or len(args.username) > 80:
        parser.error("username must contain 2–80 characters")
    first = getpass.getpass("Password (12 or more characters): ")
    second = getpass.getpass("Confirm password: ")
    if len(first) < 12 or first != second:
        parser.error("passwords must match and contain at least 12 characters")
    scopes = args.scope or (["*"] if args.role == "govt" else [])
    settings = Settings.from_env()
    initialize(settings)
    digest = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1).hash(first)
    with transaction(settings.database) as db:
        db.execute(
            """INSERT INTO users(id,username,password_hash,role,disaster_scopes,active,created_at)
               VALUES(?,?,?,?,?,1,?)
               ON CONFLICT(username) DO UPDATE SET password_hash=excluded.password_hash,
                 role=excluded.role,disaster_scopes=excluded.disaster_scopes,active=1""",
            (str(uuid4()), args.username, digest, args.role, json.dumps(scopes), now()),
        )
    print(f"Staff account '{args.username}' is ready for the ReClaim demo.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
