# Before you publish

- [ ] Check the changes and make sure the commit does not include credentials or real case information.
- [ ] Run `npm ci`, `npm run typecheck`, and `npm run build`; confirm the Python dependency and compilation steps pass in GitHub Actions.
- [ ] Open each role screen and try the language and disaster selectors.
- [ ] Check the layout at phone and desktop widths. Try the main controls with a keyboard.
- [ ] Check map attribution and follow the external links.
- [ ] Confirm sample figures and public service links are labeled clearly. Verify official resources before presenting them as current.
- [ ] Update the screenshots in `docs/screenshots/` if the screens have changed.
- [ ] After publishing, open the Pages address and check the deployment run in **Actions**.
- [ ] Confirm the Pages build uses `VITE_DATA_MODE=fixture`; do not add API credentials or connect it to a live case database.
- [ ] For the optional API demo, use only fictional records and keep Docker bound to `127.0.0.1`. Confirm `RECLAIM_COOKIE_SECURE=true` before any HTTPS-only host is considered.
- [ ] Check that no trained-model claim appears unless a model artifact, dataset provenance, evaluation, model card, rollback path, and human review policy have been added and reviewed.
- [ ] Confirm the displayed priority policy version and reasons match the code; treat scores as review triage only, never eligibility or benefit allocation.
- [ ] Keep report and photo retention explicit. Run the purge command only when intentionally removing old local demo data.
- [ ] Create a manual backup and verify restore into a new data directory before any demo that depends on persistence. Keep archives encrypted and access-controlled; checksums do not authenticate the source.

## Current gaps

The public site is a front-end fixture demo. The optional local API persists reports but is not production-ready or publicly hosted. There are no automated unit or browser tests yet. No trained model is configured. Do not enter real personal or case information. OpenStreetMap tiles require third-party network access.

