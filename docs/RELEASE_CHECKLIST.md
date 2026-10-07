# Release checklist

## Before release

- [ ] Review the repository diff and confirm no private keys, credentials, or survivor data are included.
- [ ] Run `npm ci`, `npm run typecheck`, and `npm run build` locally or confirm the GitHub Actions checks pass.
- [ ] Exercise the language, disaster, and role selectors and the citizen recovery flow in a browser.
- [ ] Check the responsive layout, keyboard access, map attribution, and external links.
- [ ] Confirm all sample figures and emergency or benefit resources are clearly identified and current before any real-world use.
- [ ] Replace or supplement the screenshots in `docs/screenshots/` if the interface changes.
- [ ] Confirm the deployment URL and GitHub Pages workflow status after publishing.

## Current limitations to resolve before real deployment

- This repository is a front-end demonstration and has no server-side persistence, authentication, authorization, or submission API.
- The dashboard values and AI analysis are demonstration data, not operational predictions or eligibility decisions.
- Google Translate, Google Fonts, and OpenStreetMap introduce third-party network dependencies.
- No automated unit, integration, or browser tests are currently included.
- Review every public-facing helpline, scheme, and document replacement instruction with its official source before operational use.
