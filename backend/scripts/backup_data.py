from __future__ import annotations

import argparse
import hashlib
import json
import os
import sqlite3
import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from backend.app.config import Settings
from backend.app.db import now


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def valid_storage_key(value: str) -> bool:
    return Path(value).name == value and value.endswith(".jpg") and "\\" not in value


def main() -> int:
    settings = Settings.from_env()
    parser = argparse.ArgumentParser(description="Create a private, consistent ReClaim demo backup.")
    parser.add_argument("--output", type=Path, help="Output ZIP path; defaults to data/backups with a UTC timestamp.")
    args = parser.parse_args()
    if not settings.database.is_file():
        parser.error(f"database does not exist: {settings.database}")

    use_private_default = args.output is None
    output = args.output or settings.data_dir / "backups" / f"reclaim-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.zip"
    output = output.expanduser().resolve()
    if output.exists():
        parser.error(f"backup already exists: {output}")
    output.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    if use_private_default:
        os.chmod(output.parent, 0o700)

    with tempfile.TemporaryDirectory(prefix="reclaim-backup-", dir=output.parent) as temporary:
        snapshot_path = Path(temporary) / "reclaim.sqlite3"
        with sqlite3.connect(settings.database) as source, sqlite3.connect(snapshot_path) as snapshot:
            source.backup(snapshot)

        with sqlite3.connect(snapshot_path) as snapshot:
            snapshot.row_factory = sqlite3.Row
            rows = snapshot.execute("SELECT storage_key,sha256,size_bytes FROM evidence ORDER BY storage_key").fetchall()

        evidence_files: list[tuple[str, bytes]] = []
        manifest_evidence = []
        for row in rows:
            storage_key = row["storage_key"]
            if not valid_storage_key(storage_key):
                parser.error("database contains an invalid evidence storage key")
            path = settings.evidence_dir / storage_key
            content = path.read_bytes()
            digest = sha256(content)
            if digest != row["sha256"] or len(content) != row["size_bytes"]:
                parser.error(f"evidence does not match the database receipt: {storage_key}")
            archive_path = f"evidence/{storage_key}"
            evidence_files.append((archive_path, content))
            manifest_evidence.append({"path": archive_path, "sha256": digest, "sizeBytes": len(content)})

        manifest = {
            "formatVersion": 1,
            "createdAt": now(),
            "databaseSha256": sha256(snapshot_path.read_bytes()),
            "evidence": manifest_evidence,
        }
        temporary_archive = Path(temporary) / "backup.zip"
        with zipfile.ZipFile(temporary_archive, "w") as archive:
            archive.write(snapshot_path, "reclaim.sqlite3", compress_type=zipfile.ZIP_DEFLATED)
            for archive_path, content in evidence_files:
                archive.writestr(archive_path, content, compress_type=zipfile.ZIP_STORED)
            archive.writestr("manifest.json", json.dumps(manifest, sort_keys=True, indent=2))
        os.chmod(temporary_archive, 0o600)
        os.replace(temporary_archive, output)

    print(f"Backup created: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
