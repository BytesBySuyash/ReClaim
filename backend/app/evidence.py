from __future__ import annotations

import hashlib
import io
import os
from pathlib import Path
from uuid import uuid4
import warnings

from fastapi import HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from PIL import Image, ImageOps, UnidentifiedImageError

from .auth import limit_action
from .config import Settings
from .db import audit, connect, now, transaction
from .reports import assert_access, dto, expected_version, idempotent_response, require_version, save_idempotency

MAX_BYTES = 5 * 1024 * 1024
MAX_PIXELS = 12_000_000
MAX_IMAGES = 3
ALLOWED_MEDIA = {"image/jpeg", "image/png"}


def store_upload(settings: Settings, user: dict, request: Request, report_id: str,
                 file: UploadFile, key: str) -> dict:
    if user["role"] not in ("citizen", "fieldworker"):
        raise HTTPException(status_code=403, detail="This account cannot attach evidence")
    if file.content_type not in ALLOWED_MEDIA:
        raise HTTPException(status_code=415, detail="Upload a JPEG or PNG damage photo")
    with connect(settings.database) as db:
        row = db.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        assert_access(user, row)
        expected = expected_version(request)
    raw = file.file.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Photo exceeds the 5 MiB limit")
    if not raw:
        raise HTTPException(status_code=422, detail="Photo is empty")
    try:
        warnings.simplefilter("error", Image.DecompressionBombWarning)
        with Image.open(io.BytesIO(raw)) as image:
            if image.format not in ("JPEG", "PNG") or image.width * image.height > MAX_PIXELS:
                raise HTTPException(status_code=415, detail="Photo format or dimensions are unsupported")
            image.verify()
        with Image.open(io.BytesIO(raw)) as image:
            clean = ImageOps.exif_transpose(image).convert("RGB")
            output = io.BytesIO()
            clean.save(output, format="JPEG", quality=90, optimize=True)
            normalized = output.getvalue()
            if len(normalized) > MAX_BYTES:
                raise HTTPException(status_code=413, detail="Normalized photo exceeds the 5 MiB storage limit")
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
        raise HTTPException(status_code=415, detail="Photo could not be decoded safely") from exc
    image_hash = hashlib.sha256(normalized).hexdigest()
    route = f"POST:/reports/{report_id}/evidence"
    payload = {"sha256": image_hash, "expectedVersion": expected}
    key = key.strip()
    temp_path: Path | None = None
    final_path: Path | None = None
    with transaction(settings.database) as db:
        row = db.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        assert_access(user, row)
        previous = idempotent_response(db, user["id"], key, route, payload)
        if previous:
            return previous
        old_version = require_version(request, row)
        count = db.execute("SELECT count(*) AS n FROM evidence WHERE report_id=?", (report_id,)).fetchone()["n"]
        if count >= MAX_IMAGES:
            raise HTTPException(status_code=422, detail="A report can include up to three photos")
        duplicate = db.execute("SELECT id FROM evidence WHERE report_id=? AND sha256=?", (report_id, image_hash)).fetchone()
        if duplicate:
            raise HTTPException(status_code=409, detail="This exact photo is already attached to the report")
        evidence_id = str(uuid4())
        storage_key = evidence_id + ".jpg"
        final_path = settings.evidence_dir / storage_key
        temp_path = settings.evidence_dir / ("." + storage_key + ".tmp")
        try:
            temp_path.write_bytes(normalized)
            os.chmod(temp_path, 0o600)
            os.replace(temp_path, final_path)
            stamp, new_version = now(), old_version + 1
            db.execute(
                "INSERT INTO evidence VALUES(?,?,?,?,?,?,?,?)",
                (evidence_id, report_id, user["id"], storage_key, image_hash, "image/jpeg", len(normalized), stamp),
            )
            db.execute("UPDATE reports SET version=?,updated_at=? WHERE id=?",
                       (new_version, stamp, report_id))
            audit(db, user["id"], report_id, "evidence_attached", old_version, new_version)
            response = dto(db, db.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone())
            save_idempotency(db, user["id"], key, route, payload, response)
        except Exception:
            if final_path.exists():
                final_path.unlink()
            if temp_path.exists():
                temp_path.unlink()
            raise
    return response


def open_evidence(settings: Settings, user: dict, evidence_id: str) -> FileResponse:
    with connect(settings.database) as db:
        row = db.execute(
            """SELECT e.storage_key,e.media_type,r.* FROM evidence e JOIN reports r ON r.id=e.report_id
               WHERE e.id=?""",
            (evidence_id,),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Evidence not found")
    assert_access(user, row)
    path = settings.evidence_dir / row["storage_key"]
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Evidence file is unavailable")
    return FileResponse(path, media_type=row["media_type"], headers={
        "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
    })

