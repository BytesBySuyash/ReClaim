from __future__ import annotations

import hashlib
import json
import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from .auth import (
    COOKIE_NAME, create_session, current_session, ensure_origin,
    limit_action, require_csrf, set_session_cookie, verify_password,
)
from .catalog import DISASTERS
from .config import Settings
from .db import connect, initialize, now, transaction
from .evidence import open_evidence, store_upload
from .reports import (
    assert_access, create_report, get_report, list_reports, patch_report, scope_allowed,
    submit_review, assign_report,
)
from .schemas import AssignmentInput, LoginInput, ReportInput, ReviewInput

settings = Settings.from_env()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.allowed_origins:
        raise RuntimeError("Set RECLAIM_ALLOWED_ORIGINS before starting the API")
    initialize(settings)
    yield


app = FastAPI(title="ReClaim Demo API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "If-Match", "Idempotency-Key", "X-CSRF-Token"],
)


@app.middleware("http")
async def limit_upload_request_size(request: Request, call_next):
    if request.url.path.startswith("/api/") and request.method in {"POST", "PUT", "PATCH"}:
        declared_size = request.headers.get("content-length")
        if declared_size:
            try:
                maximum = 5 * 1024 * 1024 + 64 * 1024 if request.url.path.endswith("/evidence") else 64 * 1024
                too_large = int(declared_size) > maximum
            except ValueError:
                return JSONResponse({"detail": "Invalid Content-Length"}, status_code=400)
            if too_large:
                return JSONResponse({"detail": "Request exceeds the size limit"}, status_code=413)
    response = await call_next(request)
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
    return response


def signed_in(request: Request) -> dict:
    return current_session(request, settings)


@app.get("/health/live")
def health_live() -> dict:
    return {"status": "alive"}


@app.get("/health/ready")
def health_ready() -> dict:
    try:
        with connect(settings.database) as db:
            db.execute("SELECT 1").fetchone()
        writable = settings.evidence_dir.is_dir() and settings.evidence_dir.stat().st_mode & 0o222
    except (OSError, sqlite3.Error):
        raise HTTPException(status_code=503, detail="Storage is unavailable")
    if not writable:
        raise HTTPException(status_code=503, detail="Evidence storage is unavailable")
    return {"status": "ready", "model": "not_configured"}


@app.post("/api/v1/auth/guest")
def create_guest(request: Request, response: Response) -> dict:
    ensure_origin(request, settings)
    limit_action(settings, request, "guest", 8, 3600)
    user_id = str(uuid4())
    with transaction(settings.database) as db:
        db.execute("INSERT INTO users(id,role,disaster_scopes,created_at) VALUES(?,'citizen','[]',?)",
                   (user_id, now()))
        return create_session(db, user_id, settings, response)


@app.get("/api/v1/auth/session")
def read_session(user: dict = Depends(signed_in)) -> dict:
    return {
        "userId": user["id"], "username": user["username"], "role": user["role"],
        "disasterScopes": user["scopes"], "csrfToken": user["csrfToken"], "expiresAt": user["expiresAt"],
    }


@app.post("/api/v1/auth/login")
def login(body: LoginInput, request: Request, response: Response) -> dict:
    ensure_origin(request, settings)
    client = request.client.host if request.client else "unknown"
    limit_action(settings, request, "login", 8, 900, actor=f"{body.username.casefold()}:{client}")
    with connect(settings.database) as db:
        row = db.execute("SELECT * FROM users WHERE username=? AND active=1", (body.username,)).fetchone()
    if not row or not row["password_hash"] or not verify_password(row["password_hash"], body.password):
        raise HTTPException(status_code=401, detail="Username or password is incorrect")
    with transaction(settings.database) as db:
        db.execute("DELETE FROM sessions WHERE user_id=?", (row["id"],))
        return create_session(db, row["id"], settings, response)


@app.post("/api/v1/auth/logout", status_code=204)
def logout(request: Request, response: Response, user: dict = Depends(signed_in)) -> Response:
    require_csrf(request, user, settings)
    token = request.cookies.get(COOKIE_NAME, "")
    with transaction(settings.database) as db:
        db.execute("DELETE FROM sessions WHERE token_hash=?", (hashlib.sha256(token.encode()).hexdigest(),))
    response.delete_cookie(COOKIE_NAME, path="/", secure=settings.cookie_secure, httponly=True, samesite="lax")
    return response


@app.get("/api/v1/disasters")
def disaster_catalog() -> dict:
    with connect(settings.database) as db:
        items = [dict(row) for row in db.execute("SELECT id,name,state,district,year FROM disasters ORDER BY year DESC,id")]
    return {"items": items, "source": "api_catalog"}


@app.post("/api/v1/reports", status_code=201)
def post_report(body: ReportInput, request: Request, user: dict = Depends(signed_in),
                idempotency_key: str = Header(alias="Idempotency-Key")) -> dict:
    require_csrf(request, user, settings)
    limit_action(settings, request, "report", 10, 3600, actor=user["id"])
    return create_report(settings, user, body.model_dump(mode="json", by_alias=True), idempotency_key)


@app.get("/api/v1/reports")
def reports(disasterId: str, limit: int = 50, cursor: int = 0, band: str | None = None,
            user: dict = Depends(signed_in)) -> dict:
    if disasterId not in DISASTERS:
        raise HTTPException(status_code=404, detail="Disaster event not found")
    return list_reports(settings, user, disasterId, min(max(limit, 1), 100), max(cursor, 0), band)


@app.get("/api/v1/reports/{report_id}")
def report(report_id: str, user: dict = Depends(signed_in)) -> dict:
    return get_report(settings, user, report_id)


@app.patch("/api/v1/reports/{report_id}")
def edit_report(report_id: str, body: dict, request: Request, user: dict = Depends(signed_in),
                idempotency_key: str = Header(alias="Idempotency-Key")) -> dict:
    require_csrf(request, user, settings)
    limit_action(settings, request, "edit", 30, 3600, actor=user["id"])
    allowed = {"language", "story", "alias", "members", "occupation", "area", "immediateDanger", "needs"}
    if not body or set(body) - allowed:
        raise HTTPException(status_code=422, detail="Only editable report facts are accepted")
    return patch_report(settings, user, request, report_id, body, idempotency_key)


@app.post("/api/v1/reports/{report_id}/evidence", status_code=201)
def upload(report_id: str, request: Request, user: dict = Depends(signed_in),
           idempotency_key: str = Header(alias="Idempotency-Key"),
           file: UploadFile = File(...)) -> dict:
    require_csrf(request, user, settings)
    limit_action(settings, request, "upload", 12, 3600, actor=user["id"])
    return store_upload(settings, user, request, report_id, file, idempotency_key)


@app.get("/api/v1/evidence/{evidence_id}/content")
def evidence(evidence_id: str, user: dict = Depends(signed_in)):
    return open_evidence(settings, user, evidence_id)


@app.post("/api/v1/reports/{report_id}/analysis")
def analyze(report_id: str, request: Request, user: dict = Depends(signed_in)) -> dict:
    require_csrf(request, user, settings)
    limit_action(settings, request, "analysis", 6, 60, actor=user["id"])
    current = get_report(settings, user, report_id)
    return {
        "reportId": report_id, "inputRevision": current["inputRevision"],
        "state": "rules_only", "modelVersion": None,
        "priority": current["priority"],
        "message": "No trained classifier is configured. Priority uses the published demo rules.",
    }


@app.get("/api/v1/workers")
def workers(disasterId: str, user: dict = Depends(signed_in)) -> dict:
    if user["role"] != "ngo" or not scope_allowed(user, disasterId):
        raise HTTPException(status_code=403, detail="Only event-scoped organizations can list workers")
    with connect(settings.database) as db:
        rows = db.execute("SELECT id,username,disaster_scopes FROM users WHERE role='fieldworker' AND active=1 ORDER BY username").fetchall()
    items = [{"id": row["id"], "name": row["username"]} for row in rows
             if "*" in json.loads(row["disaster_scopes"]) or disasterId in json.loads(row["disaster_scopes"])]
    return {"items": items}


@app.put("/api/v1/reports/{report_id}/assignment")
def assign(report_id: str, body: AssignmentInput, request: Request, user: dict = Depends(signed_in),
           idempotency_key: str = Header(alias="Idempotency-Key")) -> dict:
    require_csrf(request, user, settings)
    limit_action(settings, request, "assign", 60, 3600, actor=user["id"])
    return assign_report(settings, user, request, report_id, body.workerId, idempotency_key)


@app.post("/api/v1/reports/{report_id}/reviews")
def review(report_id: str, body: ReviewInput, request: Request, user: dict = Depends(signed_in),
           idempotency_key: str = Header(alias="Idempotency-Key")) -> dict:
    require_csrf(request, user, settings)
    limit_action(settings, request, "review", 30, 3600, actor=user["id"])
    return submit_review(settings, user, request, report_id, body.model_dump(mode="json", by_alias=True), idempotency_key)


@app.get("/api/v1/reports/{report_id}/history")
def history(report_id: str, user: dict = Depends(signed_in)) -> dict:
    with connect(settings.database) as db:
        row = db.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        if user["role"] == "govt":
            raise HTTPException(status_code=403, detail="Personal history is not available to government dashboard users")
        assert_access(user, row)
        events = db.execute(
            """SELECT action,old_version,new_version,reason,created_at FROM audit_events
               WHERE report_id=? ORDER BY rowid""", (report_id,),
        ).fetchall()
        reviews = db.execute(
            """SELECT outcome,observation_method,input_revision,notes,facts_json,created_at FROM reviews
               WHERE report_id=? ORDER BY rowid""", (report_id,),
        ).fetchall()
    return {
        "events": [{
            "action": item["action"], "oldVersion": item["old_version"],
            "newVersion": item["new_version"], "createdAt": item["created_at"],
        } for item in events],
        "reviews": [{
            "outcome": item["outcome"], "observationMethod": item["observation_method"],
            "inputRevision": item["input_revision"], "notes": item["notes"],
            "reviewedFacts": json.loads(item["facts_json"]),
            "createdAt": item["created_at"],
        } for item in reviews],
    }


@app.get("/api/v1/dashboard/summary")
def summary(disasterId: str, user: dict = Depends(signed_in)) -> dict:
    if user["role"] not in ("ngo", "govt"):
        raise HTTPException(status_code=403, detail="Dashboard summaries require an organization or government account")
    if disasterId not in DISASTERS or not scope_allowed(user, disasterId):
        raise HTTPException(status_code=403, detail="Event is outside this account's scope")
    with connect(settings.database) as db:
        rows = db.execute(
            """SELECT json_extract(priority_json,'$.band') band,review_state,count(*) count
               FROM reports WHERE disaster_id=? GROUP BY band,review_state""", (disasterId,),
        ).fetchall()
        total = sum(item["count"] for item in rows)
    by_band = {name: 0 for name in ("critical", "high", "moderate", "low", "unscored")}
    review_counts = {name: 0 for name in ("unreviewed", "needs_visit", "confirmed", "disputed")}
    for item in rows:
        by_band[item["band"]] += item["count"]
        review_counts[item["review_state"]] += item["count"]
    return {
        "asOf": now(), "source": "persisted_reports", "reportedCount": total,
        "scoredCount": total - by_band["unscored"], "unscoredCount": by_band["unscored"],
        "verifiedCount": review_counts["confirmed"], "byBand": by_band, "reviews": review_counts,
        "affectedEstimate": None,
    }


# The compiled frontend may share the API origin. Keep API failures as JSON;
# only non-API paths use the SPA fallback.
@app.get("/{path:path}", include_in_schema=False)
def frontend(path: str):
    dist = Path(__file__).resolve().parents[2] / "dist"
    if path.startswith(("api/", "health/")):
        raise HTTPException(status_code=404, detail="Route not found")
    candidate = dist / path
    if candidate.is_file() and dist in candidate.resolve().parents:
        return FileResponse(candidate)
    if (dist / "index.html").is_file():
        return FileResponse(dist / "index.html")
    raise HTTPException(status_code=404, detail="Frontend is not built")

