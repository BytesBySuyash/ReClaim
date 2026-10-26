PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL CHECK (role IN ('citizen','fieldworker','ngo','govt')),
  disaster_scopes TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  csrf_token TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_buckets (
  bucket_key TEXT NOT NULL,
  action TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  hits INTEGER NOT NULL,
  PRIMARY KEY(bucket_key, action, window_start)
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id),
  disaster_id TEXT NOT NULL,
  input_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  input_revision INTEGER NOT NULL DEFAULT 1,
  assigned_worker_id TEXT REFERENCES users(id),
  review_state TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (review_state IN ('unreviewed','needs_visit','confirmed','disputed')),
  priority_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reports_event_priority ON reports(disaster_id, created_at);
CREATE INDEX IF NOT EXISTS reports_assignee ON reports(assigned_worker_id, disaster_id, created_at);

CREATE TABLE IF NOT EXISTS report_revisions (
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,
  input_json TEXT NOT NULL,
  actor_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL,
  PRIMARY KEY(report_id, revision)
);

CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  uploader_id TEXT NOT NULL REFERENCES users(id),
  storage_key TEXT NOT NULL UNIQUE,
  sha256 TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image/jpeg','image/png')),
  size_bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS evidence_report_hash ON evidence(report_id, sha256);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES users(id),
  input_revision INTEGER NOT NULL,
  outcome TEXT NOT NULL,
  observation_method TEXT NOT NULL,
  notes TEXT NOT NULL,
  facts_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reviews_report ON reviews(report_id, created_at);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  actor_id TEXT NOT NULL REFERENCES users(id),
  key TEXT NOT NULL,
  route TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(actor_id, key, route)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES users(id),
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_version INTEGER,
  new_version INTEGER,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

