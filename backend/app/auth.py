from __future__ import annotations

import hashlib
import json
import secrets
import time
from typing import Any

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import HTTPException, Request, Response

from .config import Settings
from .db import connect, now, transaction

COOKIE_NAME = "reclaim_session"
PASSWORDS = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)


def digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def ensure_origin(request: Request, settings: Settings) -> None:
    origin = request.headers.get("origin", "").rstrip("/")
    if not origin or origin not in settings.allowed_origins:
        raise HTTPException(status_code=403, detail="Untrusted request origin")


def client_bucket(request: Request) -> str:
    # Do not trust X-Forwarded-For unless a trusted proxy is configured.
    return digest(request.client.host if request.client else "unknown")


def limit_action(settings: Settings, request: Request, action: str, limit: int,
                 window_seconds: int, actor: str | None = None) -> None:
    bucket = digest(actor) if actor else client_bucket(request)
    window = int(time.time()) // window_seconds
    with transaction(settings.database) as db:
        db.execute(
            "INSERT INTO rate_buckets(bucket_key,action,window_start,hits) VALUES(?,?,?,1) "
            "ON CONFLICT(bucket_key,action,window_start) DO UPDATE SET hits=hits+1",
            (bucket, action, window),
        )
        row = db.execute(
            "SELECT hits FROM rate_buckets WHERE bucket_key=? AND action=? AND window_start=?",
            (bucket, action, window),
        ).fetchone()
        over_limit = row["hits"] > limit
    if over_limit:
        raise HTTPException(status_code=429, detail="Request limit reached; try again later")


def set_session_cookie(response: Response, token: str, settings: Settings) -> None:
    response.set_cookie(
        COOKIE_NAME, token, httponly=True, secure=settings.cookie_secure,
        samesite="lax", path="/", max_age=settings.session_hours * 3600,
    )


def create_session(db: Any, user_id: str, settings: Settings, response: Response) -> dict:
    token = secrets.token_urlsafe(32)
    csrf = secrets.token_urlsafe(32)
    expires = int(time.time()) + settings.session_hours * 3600
    from datetime import datetime, timezone

    expires_at = datetime.fromtimestamp(expires, timezone.utc).isoformat(timespec="seconds")
    db.execute(
        "INSERT INTO sessions(token_hash,csrf_token,user_id,expires_at,created_at) VALUES(?,?,?,?,?)",
        (digest(token), csrf, user_id, expires_at, now()),
    )
    set_session_cookie(response, token, settings)
    user = db.execute("SELECT id,username,role,disaster_scopes FROM users WHERE id=?", (user_id,)).fetchone()
    return {
        "userId": user["id"], "username": user["username"], "role": user["role"],
        "disasterScopes": json.loads(user["disaster_scopes"]),
        "csrfToken": csrf, "expiresAt": expires_at,
    }


def current_session(request: Request, settings: Settings) -> dict:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Sign in to continue")
    with connect(settings.database) as db:
        row = db.execute(
            """SELECT u.id,u.username,u.role,u.disaster_scopes,s.csrf_token,s.expires_at
               FROM sessions s JOIN users u ON u.id=s.user_id
               WHERE s.token_hash=? AND u.active=1""",
            (digest(token),),
        ).fetchone()
    if not row or row["expires_at"] <= now():
        raise HTTPException(status_code=401, detail="Session expired; sign in again")
    return {
        "id": row["id"], "username": row["username"], "role": row["role"],
        "scopes": json.loads(row["disaster_scopes"]), "csrfToken": row["csrf_token"],
        "expiresAt": row["expires_at"],
    }


def require_csrf(request: Request, user: dict, settings: Settings) -> None:
    ensure_origin(request, settings)
    supplied = request.headers.get("x-csrf-token", "")
    if not supplied or not secrets.compare_digest(supplied, user["csrfToken"]):
        raise HTTPException(status_code=403, detail="Invalid CSRF token")


def verify_password(encoded: str, raw: str) -> bool:
    try:
        return PASSWORDS.verify(encoded, raw)
    except (VerifyMismatchError, ValueError):
        return False

