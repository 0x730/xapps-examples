# Hosted Integrator Starter Contract

This page is about the starter surface, not the full integrator handoff.

Start here only after reading:

- [first-hosted-tenant-integrator-handoff.md](./first-hosted-tenant-integrator-handoff.md)

That page is the canonical process. This page explains which starter files map
to that process.

## Starter Goal

The starter must make the hosted-integrator flow feel like one small product:

1. local app calls `POST /api/host-bootstrap`
2. backend forwards to our hosted tenant
3. tenant returns `subjectId` and `bootstrapToken`
4. browser stores that state
5. browser mounts marketplace or single-xapp

For the first real hosted tenant lane:

- subject profiles are mandatory
- the current system uses both `/api/catalog-customer-profile` and
  `POST /guard/subject-profiles/tenant-candidates`

## Canonical Starter Files

- browser starter:
  - [packages/browser-host/examples/hosted-integrator-starter/README.md](../../../../packages/browser-host/examples/hosted-integrator-starter/README.md)
- Node backend proxy:
  - [packages/server-sdk/examples/host-proxy/hosted-integrator-bootstrap.mjs](../../../../packages/server-sdk/examples/host-proxy/hosted-integrator-bootstrap.mjs)
- PHP backend proxy:
  - [packages/xapps-php/examples/host-proxy/hosted-integrator-bootstrap.php](../../../../packages/xapps-php/examples/host-proxy/hosted-integrator-bootstrap.php)

## What The Starter Must Include

- one local `POST /api/host-bootstrap` example
- one launcher page example
- one marketplace page example
- one single-xapp page example
- bootstrap state storage
- silent re-bootstrap support
- exact identity payload examples
- exact env/config meanings

## What The Starter Must Not Include

- proof dashboards
- proof preset identities
- `reference-host-common` as an integrator requirement
- tenant-specific branding
- internal repo layering explanations

## Browser Surface

The browser starter should use the unified `browser-host` surface:

- `bootstrapXappsEmbedSession(...)`
- `mountCatalogEmbed(...)`
- `mountSingleXappEmbed(...)`

That is the public browser entrypoint for complete embedding in both:

- hosted mode, where we keep the tenant
- self-owned mode, where the tenant owns the backend but keeps the same `/api/*`
  host contract

## Identity Rule

Keep the first read strict and simple:

1. first bootstrap sends external identity, usually `identifier`
2. our hosted tenant resolves `subjectId`
3. later requests may reuse stored `subjectId`

Do not lead with “integrator already knows `subjectId`”. That is an optimization,
not the first contact.

## Subject Profile Rule

For the first hosted tenant lane, subject profiles are mandatory.

The starter should say this plainly:

- browser host calls `/api/catalog-customer-profile`
- our hosted tenant calls `POST /guard/subject-profiles/tenant-candidates`
- the integrator remains the source of truth for profile data
- profile matching uses the same chosen identity basis as bootstrap

## Recommended Reading Order

1. [first-hosted-tenant-integrator-handoff.md](./first-hosted-tenant-integrator-handoff.md)
2. [packages/browser-host/examples/hosted-integrator-starter/README.md](../../../../packages/browser-host/examples/hosted-integrator-starter/README.md)
3. [packages/server-sdk/examples/host-proxy/hosted-integrator-bootstrap.mjs](../../../../packages/server-sdk/examples/host-proxy/hosted-integrator-bootstrap.mjs)
4. [packages/xapps-php/examples/host-proxy/hosted-integrator-bootstrap.php](../../../../packages/xapps-php/examples/host-proxy/hosted-integrator-bootstrap.php)
5. stack wrapper:
   - [nodejs-hosted-integrator-platform-tenant.md](./nodejs-hosted-integrator-platform-tenant.md)
   - [laravel-hosted-integrator-platform-tenant.md](./laravel-hosted-integrator-platform-tenant.md)
