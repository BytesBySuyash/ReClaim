from __future__ import annotations

import hashlib
import json
import re
import sqlite3
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, Request

from .config import Settings
from .db import audit, connect, now, transaction
from .priority import calculate
from .schemas import ReportInput

NEEDS = ("housing", "livelihood", "documents", "financial", "dependents")
IDEMPOTENCY_KEY = re.compile(r"^[A-Za-z0-9_-]{16,128}$")


def json_dump(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def disaster_known(settings: Settings, disaster_id: str) -> bool:
    with connect(settings.database) as db:
        return db.execute("SELECT 1 FROM disasters WHERE id=?", (disaster_id,)).fetchone() is not None


def scope_allowed(user: dict, disaster_id: str) -> bool:
    return "*" in user["scopes"] or disaster_id in user["scopes"]


def expected_version(request: Request) -> int:
    value = request.headers.get("if-match", "").strip().strip('"')
    if not value:
        raise HTTPException(status_code=428, detail="If-Match version is required")
    try:
        version = int(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="If-Match must contain the report version") from exc
    return version


def require_version(request: Request, row: sqlite3.Row) -> int:
    version = expected_version(request)
    if version != row["version"]:
        raise HTTPException(status_code=412, detail="Report changed; reload before editing")
    return version


def idempotent_response(db: sqlite3.Connection, user_id: str, key: str, route: str,
                        payload: Any) -> dict | None:
    if not IDEMPOTENCY_KEY.fullmatch(key):
        raise HTTPException(status_code=400, detail="A UUID-like Idempotency-Key is required")
    request_hash = hashlib.sha256(json_dump(payload).encode()).hexdigest()
    existing = db.execute(
        "SELECT request_hash,response_json FROM idempotency_keys WHERE actor_id=? AND key=? AND route=?",
        (user_id, key, route),
    ).fetchone()
    if existing:
        if existing["request_hash"] != request_hash:
            raise HTTPException(status_code=409, detail="Idempotency key was already used for another request")
        return json.loads(existing["response_json"])
    return None


def save_idempotency(db: sqlite3.Connection, user_id: str, key: str, route: str,
                     payload: Any, response: dict) -> None:
    request_hash = hashlib.sha256(json_dump(payload).encode()).hexdigest()
    db.execute(
        "INSERT INTO idempotency_keys VALUES(?,?,?,?,?,?)",
        (user_id, key, route, request_hash, json_dump(response), now()),
    )


def dto(db: sqlite3.Connection, row: sqlite3.Row) -> dict:
    data = json.loads(row["input_json"])
    priority = json.loads(row["priority_json"])
    priority["inputRevision"] = row["input_revision"]
    evidence = db.execute(
        "SELECT id,media_type,size_bytes FROM evidence WHERE report_id=? ORDER BY created_at,id",
        (row["id"],),
    ).fetchall()
    review = db.execute(
        """SELECT id,input_revision,observation_method,created_at,outcome FROM reviews
           WHERE report_id=? ORDER BY rowid DESC LIMIT 1""",
        (row["id"],),
    ).fetchone()
    assigned = None
    if row["assigned_worker_id"]:
        worker = db.execute("SELECT id,username FROM users WHERE id=?", (row["assigned_worker_id"],)).fetchone()
        if worker:
            assigned = {"id": worker["id"], "name": worker["username"]}
    current_review = review and review["input_revision"] == row["input_revision"]
    return {
        "id": row["id"], "version": row["version"], "inputRevision": row["input_revision"],
        "input": data, "createdAt": row["created_at"], "updatedAt": row["updated_at"],
        "isDemo": True, "assignedWorker": assigned, "reviewState": row["review_state"],
        "review": ({
            "id": review["id"], "inputRevision": review["input_revision"],
            "reviewedAt": review["created_at"], "observationMethod": review["observation_method"],
            "outcome": review["outcome"],
        } if current_review else None),
        "priority": priority,
        "evidence": [{
            "id": item["id"], "mediaType": item["media_type"], "bytes": item["size_bytes"],
            "reviewStatus": "unreviewed",
        } for item in evidence],
        "analysis": None,
    }


def create_report(settings: Settings, user: dict, body: dict, key: str) -> dict:
    if user["role"] != "citizen":
        raise HTTPException(status_code=403, detail="Only citizen sessions can submit reports")
    disaster_id = body["disasterId"]
    if not disaster_known(settings, disaster_id):
        raise HTTPException(status_code=422, detail="Unknown disaster event")
    body["needs"] = {key: body.get("needs", {}).get(key, "unknown") for key in NEEDS}
    report_id, created = str(uuid4()), now()
    with transaction(settings.database) as db:
        previous = idempotent_response(db, user["id"], key, "POST:/reports", body)
        if previous:
            return previous
        priority = calculate(body)
        db.execute(
            """INSERT INTO reports(id,owner_id,disaster_id,input_json,version,input_revision,
               review_state,priority_json,created_at,updated_at) VALUES(?,?,?,?,1,1,'unreviewed',?,?,?)""",
            (report_id, user["id"], disaster_id, json_dump(body), json_dump(priority), created, created),
        )
        db.execute("INSERT INTO report_revisions VALUES(?,?,?,?,?)",
                   (report_id, 1, json_dump(body), user["id"], created))
        audit(db, user["id"], report_id, "report_created", None, 1)
        response = dto(db, db.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone())
        save_idempotency(db, user["id"], key, "POST:/reports", body, response)
        return response


def list_reports(settings: Settings, user: dict, disaster_id: str,
                 limit: int, cursor: int, band: str | None = None) -> dict:
    if user["role"] == "govt":
        raise HTTPException(status_code=403, detail="Government sessions receive aggregate summaries only")
    if user["role"] == "ngo" and not scope_allowed(user, disaster_id):
        raise HTTPException(status_code=403, detail="Event is outside this account's scope")
    if user["role"] == "fieldworker":
        where, parameters = "disaster_id=? AND assigned_worker_id=?", [disaster_id, user["id"]]
    elif user["role"] == "citizen":
        where, parameters = "disaster_id=? AND owner_id=?", [disaster_id, user["id"]]
    else:
        where, parameters = "disaster_id=?", [disaster_id]
    if band:
        where += " AND json_extract(priority_json,'$.band')=?"
        parameters.append(band)
    with connect(settings.database) as db:
        rows = db.execute(
            f"SELECT * FROM reports WHERE {where} ORDER BY created_at DESC,id LIMIT ? OFFSET ?",
            (*parameters, limit + 1, cursor),
        ).fetchall()
        result = [dto(db, row) for row in rows[:limit]]
        total = db.execute(f"SELECT count(*) AS count FROM reports WHERE {where}", parameters).fetchone()["count"]
    return {"items": result, "nextCursor": str(cursor + limit) if len(rows) > limit else None, "total": total}


def get_report(settings: Settings, user: dict, report_id: str) -> dict:
    with connect(settings.database) as db:
        row = db.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        assert_access(user, row)
        return dto(db, row)


def assert_access(user: dict, row: sqlite3.Row) -> None:
    role = user["role"]
    allowed = (
        role == "citizen" and row["owner_id"] == user["id"]
        or role == "fieldworker" and row["assigned_worker_id"] == user["id"]
        or role == "ngo" and ("*" in user["scopes"] or row["disaster_id"] in user["scopes"])
    )
    if not allowed:
        raise HTTPException(status_code=404, detail="Report not found")


def patch_report(settings: Settings, user: dict, request: Request, report_id: str,
                 body: dict, key: str) -> dict:
    route = f"PATCH:/reports/{report_id}"
    with transaction(settings.database) as db:
        previous = idempotent_response(db, user["id"], key, route, body)
        if previous:
            return previous
        row = db.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        assert_access(user, row)
        if user["role"] != "citizen":
            raise HTTPException(status_code=403, detail="Only the report owner can edit report facts")
        old_version = require_version(request, row)
        incoming = json.loads(row["input_json"])
        for field in ("language", "story", "alias", "members", "occupation", "area", "immediateDanger", "needs"):
            if field in body:
                incoming[field] = body[field]
        incoming["needs"] = {name: incoming.get("needs", {}).get(name, "unknown") for name in NEEDS}
        try:
            incoming = ReportInput.model_validate(incoming).model_dump(mode="json", by_alias=True)
        except Exception as exc:
            raise HTTPException(status_code=422, detail="Edited report fields are invalid") from exc
        new_version, revision, stamp = old_version + 1, row["input_revision"] + 1, now()
        priority = calculate(incoming)
        db.execute(
            """UPDATE reports SET input_json=?,version=?,input_revision=?,review_state='unreviewed',
               priority_json=?,updated_at=? WHERE id=?""",
            (json_dump(incoming), new_version, revision, json_dump(priority), stamp, report_id),
        )
        db.execute("INSERT INTO report_revisions VALUES(?,?,?,?,?)",
                   (report_id, revision, json_dump(incoming), user["id"], stamp))
        audit(db, user["id"], report_id, "report_edited", old_version, new_version)
        response = dto(db, db.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone())
        save_idempotency(db, user["id"], key, route, body, response)
        return response


def assign_report(settings: Settings, user: dict, request: Request,
                  report_id: str, worker_id: str | None, key: str) -> dict:
    body, route = {"workerId": worker_id}, f"PUT:/reports/{report_id}/assignment"
    with transaction(settings.database) as db:
        previous = idempotent_response(db, user["id"], key, route, body)
        if previous:
            return previous
        row = db.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        if user["role"] != "ngo" or not scope_allowed(user, row["disaster_id"]):
            raise HTTPException(status_code=403, detail="Only an event-scoped organization can assign work")
        old_version = require_version(request, row)
        if worker_id:
            worker = db.execute("SELECT id,role,disaster_scopes,active FROM users WHERE id=?", (worker_id,)).fetchone()
            if not worker or worker["role"] != "fieldworker" or not worker["active"]:
                raise HTTPException(status_code=422, detail="Worker account is unavailable")
            scopes = json.loads(worker["disaster_scopes"])
            if "*" not in scopes and row["disaster_id"] not in scopes:
                raise HTTPException(status_code=422, detail="Worker is not scoped to this event")
        new_version = old_version + 1
        db.execute("UPDATE reports SET assigned_worker_id=?,version=?,updated_at=? WHERE id=?",
                   (worker_id, new_version, now(), report_id))
        audit(db, user["id"], report_id, "assignment_changed", old_version, new_version)
        response = dto(db, db.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone())
        save_idempotency(db, user["id"], key, route, body, response)
        return response


def submit_review(settings: Settings, user: dict, request: Request, report_id: str,
                  body: dict, key: str) -> dict:
    route = f"POST:/reports/{report_id}/reviews"
    with transaction(settings.database) as db:
        previous = idempotent_response(db, user["id"], key, route, body)
        if previous:
            return previous
        row = db.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        if user["role"] == "fieldworker":
            if row["assigned_worker_id"] != user["id"]:
                raise HTTPException(status_code=403, detail="This report is not assigned to this worker")
        elif user["role"] == "ngo":
            if not scope_allowed(user, row["disaster_id"]):
                raise HTTPException(status_code=403, detail="Event is outside this account's scope")
        else:
            raise HTTPException(status_code=403, detail="This account cannot review reports")
        old_version = require_version(request, row)
        if body["outcome"] == "confirmed" and user["role"] != "fieldworker":
            raise HTTPException(status_code=403, detail="Only the assigned field worker can confirm a field visit")
        if body["outcome"] == "confirmed" and body["observationMethod"] != "field_visit":
            raise HTTPException(status_code=422, detail="A report can be confirmed only after a recorded field visit")
        data = json.loads(row["input_json"])
        is_field_confirmation = body["outcome"] == "confirmed" and body["observationMethod"] == "field_visit"
        new_version, stamp = old_version + 1, now()
        revision = row["input_revision"] + 1 if is_field_confirmation else row["input_revision"]
        outcome, review_id = body["outcome"], str(uuid4())
        if is_field_confirmation:
            data["needs"] = {name: body["reviewedNeeds"].get(name, "unknown") for name in NEEDS}
            data["immediateDanger"] = body["reviewedImmediateDanger"]
            priority = calculate(data, review="reviewer")
            db.execute(
                """UPDATE reports SET input_json=?,version=?,input_revision=?,review_state=?,priority_json=?,updated_at=?
                   WHERE id=?""",
                (json_dump(data), new_version, revision, outcome, json_dump(priority), stamp, report_id),
            )
            db.execute("INSERT INTO report_revisions VALUES(?,?,?,?,?)",
                       (report_id, revision, json_dump(data), user["id"], stamp))
        else:
            db.execute("UPDATE reports SET version=?,review_state=?,updated_at=? WHERE id=?",
                       (new_version, outcome, stamp, report_id))
        db.execute(
            "INSERT INTO reviews VALUES(?,?,?,?,?,?,?,?,?)",
            (review_id, report_id, user["id"], revision, outcome, body["observationMethod"],
             body.get("notes", ""), json_dump({
                 "needs": body["reviewedNeeds"],
                 "immediateDanger": body["reviewedImmediateDanger"],
             }), stamp),
        )
        audit(db, user["id"], report_id, "human_review_recorded", old_version, new_version)
        response = dto(db, db.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone())
        save_idempotency(db, user["id"], key, route, body, response)
        return response
