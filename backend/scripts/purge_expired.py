from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone

from backend.app.config import Settings
from backend.app.db import initialize, now, transaction


def main() -> int:
    parser = argparse.ArgumentParser(description="Delete old demo reports and their uploaded evidence.")
    parser.add_argument("--days", type=int, default=30, help="Keep reports newer than this many days (default: 30).")
    args = parser.parse_args()
    if args.days < 1:
        parser.error("--days must be at least 1")

    settings = Settings.from_env()
    initialize(settings)
    cutoff = (datetime.now(timezone.utc) - timedelta(days=args.days)).isoformat(timespec="seconds")
    expired_cutoff = now()
    with transaction(settings.database) as db:
        evidence = db.execute(
            """SELECT e.storage_key FROM evidence e JOIN reports r ON r.id=e.report_id
               WHERE r.created_at < ?""", (cutoff,),
        ).fetchall()
        db.execute("DELETE FROM reports WHERE created_at < ?", (cutoff,))
        db.execute("DELETE FROM sessions WHERE expires_at <= ?", (expired_cutoff,))
        # Each action uses a different window size, so these buckets cannot share a time cutoff.
        db.execute("DELETE FROM rate_buckets")
        db.execute(
            """DELETE FROM idempotency_keys WHERE actor_id IN (
                   SELECT u.id FROM users u LEFT JOIN reports r ON r.owner_id=u.id
                   WHERE u.username IS NULL AND u.role='citizen' AND u.created_at < ?
                   GROUP BY u.id HAVING count(r.id)=0
               )""", (cutoff,),
        )
        db.execute(
            """DELETE FROM users WHERE username IS NULL AND role='citizen' AND created_at < ?
               AND NOT EXISTS (SELECT 1 FROM reports WHERE owner_id=users.id)""", (cutoff,),
        )

    removed = 0
    for item in evidence:
        storage_key = item["storage_key"]
        if storage_key != storage_key.rsplit("/", 1)[-1] or "\\" in storage_key:
            continue
        path = settings.evidence_dir / storage_key
        try:
            path.unlink()
            removed += 1
        except FileNotFoundError:
            pass
    print(f"Purged reports older than {args.days} days and removed {removed} evidence files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
