# `@xapps-platform/embed-sdk`

Host-side embed bridge SDK source for catalog/widget embedding.

## Purpose

- Mount and orchestrate embedded catalog/widget iframes
- Forward bridge events between host and iframes
- Provide token refresh, signing, vendor assertion, and session-expired hooks
- Forward widget-driven operational surface opens for marketplace/embed flows

## Runtime

- Browser host/integrator application

Public source package note:

- published package name: `@xapps-platform/embed-sdk`
- source package path in this monorepo: `packages/xapps-embed-sdk`

## Relation To `@xapps-platform/browser-host`

`@xapps-platform/embed-sdk` is the low-level browser SDK surface.

It provides:

- iframe orchestration
- bridge helpers
- host UI helpers
- payment return/resume helpers

`@xapps-platform/browser-host` sits above it and packages the standard marketplace and single-xapp host flow for consumers that do not want to rebuild that browser bootstrap path from scratch.

Use:

- `@xapps-platform/embed-sdk` for low-level/custom browser host work
- `@xapps-platform/browser-host` for the standard shared host path

For most integrators now:

- start with `@xapps-platform/browser-host`
- drop to `@xapps-platform/embed-sdk` only when the standard host/runtime flow is not enough

Hosted-integrator note:

- same-origin `/api/*` is still the default
- low-level consumers can override host API and bridge-v2 endpoints directly
- `@xapps-platform/browser-host` now derives remote backend and bridge endpoints from `backendBaseUrl`

## Integrator page contract

Required:

- catalog mount element for `createHost({ container })`
- optional widget mount element for split-panel host UX

Optional/customizable:

- toast/modal/status UI elements
- guard confirmation UX presentation
- host-specific auth controls

The SDK does not require fixed HTML IDs/classes beyond what the integrator passes as element references.

## Current distribution model

- Source lives at `packages/xapps-embed-sdk/src/index.ts`
- Build outputs:
  - `dist/sdk/xapps-embed-sdk.esm.js`
  - `dist/sdk/xapps-embed-sdk.umd.js`
- Built by `scripts/build-embed-sdk.mjs`
- Served via gateway embed SDK routes (`/embed/sdk/...`)
- Package metadata is also formalized at `packages/xapps-embed-sdk/package.json` for direct
  distribution when needed

## Current runtime contract (baseline)

- Integrators consume browser artifacts from gateway routes (`/embed/sdk/*`).
- Public browser surface is the SDK API exposed by generated ESM/UMD bundles.
- Backward compatibility follows platform release policy while Option A is active.
- No npm registry dependency is required for host integrators today, but the package contract is no
  longer artifact-only.

## Payment orchestration helpers

The SDK includes host-facing helpers for tenant payment return/resume flows:

- `parsePaymentReturnFromSearch(search)` for `xapps_payment_*` evidence parsing.
- `parsePaymentResumeFromSearch(search)` for typed `xapps_resume` decode.
- `stripPaymentReturnParamsFromUrl(urlLike)` for deterministic URL cleanup.
- `resolvePaymentReturnContext(urlLike)` to parse + normalize in one call (`resume`, `paymentParams`, `cleanedUrl`, `buildHostReturnUrl`).

Additional host boilerplate helpers:

- `resolveGatewayBaseUrl(options?)` for consistent gateway base URL inference/overrides.
- `createHostApiClient(options?)` for normalized host API request/error handling.
- `createHostPaymentResumeState(urlLike, options?)` for one-time payment evidence + resume lifecycle management.

Recommended host flow:

1. Parse `window.location.search` once on page load.
2. Capture payment params/resume route in local in-memory state for one-time forwarding.
3. Clean `xapps_payment_*` + `xapps_resume` from the browser URL before continuing.
4. Build `xapps_host_return_url` through `buildHostReturnUrl(...)` so host pages preserve return context deterministically.

Canonical payment evidence note:

- `xapps_payment_issuer` is required in returned `xapps_payment_*` params for strict contract parsing.

## Owner-managed payment page helper

Use `createOwnerManagedPaymentPageController(urlLike)` for owner-managed tenant/publisher payment pages.

It centralizes:

- effective return URL resolution
- cancel URL resolution
- forwarding `xapps_payment_*` params back to the widget/host return URL

Recommended browser import:

```ts
import { createOwnerManagedPaymentPageController } from "/embed/sdk/xapps-embed-sdk.esm.js";

const controller = createOwnerManagedPaymentPageController(window.location.href);
if (controller.hasReturnedPaymentEvidence) {
  controller.redirectReturnedPaymentToHost();
}
```

The page should serve the bundle from the same origin (`/embed/sdk/xapps-embed-sdk.esm.js`) so owner-managed payment flows do not depend on cross-origin gateway asset delivery.

Canonical starter/reference:

- `packages/xapps-embed-sdk/examples/payment-page/owner-managed-payment-page-starter.html`
- `docs/guides/23-owner-managed-payment-page-starter.md`

## Bridge-v2 helper

Use `createBridgeV2ApiHandlers(...)` to standardize host-side bridge handlers across embed pages:

- token refresh (`/api/bridge/token-refresh`)
- sign envelope (`/api/bridge/sign`)
- vendor assertion (`/api/bridge/vendor-assertion`)
- session-expired cleanup callback

This keeps host pages focused on routing/UI while bridge transport/auth boilerplate remains SDK-owned.

Default endpoints stay same-origin, but consumers can override:

- `tokenRefresh`
- `sign`
- `vendorAssertion`

through `createBridgeV2ApiHandlers({ endpoints: ... })`, `createEmbedHost({ bridgeV2: { endpoints } })`,
or `createStandardMarketplaceRuntime({ bridgeV2: { endpoints } })`.

## Marketplace mutation helper

Use `createMarketplaceMutationEventHandler(...)` to keep install/update/uninstall event handling consistent:

- Maps `XAPPS_MARKETPLACE_REQUEST_INSTALL|UPDATE|UNINSTALL` to your host endpoints.
- Emits standardized success/failure events back to catalog.
- Supports callback hooks (`onInstallSuccess`, `onUpdateFailure`, etc.) for host page side effects.
- Avoids duplicate widget open by leaving `XAPPS_OPEN_WIDGET` to host default lifecycle.

Recommended usage:

1. Build one handler per host page with `getHost`, `getSubjectId`, and `callApi`.
2. In `onEvent`, call the helper first and early-return when it handles the event.
3. Keep only page-specific state logic in remaining `onEvent` branches.

## Host UI bridge helper

Use `createHostUiBridge(...)` + `createHostConfirmDialog(...)` to remove per-page UI bridge boilerplate:

- Standardized handling of `XAPPS_UI_*` message types.
- Optional integrator callbacks for toast/modal/navigation/state handlers.
- Default `window.XappsHost` exposure for same-origin/direct widget interactions.
- Deterministic cleanup via returned `detach()` controller.
- Optional `openOperationalSurface(...)` handler for widget-driven operational navigation.

Recommended usage:

1. Create one bridge per host page with `getContext` and your UI callbacks.
2. Reuse `createHostConfirmDialog` for guard confirmation UX and `confirmDialog` fallback.
3. Call `detach()` on teardown/unload.

Operational surface support:

- Event: `XAPPS_OPEN_OPERATIONAL_SURFACE`
- Supported surfaces:
  - `requests`
  - `payments`
  - `invoices`
  - `notifications`
- Optional focused record ids:
  - `requestId`
  - `paymentSessionId`
  - `invoiceId`
  - `notificationId`
- Optional placement hint:
  - `in_router`
  - `side_panel`
  - `full_page`

Current default host behavior remains `in_router`. The placement contract is declared now so hosts
can evolve later without changing the widget-side API.

Minimal callback example:

```ts
const hostUiBridge = createHostUiBridge({
  getContext: () => ({ installationId, widgetId, devMode: false }),
  openOperationalSurface: (input) => {
    const next = new URL(window.location.href);
    next.searchParams.set("surface", input.surface);
    if (input.installationId) next.searchParams.set("installationId", input.installationId);
    if (input.paymentSessionId) next.searchParams.set("paymentSessionId", input.paymentSessionId);
    if (input.invoiceId) next.searchParams.set("invoiceId", input.invoiceId);
    if (input.notificationId) next.searchParams.set("notificationId", input.notificationId);
    window.location.assign(next.toString());
  },
});
```

## Recommended host contract

Use this order by default:

1. `createStandardMarketplaceRuntime(...)`
2. `createEmbedHost(...)` only when the host shape is genuinely narrower or more custom
3. lower-level primitives only when you are extending the SDK contract itself

Practical split:

- `createStandardMarketplaceRuntime(...)`
  - default browser contract for marketplace hosts
  - single-panel and split-panel flow
  - payment resume reopen flow
  - split-panel widget lifecycle
- `createEmbedHost(...)`
  - lower-level host composition
  - best for single-surface, filtered-catalog, or widget-only hosts
- `createHostDomUiController(...)`
  - DOM-backed toast/modal/confirm helper

Starter/reference:

- `packages/xapps-embed-sdk/examples/runtime-minimal/index.html`
- `packages/xapps-embed-sdk/examples/marketplace-host-starter/index.html`

Inside `marketplace-host-starter`:

- `main.js`
  - entry/bootstrap
- `runtime.js`
  - shared browser runtime configuration
- `shell.js`
  - local branding and page chrome

`apps/tenants/xconect/host/*` follows this same split as a real tenant consumer.

## Lower-level composition example

Use this pattern only when `createStandardMarketplaceRuntime(...)` is not the right fit:

```ts
import {
  createBridgeV2ApiHandlers,
  createHost,
  createHostApiClient,
  createHostPaymentResumeState,
  createHostUiBridge,
  resolveGatewayBaseUrl,
} from "/embed/sdk/xapps-embed-sdk.esm.js";

const baseUrl = resolveGatewayBaseUrl({ fallback: "http://localhost:3000" });
const api = createHostApiClient({ baseUrl, timeoutMs: 15000 });
const payment = createHostPaymentResumeState(window.location.href);
const uiBridge = createHostUiBridge({ getContext: () => ({ installationId, widgetId }) });
const bridgeV2 = createBridgeV2ApiHandlers({
  callApi: (path, payload) => api(path, payload),
  getWidgetContext: () => ({ installationId, widgetId }),
  getHostReturnUrl: () => payment.buildHostReturnUrl({ baseUrl: window.location.href }),
  clearSession: () => localStorage.removeItem("integration_host_bridge_session_token"),
});

const host = createHost({
  container,
  baseUrl,
  hostApi: {
    createCatalogSessionUrl: "/api/create-catalog-session",
    createWidgetSessionUrl: "/api/create-widget-session",
  },
  bridgeV2,
  embedContext: {
    getHostReturnUrl: () => payment.buildHostReturnUrl({ baseUrl: window.location.href }),
    getPaymentParams: () => payment.consumePaymentParams(),
  },
});

window.addEventListener("beforeunload", () => uiBridge.detach());
```

Notes:

- `createHostPaymentResumeState(...)` ensures payment params are consumed once.
- `embedContext.getPaymentParams()` should return one-time params, not persistent URL values.
- Prefer hiding this wiring inside one local runtime wrapper instead of repeating it across pages.

## Enterprise browser host path

The browser-side enterprise contract is now:

- `createEmbedHost(options)`
  - low-level host composition helper
  - creates standardized API client, payment resume state, bridge-v2 handlers, overlay wiring, UI bridge, and mutation handler
- `createHostDomUiController(options)`
  - DOM-backed toast/modal/confirm helper
- `createStandardMarketplaceRuntime(options)`
  - standard single-panel / split-panel marketplace runtime

This means a tenant host should usually:

1. keep privileged gateway calls on the server side via `@xapps-platform/server-sdk`
2. use `@xapps-platform/embed-sdk` for browser host/runtime orchestration
3. keep only branding, identity bootstrap, and small overrides in tenant code

`apps/tenants/xconect/host/*` is the current branded reference consumer of this model.

## `createEmbedHost(...)`

Use `createEmbedHost(...)` when you need the shared host building blocks but still want to own the overall page/runtime composition.

It standardizes:

- host API client creation
- payment resume parsing/building
- bridge-v2 wiring
- host expand overlay
- host UI bridge
- marketplace mutation handler
- `apiBasePath` -> standard `/api/*` host routes

Useful when:

- the host is not exactly single-panel or split-panel
- the host needs custom catalog/widget orchestration
- the host still wants the shared bridge/mutation/overlay contract

## `createStandardMarketplaceRuntime(...)`

Use `createStandardMarketplaceRuntime(...)` when the host wants the standard marketplace runtime and only needs small overrides.

It owns:

- single-panel catalog mode
- split-panel catalog + widget mode
- payment resume reopen behavior
- widget context state
- standard split-panel mutation behavior
- standard split-panel event behavior

Expected inputs:

- `baseUrl`
- `subjectId`
- `paymentResumeState`
- `hostUi`
- `apiBasePath`
- `getCatalogMount()`
- optional `getWidgetMount()`
- optional theme and lifecycle overrides

Minimal example:

```ts
import {
  createHostDomUiController,
  createHostPaymentResumeState,
  createStandardMarketplaceRuntime,
} from "/embed/sdk/xapps-embed-sdk.esm.js";

const hostUi = createHostDomUiController({
  toastRootId: "toast-root",
  modalBackdropId: "host-modal",
  modalTitleId: "host-modal-title",
  modalMessageId: "host-modal-message",
  modalCloseId: "host-modal-close",
});

const runtime = createStandardMarketplaceRuntime({
  baseUrl: "http://localhost:3000",
  subjectId,
  apiBasePath: "/api",
  paymentResumeState: createHostPaymentResumeState(window.location.href, {
    autoCleanUrl: true,
  }),
  hostUi,
  getCatalogMount: () => document.getElementById("catalog"),
  getWidgetMount: () => document.getElementById("widget"),
  splitPanel: {
    setWidgetPlaceholder: (title, message) => {
      const node = document.getElementById("widget");
      if (node) node.textContent = `${title} ${message}`.trim();
    },
  },
});

await runtime.mount("single-panel");
```

Starter/reference:

- `packages/xapps-embed-sdk/examples/runtime-minimal/index.html`
- `packages/xapps-embed-sdk/examples/marketplace-host-starter/index.html`
  - split starter shape:
    - `main.js`
    - `runtime.js`
    - `shell.js`
- examples overview:
  - `packages/xapps-embed-sdk/examples/README.md`

## `createHostDomUiController(...)`

Use `createHostDomUiController(...)` to remove repeated host DOM UI boilerplate for:

- toasts
- modal open/close
- confirm dialog composition

It exposes:

- `bridgeOptions`
- `showNotification(...)`
- `showAlert(...)`
- `openModal(...)`
- `closeModal(...)`
- `destroy()`

This is the preferred DOM-backed host UI primitive for tenant hosts that are not using a framework-specific component system.

## Lower-level runtime helpers

For custom hosts that need to go below `createStandardMarketplaceRuntime(...)`, the package also exposes:

- `createEmbedHostWidgetContext(...)`
- `createMutationFailureCallbacks(...)`
- `createSplitPanelCatalogEventHandler(...)`
- `createSplitPanelMutationCallbacks(...)`

These are composition helpers, not the recommended default starting point for third-party integrators.

## Additive `embedContext` host option

`createHost(...)` now supports optional `embedContext` callbacks:

- `getHostReturnUrl()`
- `getPaymentParams()`

When provided, SDK automatically applies:

- `xapps_host_return_url` to catalog/widget embed URLs
- `xapps_payment_*` forwarding for payment resume/orchestration flows

This removes repetitive per-page URL plumbing for third-party hosts while preserving backward compatibility.

## SDK relations

- Pairs naturally with `@xapps-platform/marketplace-ui` for React marketplace screens, including xapp-scoped
  `requests`, `payments`, `invoices`, and `notifications` views, but can also be used from plain
  host pages (for example, integration-host static demos).
- Complements `@xapps-platform/widget-sdk`: embed-sdk handles host-side bridge transport; widget-sdk handles iframe-side typed bridge API.
- Complements `@xapps-platform/server-sdk`: server-sdk signs/verifies payment return contracts that embed-sdk forwards through host return/resume flows.

## Distribution policy (formalized)

- `Option A (default runtime path)` Artifact-first:
  - Source stays in monorepo.
  - Browser artifacts are built and served by gateway (`/embed/sdk/*`).
  - This remains the canonical integration path for current tenants/hosts.

- `Option B (formalized package policy)` npm distribution:
  - Public package name: `@xapps-platform/embed-sdk`.
  - Package metadata is defined at `packages/xapps-embed-sdk/package.json`.
  - `prepack` uses `scripts/prepare-embed-sdk-package.mjs` to copy gateway-built artifacts into package `dist/`.
  - Public exports:
    - ESM: `dist/xapps-embed-sdk.esm.js`
    - UMD: `dist/xapps-embed-sdk.umd.js` (`./umd` export)
    - Types: `dist/index.d.ts`

Semver policy:

- Additive-only changes in current minor track for exported host APIs.
- Breaking changes require an explicit major version and migration notes.
- Artifact route contract and npm package API should remain aligned (no divergent behavior).

Release gate:

1. `npm run build:sdk` completed.
2. `npm pack` from `packages/xapps-embed-sdk` succeeds (prepack copies artifacts).
3. Host parity tests pass (`integration-host` + `xconectc`/`xconectc-host` contract tests).
4. Docs are synchronized (`docs/guides/02-embedding.md`, `docs/packages/xapps-embed-sdk.md`, package README).

## Source

- Source: `packages/xapps-embed-sdk/src/index.ts`
- Local README: `packages/xapps-embed-sdk/README.md`
