# RECLAIM

**A disaster recovery coordination demo built with React, TypeScript, Vite, and an optional FastAPI service.**

RECLAIM brings four perspectives into one interface: a resident reporting losses, a field worker verifying a household, an organization coordinating response, and a government team reviewing activity across disaster events.

[Open the demo](https://bytesbysuyash.github.io/ReClaim/) · [Browse the source](https://github.com/BytesBySuyash/ReClaim)

> **Demo data:** The public Pages site runs in fixture mode: it does not send reports to a server, and its case records, dashboard figures, and analysis results are examples. An optional local API mode stores reports in a local SQLite database. Use fictional information only in either mode.

## Screens from the demo

The screenshots below show the app at desktop size. The records and names shown are sample data.

| Citizen reporting | Recovery plan |
| --- | --- |
| ![Citizen reporting screen with voice and text reporting](https://raw.githubusercontent.com/BytesBySuyash/ReClaim/main/docs/screenshots/citizen.png) | ![Recovery plan arranged by time horizon](https://raw.githubusercontent.com/BytesBySuyash/ReClaim/main/docs/screenshots/recovery-plan.png) |

| Field response | Organization operations |
| --- | --- |
| ![Field worker assignment queue with verification and evidence tools](https://raw.githubusercontent.com/BytesBySuyash/ReClaim/main/docs/screenshots/field-worker.png) | ![Organization household dashboard with vulnerability and response status](https://raw.githubusercontent.com/BytesBySuyash/ReClaim/main/docs/screenshots/operations.png) |

**Government overview**

![Government dashboard summarizing disaster events, household counts, and relief activity](https://raw.githubusercontent.com/BytesBySuyash/ReClaim/main/docs/screenshots/government.png)

## What you can explore

- **Citizen / Victim:** Explore the reporting, evidence, household profile, recovery plan, and help resources screens. The voice control inserts a sample transcript; it is not live speech recognition.
- **Field Worker:** Review assigned households, verification tasks, evidence capture, and field notes.
- **Organization:** Review household priorities, recovery intelligence, map views, field workers, budgets, and schemes.
- **Government:** Compare active events and open district, scheme, budget, and map views.

Use the top controls to switch roles, change the selected disaster, and choose a language. Fixture mode has no login; API mode uses guest citizen sessions and provisioned staff accounts. Some selections are reflected in the URL, so a view can be shared or reopened directly.

## What this project demonstrates

- A single app shell connecting four role-specific workflows over the same disaster data.
- Typed React components with reusable UI and a shared data model for households, interventions, and disaster events.
- URL-backed role and disaster selection, plus browser-stored language and theme preferences.
- Map-based views using React Leaflet, with dashboard screens loaded on demand to keep the initial bundle smaller.
- A release workflow that runs TypeScript checks and a production build, then publishes the static site through GitHub Pages.

The default Pages build displays fixed sample analysis results. The optional local API mode uses a published, deterministic rules policy; no trained text model is configured.

## Run locally

Requirements for the frontend: Node.js 22 and npm.

```bash
npm ci
npm run dev
```

Vite prints the local URL. Check a change and build the static site with:

```bash
npm run typecheck
npm run build
```

To serve the production build locally, run `npm run preview` after building.

## Run the local API demo

The API mode is a separate, opt-in local demo. It creates a SQLite database and stores uploaded photos on the machine running the server. Do not enter real personal, financial, identity, or case information. The included Docker Compose setup binds to `127.0.0.1` so the demo is not exposed on the network.

With Docker Compose installed:

```bash
docker compose up --build
```

Open http://localhost:8000. Create local organization, field-worker, and government accounts as needed. Choose a unique password of at least 12 characters at each prompt:

```bash
docker compose exec reclaim python -m backend.scripts.bootstrap_user --username org-demo --role ngo --scope assam-kamrup-2026
docker compose exec reclaim python -m backend.scripts.bootstrap_user --username field-demo --role fieldworker --scope assam-kamrup-2026
docker compose exec reclaim python -m backend.scripts.bootstrap_user --username government-demo --role govt
```

For the split Vite and API development setup, copy `.env.example` to `.env`, create a Python 3.12 virtual environment, and install `backend/requirements.txt`. Load the environment in both terminal sessions with `set -a; . ./.env; set +a`; then run `npm run api:dev` in one terminal and `npm run dev` in the other. Vite proxies `/api` to the local FastAPI server. The static fixture mode remains the default when `VITE_DATA_MODE` is unset.

The API supports anonymous citizen sessions, scoped staff accounts, report submission and editing, private JPEG/PNG evidence uploads, assignment, human review, and aggregate counts. The scoring policy uses only explicitly reported need fields. If any need is unknown, it leaves the report unscored. An immediate-danger response raises a human-review flag but is not a score. Scores do not establish eligibility or allocate benefits. A remote review cannot confirm a report; confirmation requires a recorded field visit. Images are resized/re-encoded to strip metadata, and they do not establish authenticity.

The API only includes a rules-only analysis endpoint (`state: rules_only`). It does not call an LLM or trained model. No training dataset or deployment-ready classifier is included. The optional database and image directory are retained until an operator explicitly runs `python -m backend.scripts.purge_expired --days 30` (or the equivalent command inside the container).

For a local backup, pause API writes and run `python -m backend.scripts.backup_data`; it writes a timestamped archive under `RECLAIM_DATA_DIR/backups`. Restore with `python -m backend.scripts.restore_data --archive <backup.zip> --destination <new-data-directory>`, then point `RECLAIM_DATA_DIR` at that new directory before restarting the API. Do not run purge during backup or restore. Archives contain private report data; keep them encrypted and access-controlled. Checksums detect corruption but do not authenticate the source archive.

## Tech stack

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4
- React Leaflet and Leaflet
- GitHub Actions for checks and GitHub Pages deployment
- FastAPI, SQLite, Argon2 password hashing, and Pillow for the optional local API demo

## Project map

- `src/App.tsx` — app shell, navigation, and role, disaster, and language selection.
- `src/views/` — citizen, field worker, organization, and government screens.
- `src/components/` — shared tools, recovery UI, maps, and feature controls.
- `src/data/disasters.ts` — bundled sample events and household data.
- `src/api/`, `src/services/api.ts`, and `src/views/ApiWorkspace.tsx` — API contract, client, and opt-in API-mode screens.
- `backend/app/` — scoped API, SQLite persistence, session security, evidence handling, review history, and rules-only prioritization.
- `backend/scripts/` — staff-account setup, explicit purge, and manual backup/restore commands.
- `src/i18n/strings.ts` — interface translations included with the app.
- `docs/` — architecture notes, release checklist, and screenshots.

## Known limits

The public Pages site remains a static fixture demo; no public API host is configured. The local API demo is not production-ready and should not be exposed publicly. Its SQLite database is intended for a single local instance. Manual backup and restore commands are available, but there are no scheduled/offsite backups or multi-user deployment operations. Data persists until explicitly purged. It has no trained classifier, model card, validated outcome labels, offline field sync, benefits engine, real allocation logic, or independent photo authentication. Treat all submitted information and any rules score as unverified; a person must assess a case. The fixture screens still contain sample household and dashboard content, and load Google Translate when used. The API mode suppresses Google Translate and currently keeps the workspace text in English while storing the selected language with the report. The app also uses OpenStreetMap tiles, which need a network connection. The repository has no `LICENSE` file yet; add an explicit license before claiming reuse rights. There is no automated unit or browser test suite yet.

For more detail, see [how the app is put together](docs/ARCHITECTURE.md) and [before you publish](docs/RELEASE_CHECKLIST.md).

