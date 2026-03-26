# `xplace-example` Backend

Public publisher reference backend shell.

Current shape:

- thin runtime shell in [server.js](./server.js)
- local package boundary in [package.json](./package.json)
- sample env in [.env.example](.env.example)
- local dev env in [.env.dev](.env.dev)
- shared publisher core consumed from
  [apps/publishers/shared/xplace-core](../../shared/xplace-core/README.md)

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

- full current four-xapp `xplace-example` fleet
- use `--manifests` only when you want to narrow it manually

Local PostgreSQL baseline:

```bash
createuser --superuser "$USER" || true
createdb xplace_example
```
