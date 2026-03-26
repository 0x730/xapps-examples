# xconect tenant xapps (tenant-owned policies/guards)

This folder contains tenant-owned xapps for the `xconect` tenant workspace (for example payment and policy guard xapps).

Start with the grouped lane docs before using the local manifest notes here:

- [docs/guides/xconect-xplace/README.md](../../../../docs/guides/xconect-xplace/README.md)
- [docs/guides/xconect-xplace/production-lane-runbook.md](../../../../docs/guides/xconect-xplace/production-lane-runbook.md)

## Current V1 path (important)

There are no tenant-side xapp authoring/import routes yet.

Until those routes exist, `xconect` tenant-owned guard/policy xapps are managed through a **publisher linked to the xconect tenant** (for example `xconect-policies`) using the standard publisher xapp import/publish routes and CLI commands.

This keeps manifests as the source of truth while reusing existing platform contracts.

This local README only documents the tenant-owned xapp/manifest workflow kept in this folder. It is
not the canonical place for overall tenant integration options or production-lane ownership.

## Provisioning (once per local environment)

```bash
npm run seed:xconect-tenant
npm run seed:xconect-tenant-admin
npm run seed:xconect-policy-publisher
```

Owned wrapper entrypoints for that baseline live under:

- [../scripts/provision-tenant.mjs](../scripts/provision-tenant.mjs)
- [../scripts/provision-tenant-admin.mjs](../scripts/provision-tenant-admin.mjs)
- [../scripts/provision-policy-publisher.mjs](../scripts/provision-policy-publisher.mjs)

## Internal CLI workflow (manifest-first)

Validate + generate/read-only AI artifacts for tenant-owned guard manifests:

```bash
npm run xapps -- dev check flow \
  --from apps/tenants/xconect/xapps/guards/xconect-tenant-payment-policy/flows/ai-artifacts.flow.json \
  --run \
  --artifacts-dir ./tmp/xconect-tenant-payment-policy-ai \
  --json
```

This keeps tenant policy xapps under the same repo-owned CLI workflow discipline as publisher xapps.

## Example: xconect tenant payment policy guard

Manifest:

- production lane baseline: `apps/tenants/xconect/xapps/guards/xconect-tenant-payment-policy/manifest.json`
- production lane:
  - `apps/tenants/xconect/xapps/guards/xconect-tenant-payment-policy-stripe-gateway/manifest.json`
  - `apps/tenants/xconect/xapps/guards/xconect-tenant-payment-policy-stripe-delegated/manifest.json`
- archived lab / non-production variants:
  - `samples/xapps/extensions-lab/variants/xconect/guards/xconect-tenant-payment-policy-netopia-delegated/manifest.json`
  - `samples/xapps/extensions-lab/variants/xconect/guards/xconect-tenant-payment-policy-netopia-gateway/manifest.json`

Production-lane policy:

- keep only the tenant baseline + first-class Stripe lanes in `apps/tenants/xconect/xapps/guards/`
- keep Netopia and future PayPal/provider-expansion variants in `samples/xapps/extensions-lab/variants/`
- only move variants back after they are ready for the first real `xconect` tenant lane

Before publish, template placeholders must be replaced for your environment (at minimum):

- `__TENANT_CLIENT_ID__`
- `__XCONECT_TENANT_GUARD_BASE_URL__`

Current owner-managed note:

- downstream app guard configs for `xconect-tenant-payment-policy` should resolve
  `__XCONECT_TENANT_PAYMENT_BASE_URL__/tenant-payment.html`
- the xconect backend now serves that page from `apps/tenants/xconect/host/tenant-payment.html`
  via `GET /tenant-payment.html`

## CLI publish path (linked publisher)

Use the linked publisher API key (`xconect-policies-dev-api-key` by default) with the standard local publisher gateway flow:

```bash
npm run xapps -- publish \
  --yes \
  --from <rendered-manifest.json> \
  --publisher-gateway-url http://localhost:3000 \
  --api-key xconect-policies-dev-api-key
```

## Guidance

- Keep secrets out of manifests (use endpoint credentials / env / secret providers)
- Keep tenant-owned policy xapps hidden from catalog where appropriate (`metadata.catalog.hidden = true`)
- Keep xconect policy manifests in this workspace; do not rely on manual DB edits
