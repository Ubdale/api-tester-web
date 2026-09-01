# Probe Web (Angular + Angular Material + Tailwind)

## Setup
1. `npm install`
2. Confirm `src/environments/environment.ts` points at your running API (`apiUrl`, defaults to `http://localhost:4000/api`).
3. `npm start` — runs on `http://localhost:4200`.

Make sure `probe-api` is running first and its `.env` has `CORS_ORIGIN=http://localhost:4200` (already the default).

## UI stack notes
- **Angular Material** provides the sidenav, tabs, form fields, buttons, and icons. The theme is a custom dark palette built on our amber accent (`src/styles.scss`), not Material's default purple.
- **Tailwind** handles layout/spacing utility classes on top of Material's components. Tailwind's `preflight` (its own CSS reset) is turned off in `tailwind.config.js` specifically so it doesn't fight Material's base styles — don't re-enable it without checking Material still renders correctly.
- **Material Icons** loads via the Google Fonts link in `index.html` (`<mat-icon>` uses it by default, no extra config needed).
- If your installed `@angular/material` version uses the newer M3 theming syntax instead of the M2 API used in `styles.scss` (`mat.define-dark-theme` / `mat.all-component-themes`), that file is the only place you'd need to adjust — everything else is unaffected.

## Structure
- `src/app/core` — auth service (JWT in localStorage), HTTP interceptor, route guard, API client
- `src/app/pages/login` — sign in / sign up
- `src/app/pages/workspace` — request builder (Params/Headers/Body/Auth tabs), response viewer, history sidebar, copy-as-cURL, copy response
- `src/app/components/json-tree` — recursive collapsible JSON viewer, reused wherever a response body renders
