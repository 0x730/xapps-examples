# Tenant Integrations

Use this page when the tenant team needs one practical view of what is
integrated in the current lane and what the tenant actually has to own.

## Start Here

Read these first:

1. [../backend/README.md](../backend/README.md)
2. [../modules/README.md](../modules/README.md)
3. [../guards/README.md](../guards/README.md)

## Recommended Path

For the first release, start with the lean marketplace path:

- backend kit provides the default tenant backend
- browser host uses the shared runtime
- Stripe uses `gateway_managed`
- installation lifecycle stays included
- invoicing stays platform-managed
- notifications stay platform-managed
- subject-profile candidates are optional

Use expanded ownership only when the tenant already knows it needs:

- delegated payment credentials
- tenant-owned payment page
- ERP/CRM-backed subject profiles
- additional custom backend seams

## Integration Families

### Browser Host

Required backend routes:

- `GET /api/host-config`
- `POST /api/resolve-subject`
- `POST /api/create-catalog-session`
- `POST /api/create-widget-session`

Hosted-integrator bootstrap route when the frontend lives on another origin:

- `POST /api/host-bootstrap`

Code anchor:

- [hostApiCore.js](../../../../packages/backend-kit/src/backend/routes/gateway/hostApiCore.ts)

Reference implementations:

- same-origin host:
  - [xconect host](../../xconect/host/README.md)
  - [xconectb host](../../xconectb/host/README.md)
- same-origin launcher-backed tenant app:
  - [xconectc](../../xconectc/README.md)
- hosted-integrator proof/reference:
  - [host-proof-common](../../host-proof-common/README.md)
  - [xconect-host](../../xconect-host/README.md)
  - [xconectb-host](../../xconectb-host/README.md)
  - [xconectc-host](../../xconectc-host/README.md)

### Installation Lifecycle

Required for `xconect` as a real marketplace:

- `GET /api/installations`
- `POST /api/install`
- `POST /api/update`
- `POST /api/uninstall`

Code anchor:

- [hostApiLifecycle.js](../../../../packages/backend-kit/src/backend/routes/gateway/hostApiLifecycle.ts)

### Guard Execution

Current tenant request seam:

- `POST /xapps/requests`

Code anchor:

- [guard.js](../../../../packages/backend-kit/src/backend/routes/gateway/guard.ts)

This is currently a narrow tenant guard and policy execution seam, not a general
tenant request platform.

### Payments

Current tenant payment choices:

- `gateway_managed`
- `tenant_delegated`
- `publisher_delegated`
- `owner_managed`

Current recommendation:

- Stripe
- `gateway_managed`

Code anchors:

- [payment.js](../../../../packages/backend-kit/src/backend/routes/gateway/payment.ts)
- [modes/index.js](../../xconect/backend/modes/index.js)

### Subject Profiles

Current tenant profile seam:

- `POST /guard/subject-profiles/tenant-candidates`

Code anchor:

- [subjectProfiles.js](../../../../packages/backend-kit/src/backend/routes/gateway/subjectProfiles.ts)

## Practical Rule

Keep the tenant-owned surface narrow:

- policy choices stay tenant-owned
- branding and host pages stay tenant-owned
- subject-profile data can be tenant-owned
- gateway/session/runtime infrastructure should stay shared unless the tenant
  truly needs more ownership
