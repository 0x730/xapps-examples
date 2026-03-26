# Shared payment helpers

This folder is for payment logic reused by multiple modes.

Keep mode-specific behavior out of this folder.
If a file exists here, at least two modes should need it.

Files:

- [shared.js](/home/dacrise/x/xapps/apps/tenants/xconect/backend/lib/payments/shared.js)
  - tiny readers/parsers used by payment helpers

Default hosted-session, payment-page API, payment-page asset route, and signed-evidence runtime now come from:

- [index.js](/home/dacrise/x/xapps/packages/backend-kit/src/index.ts)

Not here anymore:

- mode-specific page routes
- mode-specific blocked-result behavior
- mode-specific payment entrypoints
- tenant-owned/custom provider examples

Those belong in `../../modes/<mode>/`.
