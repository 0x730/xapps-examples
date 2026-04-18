# PHP Tenant Quickstart

Use this when the tenant backend is PHP.

Dependency rule:

- inside this canonical monorepo, the Laravel reference apps may keep Composer `path` repositories for coordinated development
- when exported as public starter/reference code or documented for external consumers, prefer Packagist packages instead of monorepo-local `path` repositories
- for those external/public flows, prefer the latest published stable package versions unless a specific compatibility issue is documented

Current concrete references:

- thin PHP reference backend:
  - [../../xconectb/backend/README.md](../../xconectb/backend/README.md)
- Laravel full-tenant starter/reference app:
  - [../../../apps/tenants/xconectc/README.md](../../xconectc/README.md)
- Laravel hosted-integrator starter/reference app:
  - [../../../apps/tenants/xconectc-host/README.md](../../xconectc-host/README.md)
- shape overview:
  - [laravel-integration-map.md](./laravel-integration-map.md)

## Goal

Ship the lean marketplace path first, using:

- `xapps-platform/xapps-backend-kit`
- `@xapps-platform/browser-host`
- `xapps` CLI

Use `xapps-platform/xapps-php` only when the tenant needs lower-level PHP primitives.

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

## 2. Start From The PHP Backend Kit

Use:

- <https://github.com/0x730/xapps-sdk-php/tree/main/packages/xapps-backend-kit-php#readme>
- [../backend/README.md](../backend/README.md)

Recommended path:

- use the backend kit to bootstrap the default tenant backend
- feed it tenant config, branding, subject-profile hooks, and mode enablement
- keep only startup/config mapping and app-specific pages local

Concrete file roles in the Laravel full-tenant reference:

- [apps/tenants/xconectc/routes/web.php](../../xconectc/routes/web.php)
  - Laravel route ownership and route splitting between app pages and backend-kit
    endpoints
- [apps/tenants/xconectc/app/Support/Xapps/BackendKitBootstrap.php](../../xconectc/app/Support/Xapps/BackendKitBootstrap.php)
  - tenant-specific backend-kit configuration and host/payment/bridge settings
- [apps/tenants/xconectc/app/Http/Controllers/XappsBackendKitController.php](../../xconectc/app/Http/Controllers/XappsBackendKitController.php)
  - request handoff from Laravel into the PHP backend-kit route surface
- [apps/tenants/xconectc/app/Http/Controllers/HostProofController.php](../../xconectc/app/Http/Controllers/HostProofController.php)
  - local launcher bootstrap and shared host asset delivery

Laravel note:

- if the tenant app already owns auth, dashboard, or business APIs, keep those
  in Laravel and mount the backend-kit host routes alongside them
- if the tenant wants a local launcher on the same origin, resolve identity on
  that launcher first and then hand off to the shared host pages
- if the integrator shell is separate, use the hosted-integrator pattern
  instead, as shown by `xconectc-host`

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

The browser path stays the same even if the backend is PHP.

Use:

- <https://github.com/0x730/xapps-sdk-js/tree/main/packages/browser-host#readme>
- <https://github.com/0x730/xapps-sdk-js/tree/main/packages/xapps-embed-sdk#readme>

Recommended browser contract:

- `@xapps-platform/browser-host`
- `bootstrapXappsEmbedSession(...)`
- `mountCatalogEmbed(...)`
- `mountSingleXappEmbed(...)`

Drop to `@xapps-platform/embed-sdk` only when the host needs a lower-level
custom browser shape.

Hosted-integrator note:

- same-origin is still the default
- if the frontend runs on another domain, set `backendBaseUrl` in the browser host
- allow that frontend domain through `host.allowedOrigins`
- add the frontend return URL/origin to the payment return allowlist when using owner-managed payment pages

Same-origin launcher note:

- the browser host can still be shared even when the tenant uses a local
  launcher page on the same Laravel origin
- in that case, point `entryHref` back to the launcher and keep the browser
  identity state short-lived

Concrete file roles in the Laravel launcher-backed reference:

- [apps/tenants/xconectc/app/Http/Controllers/HostProofController.php](../../xconectc/app/Http/Controllers/HostProofController.php)
  - emits `ENTRY_HREF="/catalog"`, serves local thin host pages from `resources/host-pages`,
    and serves local SDK consumer assets from `resources/host`
- [apps/tenants/xconectc/resources/host-pages/index.html](../../xconectc/resources/host-pages/index.html)
  - launcher page that resolves identity and chooses the host surface
- [apps/tenants/xconectc/resources/host/launcher.js](../../xconectc/resources/host/launcher.js)
  - thin launcher bootstrap using the browser SDK
- [apps/tenants/xconectc/resources/host/marketplace.js](../../xconectc/resources/host/marketplace.js)
  - thin marketplace mount using `mountCatalogEmbed(...)`
- [apps/tenants/xconectc/resources/host/single-xapp.js](../../xconectc/resources/host/single-xapp.js)
  - thin single-xapp mount using `mountSingleXappEmbed(...)`

These local starter files are not the public browser SDK. The public browser
integration contract is still:

- `bootstrapXappsEmbedSession(...)`
- `mountCatalogEmbed(...)`
- `mountSingleXappEmbed(...)`

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

Do not port the Node reference structure into PHP.

Instead:

- reproduce the same tenant contract
- start from the PHP backend kit
- keep the same shared browser host runtime
- customize branding, shell, subject profiles, and tenant-owned policy only
- drop to `xapps-platform/xapps-php` only when the tenant needs deeper PHP-level primitives
