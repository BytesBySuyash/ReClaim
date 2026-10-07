# Before you publish

- [ ] Check the changes and make sure the commit does not include credentials or real case information.
- [ ] Run `npm ci`, `npm run typecheck`, and `npm run build`, or confirm those checks passed in GitHub Actions.
- [ ] Open each role screen and try the language and disaster selectors.
- [ ] Check the layout at phone and desktop widths. Try the main controls with a keyboard.
- [ ] Check map attribution and follow the external links.
- [ ] Confirm sample figures and public service links are labeled clearly. Verify official resources before presenting them as current.
- [ ] Update the screenshots in `docs/screenshots/` if the screens have changed.
- [ ] After publishing, open the Pages address and check the deployment run in **Actions**.

## Current gaps

This is still a front-end demo. It has no account system, server-side storage, or report submission service. The dashboards and analysis use sample data. There are no automated unit or browser tests yet. Google Translate, Google Fonts, and OpenStreetMap require third-party network access.
