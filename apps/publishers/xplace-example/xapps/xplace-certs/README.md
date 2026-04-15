# xplace-certs (tenant-managed baseline)

V1 sample JSON Forms xapp for the `xplace` publisher workspace.

Grouped lane docs live here first:

- [docs/guides/xconect-xplace/README.md](../../../../../docs/guides/xconect-xplace/README.md)
- [docs/guides/xconect-xplace/production-lane-runbook.md](../../../../../docs/guides/xconect-xplace/production-lane-runbook.md)

Current baseline

- JSON Forms renderer
- subject-profile guard before payment and request execution
- async publisher-managed manual review response flow
- tenant-managed pay-per-request guard integration (tenant payment page)
- publisher app auth to `xplace` endpoint (API key on publisher side)

Current ownership note

- keep this tenant-managed baseline in `apps/publishers/xplace-example/xapps/xplace-certs/`
- keep the gateway-managed Stripe variant in `apps/publishers/xplace-example/xapps/xplace-certs-gateway-stripe/`
- keep the tenant-delegated Stripe variant in `apps/publishers/xplace-example/xapps/xplace-certs-tenant-delegated-stripe/`
- archived non-production provider variants now live in:
  - `samples/xapps/extensions-lab/variants/xplace/xapps/xplace-certs-tenant-delegated-netopia/manifest.json`

## Subject profile guard

This sample now follows the same ownership pattern as payments.

What owns what:

- tenant guard xapp slug: `xconect-tenant-subject-profile-policy`
- tenant-owned definition ref: `xconect_tenant_billing_business`
- publisher xapp only adds the publisher-side source seam under `subject_profile_sources.publisher`

What it does:

- the tenant guard definition requires a billing profile and currently prefers the business lane
  (`company_identification_number` + invoice identity comes from the selected profile, not from duplicated
  form fields)
- lets the subject-profile guard discover candidate profiles from:
  - tenant provider endpoint owned by the tenant guard definition: `__XCONECTA_TENANT_GUARD_BASE_URL__/guard/subject-profiles/tenant-candidates`
- publisher provider endpoint: `__XPLACE_BACKEND_BASE_URL__/guard/subject-profiles/publisher-candidates`

Source manifest note:

- keep `__XPLACE_BACKEND_BASE_URL__` templated in source
- inject the real publisher base URL at publish time
- still keeps selection/capture inside the guard flow
- saves newly captured data privately for the subject by default
- the request form itself now keeps only request-specific fields like company CUI and contact
  details; billing identity comes from the chosen subject profile

Important boundary:

- the xapp does not inline the billing requirement or the tenant source seam
- those defaults come from the tenant-published guard manifest through `subject_profile_guard_ref`
- tenant/publisher endpoints only provide candidate profiles
- they do not bypass guard selection, remediation, or later sharing policy
- the current sample endpoints are reference seams; production auth and provider routing can evolve later without changing the xapp-level guard contract

## Internal CLI workflow (OPEN-067 Phase 1)

Validate + generate/read-only AI artifacts for this real sample app:

```bash
npm run xapps -- dev check flow \
  --from apps/publishers/xplace-example/xapps/xplace-certs/flows/ai-artifacts.flow.json \
  --run \
  --artifacts-dir ./tmp/xplace-certs-ai \
  --json
```

This runs:

- manifest validation
- `xapps ai plan` (internal mode) with `--out <artifacts-dir>/xapps-xplace-certs.plan.json`
- `xapps ai check` with the committed read-only policy and `--out <artifacts-dir>/xapps-xplace-certs.check.json`

Committed policy used by the flow:

- `apps/publishers/xplace-example/xapps/xplace-certs/ai/policy.readonly.internal-v1.json`

Flow files (custom app-owned, preferred over CLI hardcoded names):

- `apps/publishers/xplace-example/xapps/xplace-certs/flows/ai-artifacts.flow.json`
- `apps/publishers/xplace-example/xapps/xplace-certs/flows/manual-loop.flow.json`

Compatibility shortcut (built-in CLI flow, kept for Phase 1 convenience):

```bash
npm run xapps -- dev check flow --name xplace-certs --run --json
```

## Manual step-by-step (if needed)

```bash
npm run xapps -- validate --from apps/publishers/xplace-example/xapps/xplace-certs/manifest.json
npm run xapps -- ai plan \
  --mode internal \
  --from apps/publishers/xplace-example/xapps/xplace-certs/manifest.json \
  --preset internal-v1 \
  --flow xplace-certs \
  --json \
  --out /tmp/xapps-xplace-certs.plan.json
npm run xapps -- ai check \
  --mode internal \
  --plan /tmp/xapps-xplace-certs.plan.json \
  --policy apps/publishers/xplace-example/xapps/xplace-certs/ai/policy.readonly.internal-v1.json \
  --json \
  --out /tmp/xapps-xplace-certs.check.json
```

## Mock-aware AI plan (review-only; recommended for this sample)

This sample includes mock certificate images in `mocks/`. Use them to ask the CLI to suggest a more complete JSON Forms `input_schema` + `input_ui_schema` (wizard + preview panels) without writing the manifest.

### Heuristic review (no API key)

```bash
npm run xapps -- ai plan \
  --mode internal \
  --from apps/publishers/xplace-example/xapps/xplace-certs/manifest.json \
  --mocks-dir apps/publishers/xplace-example/xapps/xplace-certs/mocks \
  --ask-guidance \
  --json
```

Suggested guidance text:

- `Infer the complete form fields from these mockups, build a step wizard, add supported widget preview sections, and exclude payment screens because payment is handled by guards.`

### LLM-assisted review (OpenAI-compatible; default model `gpt-5.2`)

```bash
export OPENAI_API_KEY=...
export XAPPS_AI_MODEL=gpt-5.2

npm run xapps -- ai plan \
  --mode internal \
  --from apps/publishers/xplace-example/xapps/xplace-certs/manifest.json \
  --mocks-dir apps/publishers/xplace-example/xapps/xplace-certs/mocks \
  --guidance "Infer the complete form fields from these mockups, build a step wizard, add supported widget preview sections, and exclude payment screens because payment is handled by guards." \
  --llm \
  --json
```

Optional flags:

- `--llm-model <model>` to override the default
- `--llm-api-key <key>` instead of env vars
- `--llm-base-url <url>` for OpenAI-compatible providers

### Optional apply mode (not required for review)

If you want the CLI to validate and write suggested manifest patches:

```bash
npm run xapps -- ai plan \
  --mode internal \
  --from apps/publishers/xplace-example/xapps/xplace-certs/manifest.json \
  --mocks-dir apps/publishers/xplace-example/xapps/xplace-certs/mocks \
  --guidance "Infer the complete form fields from these mockups, build a step wizard, add supported widget preview sections, and exclude payment screens because payment is handled by guards." \
  --llm \
  --apply-manifest-hints \
  --json
```

Notes:

- For image mockups, the LLM path expects both `input_schema` and `input_ui_schema` suggestions; if incomplete, the CLI reports the issue and falls back to heuristic hints.
- `--apply-manifest-hints` validates the manifest before writing.

## Publisher sample integration

Run the sample publisher (`xplace`) in another terminal:

```bash
XPLACE_PORT=3012 \
XPLACE_API_KEY=xplace-dev-api-key \
XPLACE_ADMIN_KEY=xplace-dev-admin-key \
GATEWAY_BASE_URL=http://localhost:3000 \
node apps/publishers/xplace/backend/server.js
```

Then inspect pending manual-review requests:

```bash
curl -H 'x-xplace-admin-key: xplace-dev-admin-key' http://127.0.0.1:3012/xapps/manual/requests
```

Or run the self-contained manual loop smoke (starts mock callback gateway + xplace sample publisher automatically):

```bash
npm run xapps -- dev check flow \
  --from apps/publishers/xplace-example/xapps/xplace-certs/flows/manual-loop.flow.json \
  --run \
  --json
```

## Publish / republish

Use the grouped runbook for the canonical publish and republish path:

- [docs/guides/xconect-xplace/production-lane-runbook.md](../../../../../docs/guides/xconect-xplace/production-lane-runbook.md)

The normal path is now:

```bash
npm run xplace-example:prepare-republish -- --run --target-client-slug xconecta --api-key xplace-example-dev-api-key --gateway-url http://localhost:3000
```

That wrapper auto-ensures endpoint credentials for republished `xplace` slugs. Manual credential
repair is fallback only.

## Notes

- Publisher payments/settlement productization is out of scope for this sample. V1 uses tenant-managed payment page orchestration.
- The sample publisher persists workspace data to PostgreSQL through `XPLACE_DATABASE_URL`.
- `PUBLISHER_APP` endpoint auth secret is configured in the gateway endpoint credentials (publisher routes), not as a literal key in this manifest.
  - For local V1, set the gateway endpoint credential secret to match `XPLACE_XAPP_INGEST_API_KEY` in the xplace backend env.
- Example fallback manual repair after publish:

```bash
export XPLACE_XAPP_INGEST_API_KEY=xplace-dev-api-key

npm run xapps -- publisher endpoint credential set \
  --gateway-url http://localhost:3000 \
  --api-key xplace-dev-api-key \
  --xapp-slug xplace-certs \
  --env prod \
  --auth-type api-key \
  --header-name x-xplace-api-key \
  --secret-env XPLACE_XAPP_INGEST_API_KEY \
  --json
```
