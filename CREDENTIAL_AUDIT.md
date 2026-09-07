# CREDENTIAL_AUDIT.md

This file documents occurrences of demo/fallback credentials, hardcoded admin pins, and UI hints in the repository and the remediation applied in branch `feature/ui/phase-0-audit`.

## Summary

- Findings: Several locations contained demo authentication fallbacks and visible demo PINs (e.g. "2580", "admin123", "255", "1234"). These were intended for local demo and testing but must be gated to avoid accidental exposure in production bundles.
- Remediation: Added `src/lib/devFlags.ts` to centrally gate demo behavior and updated store/UI to consult DEMO_UNLOCK_ENABLED before accepting or displaying demo credentials. No production secrets were added.

## Changed files

- src/lib/devFlags.ts — new file; exports DEMO_UNLOCK_ENABLED, DEMO_PIN, USE_MOCK_SUPABASE
- src/store/distributorStore.ts — gated verifyPin/loginSuperAdmin logic to consult DEMO_UNLOCK_ENABLED before accepting dev passcodes; initial adminPin set from DEMO_PIN only when DEMO_UNLOCK_ENABLED
- src/distributor/pages/DistributorLoginPage.tsx — gated 1-Tap demo UI and visible PIN hint behind DEMO_UNLOCK_ENABLED to prevent leakage in production builds

## All discovered hardcoded credentials (pre-remediation)

- "2580" — Default owner PIN visible in DistributorLoginPage and used by quick unlock. Classified: UI demo fixture.
- "admin123" — Super admin password in modal (UI demo). Classified: UI demo fixture.
- "255" — Short developer PIN fallback. Classified: dev fixture.
- "1234" — Alternate developer PIN fallback. Classified: dev fixture.
- Other emails: admin@edretail.tz, admin@edretail.com — used as known demo admin addresses. Classified: UI/demo fixture.

## Notes & Next steps

- Build verification: ensure production builds set VITE_ENABLE_DEMO_UNLOCK to 'false' (or unset) so DEMO_UNLOCK_ENABLED === false and no demo PINs appear.
- Consider removing all demo credentials entirely before publishing a public release.

