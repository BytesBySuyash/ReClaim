# RECLAIM

**A disaster recovery coordination demo built with React, TypeScript, and Vite.**

RECLAIM brings four perspectives into one interface: a resident reporting losses, a field worker verifying a household, an organization coordinating response, and a government team reviewing activity across disaster events.

[Open the demo](https://bytesbysuyash.github.io/ReClaim/) · [Browse the source](https://github.com/BytesBySuyash/ReClaim)

> **Demo data:** This is a front-end work sample. Reports are not sent to a server, and the case records, dashboard figures, and analysis results are examples. Use fictional information only.

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

Use the top controls to switch roles, change the selected disaster, and choose a language. There is no login. Some selections are reflected in the URL, so a view can be shared or reopened directly.

## What this project demonstrates

- A single app shell connecting four role-specific workflows over the same disaster data.
- Typed React components with reusable UI and a shared data model for households, interventions, and disaster events.
- URL-backed role and disaster selection, plus browser-stored language and theme preferences.
- Map-based views using React Leaflet, with dashboard screens loaded on demand to keep the initial bundle smaller.
- A release workflow that runs TypeScript checks and a production build, then publishes the static site through GitHub Pages.

The analysis screen is a visual demonstration with fixed sample results. It does not call an AI or analysis service.

## Run locally

Requirements: Node.js 22 and npm.

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

## Tech stack

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4
- React Leaflet and Leaflet
- GitHub Actions for checks and GitHub Pages deployment

## Project map

- `src/App.tsx` — app shell, navigation, and role, disaster, and language selection.
- `src/views/` — citizen, field worker, organization, and government screens.
- `src/components/` — shared tools, recovery UI, maps, and feature controls.
- `src/data/disasters.ts` — bundled sample events and household data.
- `src/i18n/strings.ts` — interface translations included with the app.
- `docs/` — architecture notes, release checklist, and screenshots.

## Known limits

This demo has no backend, accounts, or report submission service. Its analysis, household records, and dashboard figures are sample content, not real assessments. The app uses Google Translate and Google Fonts, and map tiles from OpenStreetMap; those features need a network connection. There is no automated unit or browser test suite yet.

For more detail, see [how the app is put together](docs/ARCHITECTURE.md) and [before you publish](docs/RELEASE_CHECKLIST.md).
