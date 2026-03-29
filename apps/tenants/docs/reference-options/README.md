# Tenant Reference Options

Use this page when deciding how much ownership the tenant wants beyond the
recommended first-release path.

Mode-oriented reading order:

- first choose [host-mode](../host-mode/README.md)
  or [full-mode](../full-mode/README.md)
- then return here only if you are deciding how much more ownership to take on

Do not start here if you are still learning the base contract. Start with:

- [../README.md](../README.md)
- [../backend/README.md](../backend/README.md)
- [../modules/README.md](../modules/README.md)

## Recommended Starting Point

Use this unless there is a strong reason not to:

- browser host:
  - shared runtime
- backend:
  - backend kit defaults
- payments:
  - Stripe
  - `gateway_managed`
- invoicing:
  - platform-managed
- notifications:
  - platform-managed
- subject profiles:
  - optional candidate sourcing only

## What Changes Later

If the tenant wants more ownership later, the main expansion areas are:

- `tenant_delegated` payments
- `owner_managed` payment page and return handling
- subject-profile integrations backed by real tenant systems
- custom route or mode overrides
- later invoice or notification ownership

What stays true:

- the tenant contract stays the same
- guard contracts still decide payment and policy behavior
- backend-kit defaults remain the starting point

## Current Code Anchors

- [server.js](../../xconect/backend/server.js)
- [reference.js](../../../../packages/backend-kit/src/backend/routes/reference.ts)
- [modes/index.js](../../xconect/backend/modes/index.js)
- [payment.js](../../../../packages/backend-kit/src/backend/routes/gateway/payment.ts)
- [guard.js](../../../../packages/backend-kit/src/backend/routes/gateway/guard.ts)
- [subjectProfiles.js](../../../../packages/backend-kit/src/backend/routes/gateway/subjectProfiles.ts)

## Practical Rule

Treat this page as an ownership map, not the first implementation guide.

The normal path is:

- start from the backend kit
- keep the tenant seam lean
- add ownership only when the tenant has a real business need for it
