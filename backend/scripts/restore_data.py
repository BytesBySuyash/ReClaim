from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sqlite3
import tempfile
import zipfile
from pathlib import Path, PurePosixPath

from backend.app.config import Settings

MAX_EVIDENCE_BYTES = 5 * 1024 * 1024
MAX_MANIFEST_BYTES = 2 * 1024 * 1024


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def valid_storage_key(value: str) -> bool:
    return Path(value).name == value and value.endswith(".jpg") and "\\" not in value


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify a ReClaim backup and restore it to a new data directory.")
    parser.add_argument("--archive", type=Path, required=True, help="Backup ZIP created by backup_data.")
    parser.add_argument("--destination", type=Path, required=True, help="New data directory; it must not already exist.")
    args = parser.parse_args()
    archive_path = args.archive.expanduser().resolve()
    destination = args.destination.expanduser().resolve()
    if not archive_path.is_file():
        parser.error(f"backup does not exist: {archive_path}")
    if destination.exists() or destination.is_symlink():
        parser.error(f"destination already exists: {destination}")
    destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)

    staging = Path(tempfile.mkdtemp(prefix=".reclaim-restore-", dir=destination.parent))
    try:
        with zipfile.ZipFile(archive_path) as archive:
            infos = archive.infolist()
            if len({item.filename for item in infos}) != len(infos):
                parser.error("backup contains duplicate paths")
            if any(PurePosixPath(item.filename).is_absolute() or ".." in PurePosixPath(item.filename).parts for item in infos):
                parser.error("backup contains an unsafe path")
            names = {item.filename for item in infos}
            if "manifest.json" not in names or "reclaim.sqlite3" not in names:
                parser.error("backup is missing its database or manifest")
            manifest_info = archive.getinfo("manifest.json")
            if manifest_info.file_size > MAX_MANIFEST_BYTES:
                parser.error("backup manifest is too large")
            manifest = json.loads(archive.read(manifest_info))
            if manifest.get("formatVersion") != 1 or not isinstance(manifest.get("evidence"), list):
                parser.error("unsupported or invalid backup manifest")
            expected_names = {"manifest.json", "reclaim.sqlite3"}
            evidence_manifest = {}
            for item in manifest["evidence"]:
                key = item.get("path", "")
                path = PurePosixPath(key)
                storage_key = path.name
                if path.parts[:1] != ("evidence",) or len(path.parts) != 2 or not valid_storage_key(storage_key):
                    parser.error("backup manifest contains an invalid evidence path")
                if key in evidence_manifest:
                    parser.error("backup manifest contains duplicate evidence paths")
                if item.get("sizeBytes", MAX_EVIDENCE_BYTES + 1) > MAX_EVIDENCE_BYTES:
                    parser.error(f"evidence exceeds the supported size: {storage_key}")
                expected_names.add(key)
                evidence_manifest[key] = item
            if names != expected_names:
                parser.error("backup contains missing or unexpected files")

            database_bytes = archive.read("reclaim.sqlite3")
            if sha256(database_bytes) != manifest.get("databaseSha256"):
                parser.error("database checksum does not match the manifest")
            database_path = staging / "reclaim.sqlite3"
            database_path.write_bytes(database_bytes)
            os.chmod(database_path, 0o600)
            evidence_dir = staging / "evidence"
            evidence_dir.mkdir(mode=0o700)
            for archive_name, item in evidence_manifest.items():
                content = archive.read(archive_name)
                if len(content) != item["sizeBytes"] or sha256(content) != item["sha256"]:
                    parser.error(f"evidence checksum does not match the manifest: {archive_name}")
                (evidence_dir / PurePosixPath(archive_name).name).write_bytes(content)
                os.chmod(evidence_dir / PurePosixPath(archive_name).name, 0o600)

        database = sqlite3.connect(staging / "reclaim.sqlite3")
        try:
            if database.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
                parser.error("database integrity check failed")
            tables = {row[0] for row in database.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            if not {"schema_migrations", "users", "reports", "evidence"}.issubset(tables):
                parser.error("database schema is incomplete")
            database_evidence = {
                f"evidence/{row[0]}": {"sha256": row[1], "sizeBytes": row[2]}
                for row in database.execute("SELECT storage_key,sha256,size_bytes FROM evidence")
            }
            if database_evidence != {
                key: {"sha256": item["sha256"], "sizeBytes": item["sizeBytes"]}
                for key, item in evidence_manifest.items()
            }:
                parser.error("database evidence receipts do not match the backup files")
            if database.execute("PRAGMA foreign_key_check").fetchone() is not None:
                parser.error("database foreign-key check failed")
            database.execute("DELETE FROM sessions")
            database.execute("DELETE FROM rate_buckets")
            database.commit()
        finally:
            database.close()

        os.chmod(staging, 0o700)
        os.replace(staging, destination)
    except BaseException:
        if staging.exists():
            shutil.rmtree(staging, ignore_errors=True)
        raise

    print(f"Verified restore created at: {destination}")
    print(f"Set RECLAIM_DATA_DIR={destination} and restart the API to use it. Existing data was not changed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
