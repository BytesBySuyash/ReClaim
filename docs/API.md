# ReClaim demo API

The API supports a fictional-data workflow for local demonstrations. GitHub Pages remains a fixture-only frontend. The local service is not a public claims system and does not include a trained AI model, benefits eligibility rules, or emergency dispatch.

## Local setup

Use Docker Compose from the repository root:

```sh
docker compose up --build
```

Open `http://localhost:8000`. The container is bound to loopback and stores its SQLite database and normalized images in the `reclaim-data` volume. Create a local staff account by choosing a unique 12-character-or-longer password at the prompt:

```sh
docker compose exec reclaim python -m backend.scripts.bootstrap_user --username reviewer --role ngo --scope assam-kamrup-2026
docker compose exec reclaim python -m backend.scripts.bootstrap_user --username field-demo --role fieldworker --scope assam-kamrup-2026
```

For split frontend/API development, copy `.env.example` to `.env`, create a Python 3.12 virtual environment, and install `backend/requirements.txt`. Load the environment in both terminal sessions with `set -a; . ./.env; set +a`. Run `npm run api:dev` in one terminal and `npm run dev` in the other. Vite proxies `/api` to port 8000. The Vite origin is permitted by the example configuration. When `VITE_DATA_MODE` is unset, the app uses the original fixture screens.

## Stored data and retention

The API creates a report only after citizen submission; no sample households are seeded. It stores account/session metadata, report revisions, review notes, assignment history, and normalized photos under `RECLAIM_DATA_DIR` (default `./data`). Keep that directory private and out of version control. The local API is configured for one process and one local demo host. It has manual backup and restore commands, but no scheduled/offsite backup, monitoring, or multi-instance setup.

### Manual backup and restore

Use fictional records only. Pause API writes and do not run the purge command while making or restoring a backup. From the repository root, with the same environment as the API:

```sh
python -m backend.scripts.backup_data
python -m backend.scripts.restore_data \
  --archive ./data/backups/reclaim-YYYYMMDDTHHMMSSZ.zip \
  --destination ./restored-data
```

The backup command writes a timestamped ZIP below `RECLAIM_DATA_DIR/backups` by default. It snapshots SQLite, includes only evidence referenced by the database, and records SHA-256 checksums. Restore rejects unsafe archive paths and mismatched checksums, validates SQLite integrity and evidence receipts, clears sessions and rate-limit buckets, and refuses to overwrite an existing destination. Point `RECLAIM_DATA_DIR` at the restored directory before restarting the API. Checksums detect accidental corruption; they do not authenticate the source archive. Keep archives encrypted and access-controlled, and restore only backups from a trusted source.

Data remains until explicitly purged. Run `python -m backend.scripts.purge_expired --days 30` in a local setup or `docker compose exec reclaim python -m backend.scripts.purge_expired --days 30` to delete older reports and their evidence, expired sessions, orphaned anonymous accounts, and rate-limit buckets. This action is destructive and only happens when an operator runs the command.

## Prioritization and human review

The analysis endpoint returns `state: rules_only` and `modelVersion: null`. `hrvs-demo-v1` is an explicit, deterministic policy example, not a validated allocation standard. It scores five self-reported or field-reviewed need categories; if any answer is unknown, the report remains unscored. An immediate-danger response raises an urgent human-review flag without adding score points. The API returns the policy version, input revision, factor contributions, and factor sources.

Remote review can request a visit or flag a follow-up. It stores the review notes and proposed facts without changing the score. Only the currently assigned field worker can confirm a review, and a confirmation must state `observationMethod: field_visit`; only then are reviewed facts used to recalculate the score. This role check does not prove that a visit physically happened, so the action remains an auditable human attestation. Scores never determine eligibility, compensation, or automated resource allocation.

Photos are optional supporting material, not proof of identity, damage, or authenticity. Uploads are limited to three JPEG/PNG files per report, 5 MiB and 12 megapixels each. The service decodes and re-encodes them to remove EXIF metadata, stores them outside the public web directory, and serves them only to a user with report access. Do not upload identity, banking, or medical documents.

## API paths

| Method | Path | Access |
|---|---|---|
| `GET` | `/health/live`, `/health/ready` | Public minimal health |
| `POST`, `GET` | `/api/v1/auth/guest`, `/api/v1/auth/session` | Create/inspect current browser session |
| `POST` | `/api/v1/auth/login`, `/api/v1/auth/logout` | Provisioned staff account |
| `GET` | `/api/v1/disasters` | Catalog metadata only |
| `POST`, `GET`, `PATCH` | `/api/v1/reports`, `/api/v1/reports/{id}` | Submit; read by owner, assigned worker, or scoped organization; edit by owner |
| `POST` | `/api/v1/reports/{id}/evidence` | Owner or assigned field worker |
| `GET` | `/api/v1/evidence/{id}/content` | Owner, assigned worker, or scoped organization |
| `POST` | `/api/v1/reports/{id}/analysis` | Authorized report reader; deterministic policy only |
| `GET` | `/api/v1/workers?disasterId=...` | Event-scoped organization |
| `PUT` | `/api/v1/reports/{id}/assignment` | Event-scoped organization |
| `POST`, `GET` | `/api/v1/reports/{id}/reviews`, `/api/v1/reports/{id}/history` | Assigned worker or scoped organization |
| `GET` | `/api/v1/dashboard/summary?disasterId=...` | Scoped organization or aggregate-only government account |

All writes after session creation require `X-CSRF-Token` and an exact trusted `Origin`. Create/update/assignment/review/evidence writes require `Idempotency-Key`; report edits, evidence uploads, assignments, and reviews require `If-Match: "<version>"`. A 412 response means reload and review the current record before editing.

## Hosting boundary

The public site is a static fixture build. No public API host is configured. The optional single-container API build is intended for local loopback only. A real service would need independent security review, HTTPS and secure-cookie configuration, private durable storage, access recovery, operational ownership, monitoring, backups, retention/deletion operations, and evaluation before it accepted any real case data. Do not expose this demo API to real claims.
