# How the app is put together

RECLAIM is a React app built with TypeScript, Vite, and Tailwind CSS.

## App flow

- `index.html` loads `src/main.tsx`, which mounts `src/App.tsx`.
- `App` tracks the selected role, disaster, and language. The role and disaster are reflected in the URL.
- `src/views/` holds the citizen, field worker, organization, and government screens. Each screen is loaded when selected.
- `src/data/disasters.ts` supplies the sample records shown in the dashboards and maps.
- `src/components/` holds shared tools, maps, and UI features.
- `src/i18n/strings.ts` contains the translations included with the app. Google Translate handles the other language choices in the browser.

## What the demo stores and loads

There is no API server or database. Nothing in the reporting flow is submitted to a service. Dashboard figures, case details, and analysis results are sample content; they should not be used to assess real cases or determine eligibility.

The browser stores the selected language, theme, and recovery draft flag. The app also loads Google Fonts, Google Translate, and OpenStreetMap tiles when needed.

## Build and publish

Run `npm ci`, `npm run typecheck`, and `npm run build`. The Pages workflow publishes the `dist` folder from `main`. Set the repository's Pages source to **GitHub Actions**. The expected address is https://bytesbysuyash.github.io/ReClaim/.
