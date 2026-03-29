# Tenant Requests And Data Seams

Use this page when the tenant team needs to understand where tenant-owned data
enters the backend and what stays platform-managed.

This is a shared/common concern after choosing the adoption mode:

- [host-mode](../host-mode/README.md)
- [full-mode](../full-mode/README.md)
- [common](../common/README.md)

## Start Here

- [guard.js](../../../../packages/backend-kit/src/backend/routes/gateway/guard.ts)
- [subjectProfiles.js](../../../../packages/backend-kit/src/backend/routes/gateway/subjectProfiles.ts)
- [payment.js](../../../../packages/backend-kit/src/backend/routes/gateway/payment.ts)

## Request Execution Seam

Current tenant request execution route:

- `POST /xapps/requests`

What it does now:

- API-key protected tenant guard and policy execution
- primarily `evaluate_tenant_payment_policy`

Practical rule:

- this is not a general tenant request platform
- it is the current tenant policy execution seam

## Subject Profile Data Seam

Current tenant-provided profile candidate route:

- `POST /guard/subject-profiles/tenant-candidates`

What the tenant controls here:

- which candidate profiles exist
- which candidate is default
- what business or individual profile data is suggested

Current backing options:

- env-driven JSON
- real tenant systems later

## What Is Still Platform-Managed

Current remediation flow still keeps profile persistence platform-managed.

That means:

- tenant can source candidate profile data now
- platform still owns the default save path in the current remediation flow

## Payment Data Seam

Current payment routes are registered by:

- [payment.js](../../../../packages/backend-kit/src/backend/routes/gateway/payment.ts)

Mode-specific registration comes from:

- [modes/index.js](../../xconect/backend/modes/index.js)

Important rule:

- `gateway_managed` and `tenant_delegated` keep checkout execution on the gateway path
- `owner_managed` adds tenant payment-page routes and return handling

## Practical Rule

For the current lane:

- request execution is tenant-owned only where policy execution is needed
- profile sourcing can be tenant-owned now
- profile persistence in remediation is currently platform-managed
- installs, invoicing, and notifications should not be over-built in the tenant
  backend before the lane needs them
