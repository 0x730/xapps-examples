# `xplace-example` Backend

Public publisher reference backend shell.

Current shape:

- thin runtime shell in [server.js](./server.js)
- local package boundary in [package.json](./package.json)
- sample env in [.env.example](.env.example)
- local dev env in [.env.dev](.env.dev)
- isolated certs widget page in
  [assets/xplace-certs-gateway-stripe-publisher-rendered.html](./assets/xplace-certs-gateway-stripe-publisher-rendered.html)
- isolated bridge-session widget page in
  [assets/xplace-bridge-session-publisher-rendered.html](./assets/xplace-bridge-session-publisher-rendered.html)
- shared publisher core consumed from
  [apps/publishers/shared/xplace-core](../../shared/xplace-core/README.md)
- shared publisher bridge-session routes consumed from
  [apps/publishers/shared/publisherSessionBridge.js](../../shared/publisherSessionBridge.js)

Publisher-rendered request widget rule:

- the asset URL is only a public bootstrap shell
- request-capable UI must stay blocked until Xapps host/embed provides widget context and the backend verifies the short-lived widget token
- direct raw browser hits to the asset URL should show a clear host-required message, not unlock private runtime

Current front-door sequence:

1. open the public bootstrap shell
2. receive widget context from Xapps host/embed
3. call `/widgets/xplace-certs-gateway-stripe-publisher-rendered/bootstrap-verify`
4. unlock the request-capable form only after backend verification succeeds
5. if linking is required and the subject is not linked, the embed layer renders
   the linking guard before the publisher iframe becomes active

Optional stronger baseline already supported in this reference backend:

- `XPLACE_EXAMPLE_WIDGET_ALLOWED_ORIGINS`
- when set, both publisher-rendered bootstrap verify routes fail closed unless
  `hostOrigin` matches the explicit normalized origin allowlist
- when unset, current local/reference behavior stays unchanged
- this local env is the example-lane mapping of the shared package-level
  consumer contract:
  - `widgetBootstrap.allowedOrigins`
  - optional generic app env: `XAPPS_WIDGET_ALLOWED_ORIGINS`

Publisher-local session reference lane:

- the bridge-session asset keeps the same public bootstrap + verified runtime rule
- it now also demonstrates the first additive signed bootstrap ticket slice:
  - widget manifest sets `config.xapps.bootstrap_transport = "signed_ticket"`
  - wrapper carries `xapps_bootstrap_ticket` in the iframe URL hash
  - widget SDK forwards `bootstrapTicket` to the backend verify route
- after verification, it requests a vendor assertion from the bridge and exchanges it
  through `/xapps/bridge/exchange`
- the resulting local publisher session is visible through `/xapps/session/me`,
  `/xapps/session/events`, and `/xapps/session/logout`
- required backend env for that lane:
  - `XPLACE_EXAMPLE_PUBLISHER_ID`
  - `VENDOR_ASSERTION_SHARED_SECRET`
  - optional `XPLACE_EXAMPLE_WIDGET_ALLOWED_ORIGINS` for stricter bootstrap origin binding
- current local live proof for this lane is on the `xconect` Node tenant lane

Bridge-session flow:

```mermaid
flowchart LR
  A[Public iframe_url shell] --> B[verifyWidgetBootstrap()]
  B --> BT["Consume xapps_bootstrap_ticket from iframe URL hash"]
  BT --> C[POST /widgets/.../bootstrap-verify]
  C --> D[Gateway verifyBrowserWidgetContext]
  D --> E[Bridge.getVendorAssertion()]
  E --> F[POST /v1/publisher/bridge/token]
  F --> G[Short-lived vendor assertion]
  G --> H[POST /xapps/bridge/exchange]
  H --> I[Publisher-local session token]
  I --> J["GET xapps/session/me"]
  I --> K["GET xapps/session/events"]
  I --> L["POST xapps/session/logout"]
```

Current tested state model:

- no host/embed context -> keep form locked with host-required message
- bootstrap verification rejected -> keep form locked fail-closed
- linked subject -> target widget/form loads normally
- unlinked subject -> linking guard is shown instead of the target widget
- completed link -> reopening the same widget returns to the target widget
- revoked link -> reopening the same widget returns to the linking guard

Reference-lane rule:

- keep the current certs publisher-rendered example as the clean non-linking /
  bootstrap-verified baseline
- use the bridge-session example as the separate post-bootstrap local-session reference
- if we later need a full linking walkthrough here, add it as another example instead
  of mutating either current baseline flow

Near-term rule:

- do not copy the current `xplace` backend wholesale
- keep this shell thin
- let production-specific behavior stay in private `xplace`

Dependency note:

- shared SDK/runtime dependencies in public starter/reference exports should prefer published packages and the latest stable versions by default
- the shared `xplace-core` source remains repo-local for now and should travel with the curated public reference export rather than pretending to be a published package already

## Run

```bash
cp apps/publishers/xplace-example/backend/.env.example apps/publishers/xplace-example/backend/.env
npm run dev:xplace-example
```

For local orchestrated development, `./dev-start.sh` uses:

```bash
apps/publishers/xplace-example/backend/.env.dev
```

and starts `xplace-example` automatically when `xconectb` or `xconectc` are enabled.

If you start `xplace-example` explicitly on a clean DB without enabling `xconectb` or `xconectc`,
also provide a tenant slug for publisher bootstrap, for example:

```bash
XPLACE_EXAMPLE_TENANT_SLUG=xconectb START_XPLACE_EXAMPLE=1 ./dev-start.sh
```

Provisioning / republish entrypoints:

```bash
npm run seed:xplace-example-publisher
npm run seed:xplace-example-publisher-admin
npm run xplace-example:prepare-republish -- --json
npm run publish:xconect-xplace-example -- --reference-tenant-profile xconectb --dry-run --json
```

Default republish scope:

- full current five-xapp `xplace-example` fleet
- use `--manifests` only when you want to narrow it manually

Local PostgreSQL baseline:

```bash
createuser --superuser "$USER" || true
createdb xplace_example
```
