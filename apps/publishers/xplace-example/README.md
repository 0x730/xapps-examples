# `xplace-example` Workspace

`xplace-example` is the planned **public publisher reference surface**.

Use this workspace to stage the public-facing publisher example while keeping real production
publisher evolution inside private `xplace`.

Current rule:

- `xplace` remains the private production publisher surface
- `xplace-example` is the public publisher reference surface
- the two should stay close for now, but should not be treated as the same public/private product

Dependency rule:

- public starter/reference exports should prefer published npm / Packagist packages for shared SDK/runtime surfaces where those packages exist
- for those public exports, prefer the latest published stable versions by default
- the shared publisher core under `apps/publishers/shared/xplace-core` remains curated source inside the repo/export until it is intentionally productized as its own published surface

Near-term intent:

- keep this workspace thin
- reuse the same publisher contract and shared publisher core used by `xplace`
- let branding, docs, sample xapps, and public deployment posture live here

Current deployment rule:

- `xplace-example` is the broader public/example publisher fleet
- it should carry the full current four-xapp set from `xplace`
- it is the intended publisher side for:
  - `xconect` when you are exercising the public example/reference lane
  - `xconectb`
  - `xconectc`
  - `xconect-host`
  - `xconectb-host`
  - `xconectc-host`
- private production `xconect` + `xconect-host` remain paired with private `xplace`

Current workspace pieces:

- backend shell:
  - [backend/server.js](/home/dacrise/x/xapps/apps/publishers/xplace-example/backend/server.js)
  - [backend/package.json](/home/dacrise/x/xapps/apps/publishers/xplace-example/backend/package.json)
  - [backend/.env.example](/home/dacrise/x/xapps/apps/publishers/xplace-example/backend/.env.example)
- workspace scripts:
  - [scripts/provision-publisher.mjs](/home/dacrise/x/xapps/apps/publishers/xplace-example/scripts/provision-publisher.mjs)
  - [scripts/provision-publisher-admin.mjs](/home/dacrise/x/xapps/apps/publishers/xplace-example/scripts/provision-publisher-admin.mjs)
  - [scripts/prepare-republish-manifests.mjs](/home/dacrise/x/xapps/apps/publishers/xplace-example/scripts/prepare-republish-manifests.mjs)
- root entrypoints:
  - [scripts/provision-xplace-example-publisher.mjs](/home/dacrise/x/xapps/scripts/provision-xplace-example-publisher.mjs)
  - [scripts/provision-xplace-example-publisher-admin.mjs](/home/dacrise/x/xapps/scripts/provision-xplace-example-publisher-admin.mjs)
  - [scripts/prepare-xplace-example-republish-manifests.mjs](/home/dacrise/x/xapps/scripts/prepare-xplace-example-republish-manifests.mjs)
- docs:
  - [docs/README.md](/home/dacrise/x/xapps/apps/publishers/xplace-example/docs/README.md)
  - [docs/IMPLEMENTATION_MAP.md](/home/dacrise/x/xapps/apps/publishers/xplace-example/docs/IMPLEMENTATION_MAP.md)

Related references:

- [Public Example Reference Layer Audit](/home/dacrise/x/xapps/dev/engineering/audits/systems/PUBLIC_EXAMPLE_REFERENCE_LAYER_AUDIT.md)
- [TASK-041](/home/dacrise/x/xapps/dev/engineering/pm/OPEN_POINTS.md#task-041-public-example--reference-layer-for-tenants-hosts-and-publisher)
- [xplace workspace](/home/dacrise/x/xapps/apps/publishers/xplace/README.md)
- [Implementation map](/home/dacrise/x/xapps/apps/publishers/xplace-example/docs/IMPLEMENTATION_MAP.md)

Current operator commands:

```bash
npm run seed:xplace-example-publisher
npm run seed:xplace-example-publisher-admin
npm run xplace-example:prepare-republish -- --json
```

Local dev note:

- `./dev-start.sh` now starts `xplace-example` automatically when `xconectb` or `xconectc` are enabled
- use `START_XPLACE_EXAMPLE=1 ./dev-start.sh` when you want the example publisher shell up explicitly
- on a clean DB, standalone `xplace-example` local bootstrap also needs a tenant context, for example:
  - `XPLACE_EXAMPLE_TENANT_SLUG=xconectb START_XPLACE_EXAMPLE=1 ./dev-start.sh`
- local grouped example publish uses:
  - `npm run publish:xconect-xplace-example`

Default republish behavior:

- `npm run xplace-example:prepare-republish` defaults to the full current four-xapp fleet
- `npm run xplace:prepare-republish` remains the narrow private production publisher path
- grouped example-lane publish:

```bash
npm run publish:xconect-xplace-example -- --reference-tenant-profile xconectc
```
