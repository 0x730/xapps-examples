# Node.js Tenant Quickstart

Use this when the tenant backend is Node.js.

Dependency rule:

- inside this canonical monorepo, the reference apps can still use local workspace/built-package wiring for development
- when exported as public starter/reference code or documented for external consumers, prefer the published npm packages instead of monorepo-local paths
- for those external/public flows, prefer the latest published stable package versions unless a specific compatibility issue is documented

## Goal

Ship the lean marketplace path first, using:

- `@xapps-platform/backend-kit`
- `@xapps-platform/browser-host`
- `xapps` CLI

Use `@xapps-platform/server-sdk` only when the tenant needs a lower-level custom seam.

## 1. Inputs We Provide

For the real tenant onboarding flow, we provide:

- client creation in the platform
- the relevant API key(s)
- the linked publisher/API key used for tenant-owned guard publishing

The tenant provides:

- backend base URL
- host/public base URL
- allowed origins
- any secret or credential refs needed by the chosen payment mode

## 2. Start From The Backend Kit

Use:

- [docs/packages/backend-kit.md](../../../../docs/packages/backend-kit.md)
- [../backend/README.md](../backend/README.md)

Recommended path:

- use the backend kit to mount the default tenant backend
- feed it tenant config, branding, subject-profile hooks, and mode enablement
- keep only startup/config mapping and app-specific pages local

## 3. Keep The Foundational Contract Intact

The tenant contract still needs:

- `GET /api/host-config`
- `POST /api/resolve-subject`
- `POST /api/create-catalog-session`
- `POST /api/create-widget-session`
- `GET /api/installations`
- `POST /api/install`
- `POST /api/update`
- `POST /api/uninstall`

The backend kit gives you the default implementation path for these routes.

## 4. Implement The Tenant Request Seam

Implement:

- `POST /xapps/requests`

Use it first for:

- tenant payment policy guard execution

Important boundary:

- this is a narrow tenant guard and policy execution seam in the current lane
- not yet a full tenant request platform

## 5. Mount The Browser Host

Use:

- [docs/packages/browser-host.md](../../../../docs/packages/browser-host.md)
- [docs/packages/xapps-embed-sdk.md](../../../../docs/packages/xapps-embed-sdk.md)

Recommended browser contract:

- `@xapps-platform/browser-host`
- `createStandardMarketplaceRuntime(...)` underneath it

Hosted-integrator note:

- same-origin is still the default
- if the frontend runs on another domain, set `backendBaseUrl` in the browser host
- allow that frontend domain through `host.allowedOrigins`
- add the frontend return URL/origin to the payment return allowlist when using owner-managed payment pages

Recommended starter:

- [packages/xapps-embed-sdk/examples/marketplace-host-starter/index.html](../../../../packages/xapps-embed-sdk/examples/marketplace-host-starter/index.html)

## 6. Choose The First Payment Mode

Recommended first release:

- Stripe
- `gateway_managed`

Later options:

- `tenant_delegated`
- `publisher_delegated`
- `owner_managed`

Reference:

- [../integrations/README.md](../integrations/README.md)
- [../publishing/README.md](../publishing/README.md)

## 7. Publish The Tenant Guard(s)

Use:

- `xapps` CLI

Current model:

- source manifests stay in the tenant workspace
- publish through the linked publisher path

## 8. Verify The Full Marketplace Path

Verify:

1. host can resolve subject
2. catalog session works
3. widget session works
4. install, update, and uninstall routes work
5. guard dispatch reaches tenant backend
6. selected payment mode behaves correctly

## Practical Rule

Do not port all of `xconect`.

Instead:

- start from the backend kit
- use the shared browser host runtime
- customize branding, shell, subject profiles, and tenant-owned policy only
- drop to `@xapps-platform/server-sdk` only when the tenant needs a deeper custom seam
