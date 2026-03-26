# Package Documentation

This folder is the package-level documentation hub for everything in `packages/`.

Each package keeps a local `README.md` in its own folder for quick usage, while this folder provides centralized documentation for architecture, responsibilities, and integration context.

Workspace-level package context and diagrams:

- `packages/README.md`

## Recommended Entry Paths

Choose the highest-level package that fits the job:

- Backend integrator, Node:
  - start with `@xapps-platform/backend-kit`
- Backend integrator, PHP:
  - start with `xapps-platform/xapps-backend-kit`
- Browser host / hosted-integrator frontend:
  - start with `@xapps-platform/browser-host`
- Low-level custom browser host work:
  - drop to `@xapps-platform/embed-sdk`
- Low-level backend/payment/protocol primitives:
  - drop to `@xapps-platform/server-sdk` or `xapps-platform/xapps-php`

Hosted-integrator reference:

- `docs/packages/hosted-integrator-flow.md`

## Package Index

Published public packages:

- `docs/packages/server-sdk.md`
- `docs/packages/widget-sdk.md`
- `docs/packages/xapps-embed-sdk.md`
- `docs/packages/browser-host.md`
- `docs/packages/backend-kit.md`
- `docs/packages/xapps-php.md`
- `docs/packages/openapi-import.md`
- `docs/packages/signing-client.md`
- `docs/packages/payment-hosted-client.md`
- `docs/packages/marketplace-ui.md`
- `docs/packages/widget-runtime.md`
- `docs/packages/publisher-verifier.md`

Private/internal packages:

- `docs/packages/payment-providers.md`
- `docs/packages/xapps-cli.md`

Related integration/package-shape docs:

- `docs/packages/hosted-integrator-flow.md`

## Related guides

- Ownership overview: `docs/guides/12-package-usage-and-ownership.md`
- SDK/CLI execution checklist: `dev/engineering/checklists/SDK_CLI_AI_CHECKLIST.md`

## Cross-SDK composition (marketplace + embed)

- `@xapps-platform/marketplace-ui`: React marketplace screens and routing (catalog/xapp/requests/widget view).
- `@xapps-platform/embed-sdk`: host iframe orchestration/bridge plumbing used by host pages that actually embed catalog/widgets.
- `@xapps-platform/widget-sdk`: runs inside publisher widget iframe for request/session/guard APIs.
- `@xapps-platform/server-sdk`: publisher/integrator backend SDK for callbacks, signatures, and payment-return verification/signing.
- `@xapps-platform/backend-kit` / `xapps-platform/xapps-backend-kit`: higher-level backend composition layer for the shipped backend contract; use this before dropping to the primitive server SDKs. These are real modular packages now, and their public surfaces stay stable while internal options/runtime/modules/modes/routes remain explicitly split.
- `xapps-platform/xapps-php`: PHP backend SDK counterpart for callbacks, signatures, payment-return verification/signing, and gateway API-key client usage.
- `@xapps/payment-providers`: shared Node adapter rail package for provider settlement execution (mock, Stripe, PayPal).
- `@xapps-platform/payment-hosted-client`: browser hosted-payment API client for session/complete/client-settle endpoint flows.
- `@xapps-platform/browser-host`: actor-agnostic browser host/runtime/bootstrap layer for marketplace and single-xapp surfaces, including the standard hosted-integrator browser path.
- `@xapps-platform/publisher-verifier`: optional deeper verifier layer used directly or through `@xapps-platform/server-sdk`.
- `@xapps-platform/signing-client`: optional browser-side signing helper when product flows require subject-signing UX.
- `@xapps-platform/openapi-import`: reusable OpenAPI-to-manifest transformer.

Public package release state and versions live in:

- `repo/public-package-readiness.md`
