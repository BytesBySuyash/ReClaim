# How the app is put together

RECLAIM is a React app built with TypeScript, Vite, and Tailwind CSS. An optional FastAPI service provides a local, persisted demo flow.

## App flow

- `index.html` loads `src/main.tsx`, which mounts `src/App.tsx`.
- `App` tracks the selected role, disaster, and language. The role and disaster are reflected in the URL.
- `src/views/` holds the citizen, field worker, organization, and government screens. Each screen is loaded when selected.
- `src/data/disasters.ts` supplies the sample records shown by the default fixture-mode dashboards and maps.
- `src/components/` holds shared tools, maps, and UI features.
- `src/i18n/strings.ts` contains the translations included with the app.
- `src/api/contracts.ts` defines the frontend-facing API types, and `src/services/api.ts` implements the same-origin API client. `VITE_DATA_MODE=api` mounts `src/views/ApiWorkspace.tsx`; otherwise the existing fixture screens remain the compatibility path.
- `backend/app/main.py` serves `/api/v1`, and `backend/app/reports.py` handles event scope, report ownership, assignment, review, and version checks. SQLite migrations and private image storage live under `backend/app/` and the configured data directory.

## What the demo stores and loads

The GitHub Pages site is explicitly built in fixture mode. Its bundled reports, dashboard figures, and analysis results are sample content and never reach a server.

The opt-in local API mode uses signed, HttpOnly session cookies, a CSRF token, origin checks, scoped staff accounts, SQLite persistence, and private image files. Citizen drafts are stored in browser local storage for up to 24 hours and are removed when that user signs out. Evidence accepts JPEG/PNG, enforces byte and pixel limits, decodes and re-encodes the image, and serves it only to a user with report access. The demo does not accept identity documents.

Prioritization is deliberately rules-only. `backend/app/priority.py` scores the five need categories from explicit user/reviewer answers; an unknown category makes the report unscored. Immediate danger triggers a human-review flag without adding points. The API identifies its policy version and factors. Remote review can request a visit or flag a dispute but does not update the score. Only a recorded field visit can mark the current facts confirmed. The score is not a benefits decision, eligibility check, or automated allocation. No trained model is enabled because the repository contains no validated training labels or model artifact.

The API is designed for one local demo instance. It is not a public deployment recipe: SQLite has no multi-instance coordination, and the API has no production monitoring, scheduled/offsite backup, formal retention service, or independent reviewer identity proofing. Manual backup and restore commands are available under `backend/scripts/`; pause writes during those operations, protect backup archives as sensitive data, and restore only a trusted archive to a new data directory. Set `RECLAIM_DATA_DIR` to a private durable directory and run the purge command explicitly to remove old demo records. Fixture mode loads Google Translate; the API mode disables that third-party script. The UI also uses OpenStreetMap tiles, which need a network connection.

## Build and publish

Run `npm ci`, `npm run typecheck`, and `npm run build` for the frontend; CI also checks Python dependency installation and source compilation. The Pages workflow forces `VITE_DATA_MODE=fixture` and publishes `dist` from `main`. Set the repository's Pages source to **GitHub Actions**. The expected address is https://bytesbysuyash.github.io/ReClaim/.

For a local API session, see the Docker Compose and split Vite/API instructions in the README. API reports are persisted only on that local server. Never expose the demo API to the public internet or enter real case data.

