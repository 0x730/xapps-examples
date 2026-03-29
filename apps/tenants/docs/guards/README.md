# Tenant Guards And Policy Ownership

Use this page when the tenant team needs to understand which policy decisions
stay tenant-owned even when the default backend comes from the backend kit.

This is a shared/common concern across both tenant adoption modes:

- [host-mode](../host-mode/README.md)
- [full-mode](../full-mode/README.md)
- [common](../common/README.md)

## Start Here

1. Guard manifests:
   [../../xapps/guards](../../xconect/xapps/guards)
2. Guard execution route:
   [guard.js](../../../../packages/backend-kit/src/backend/routes/gateway/guard.ts)
3. Publish and secret handling:
   [../publishing/README.md](../publishing/README.md)

## Current Tenant-Owned Guards

### Payment Policy

- owner-managed baseline:
  - [xconect-tenant-payment-policy](../../xconect/xapps/guards/xconect-tenant-payment-policy/manifest.json)
- gateway-managed Stripe:
  - [xconect-tenant-payment-policy-stripe-gateway](../../xconect/xapps/guards/xconect-tenant-payment-policy-stripe-gateway/manifest.json)
- tenant-delegated Stripe:
  - [xconect-tenant-payment-policy-stripe-delegated](../../xconect/xapps/guards/xconect-tenant-payment-policy-stripe-delegated/manifest.json)

### Subject Profile

- [xconect-tenant-subject-profile-policy](../../xconect/xapps/guards/xconect-tenant-subject-profile-policy/manifest.json)

## What The Tenant Owns Here

Guards are where `xconect` keeps ownership of:

- payment lane decisions
- delegated versus owner-managed choices
- payment orchestration requirements
- billing and customer profile requirements

They do not mean the tenant must own the whole runtime.

## Backend Execution Seams

Current payment guard execution route:

- `POST /xapps/requests`
- [guard.js](../../../../packages/backend-kit/src/backend/routes/gateway/guard.ts)

Current subject-profile candidate route:

- `POST /guard/subject-profiles/tenant-candidates`
- [subjectProfiles.js](../../../../packages/backend-kit/src/backend/routes/gateway/subjectProfiles.ts)

## Practical Rule

For the current lane:

- guards are where the tenant owns policy
- gateway, session, and runtime infrastructure should stay shared
- delegated and owner-managed flows should use explicit refs and secrets
- add new guard variants only when they represent a real tenant ownership option
