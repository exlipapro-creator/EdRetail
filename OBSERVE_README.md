# Render + Sentry deployment guide

This repository now includes an optional observability integration and a Render-friendly configuration to deploy the frontend as a static site.

What was added

- src/design/sentry.ts — initializes Sentry in the browser when VITE_SENTRY_DSN is present.
- src/main.tsx — conditional import to initialize Sentry only when the DSN is set (guarded by Vite env var).
- render.yaml — optional Render infra-as-code (not added to repo by default). See instructions below.

How to deploy on Render (quick)

1. Create a new Static Site on Render and connect the repository `exlipapro-creator/EdRetail`.
2. Build Command: `npm ci && npm run build`
3. Publish Directory: `dist`
4. Add environment variables in Render:
   - VITE_SENTRY_DSN: (optional) your Sentry browser DSN
   - VITE_SENTRY_RELEASE: (optional) set to $COMMIT_SHA
   - NODE_ENV: production

Sentry setup (optional but recommended)

1. Create a Sentry project at https://sentry.io and get your browser DSN.
2. Add `VITE_SENTRY_DSN` to Render's environment variables for the site.
3. Optional: To upload source maps for readable stack traces, create a Sentry auth token and add `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` as Render secrets, and configure a build step to call `sentry-cli` to upload source maps (see Sentry docs).

Security

- Do NOT commit DSNs or auth tokens to the repo. Use Render secrets.

