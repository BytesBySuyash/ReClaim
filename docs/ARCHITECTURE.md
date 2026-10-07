# Architecture

RECLAIM is a client-side React application built with Vite, TypeScript, and Tailwind CSS v4.

## Runtime flow

1. `index.html` loads `src/main.tsx`, which mounts `src/App.tsx`.
2. `App` holds the selected role, disaster, and language; role/disaster state is reflected in the URL.
3. `src/views/` contains the citizen, field worker, NGO, and government experiences.
4. `src/data/disasters.ts` supplies the bundled demonstration data used by dashboards and maps.
5. `src/components/` contains shared recovery tools, maps, feature controls, and error handling.
6. `src/i18n/strings.ts` contains the interface strings available in the app. Google Translate is loaded by the browser for other selected languages.

## Data and privacy boundary

There is no API server or database in this repository. Reports, dashboards, maps, and AI analysis are a front-end demonstration using bundled sample data and browser interactions. Do not enter real survivor information or treat the displayed estimates, eligibility information, or guidance as verified decisions. Before production use, connect an authenticated backend, define retention and consent policies, validate official resources, and review security and accessibility requirements.

Theme preference, language selection, and the recovery draft flag use browser local storage. The app also loads Google Fonts, Google Translate, OpenStreetMap tiles, and map attribution resources from third parties when used.

## Build and hosting

Run `npm ci`, `npm run typecheck`, and `npm run build`. The GitHub Pages workflow publishes `dist` from `main` at `https://bytesbysuyash.github.io/ReClaim/` after Pages is configured to use GitHub Actions as its source.
