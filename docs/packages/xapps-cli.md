# `@xapps-platform/cli`

Developer CLI package for local workflows and CI pipelines.

Current status:

- planned public package name: `@xapps-platform/cli`
- current source package path: `packages/xapps-cli`
- not in the public release lane yet

## Purpose

- OpenAPI import to manifest
- Bounded remote OpenAPI import fetch with explicit timeout control
- Scaffold/init manifest projects
- Manifest/schema validation
- Local dev callback simulation
- Local contract vector testing
- Local publish artifact packaging + optional remote publish POST handoff (token/idempotency/timeout + retry/backoff)
- Local bundle log/history inspection + optional remote log-source fetch (timeout + retry/backoff)
- Local relay tunnel baseline with optional inbound token hardening, readiness probe, and upstream timeout handling

## Runtime

- Terminal/CI environment (Node.js)

## Command baseline

- `xapps import`
- `xapps init`
- `xapps validate`
- `xapps dev`
  - baseline manifest watch/callback simulation flow (`xapps dev --from ...`)
  - internal-repo helper subcommands:
    - `xapps dev status refs [--json]`
    - `xapps dev check v1 [--json]`
    - `xapps dev check flow --name <flow> [--json] [--run] [--artifacts-dir <dir>]`
    - `xapps dev check flow --from <flow.json> [--json] [--run] [--artifacts-dir <dir>]`
    - `xapps dev check flow init --out <flow.json> --type <ai-artifacts|manual-loop> [--flow-id <id>] [--manifest <path>] [--policy <path>] [--smoke-script <path>] [--json]`
    - `xapps dev check flow lint --from <flow.json> [--json]`
- `xapps test`
- `xapps publish` (local package baseline + optional remote endpoint handoff)
- `xapps logs` (local bundle log baseline + optional remote logs endpoint)
- `xapps context export` (deterministic manifest/tools/widgets context snapshot for CI/agents; supports internal preset `--preset internal-v1`)
- `xapps tunnel` (local relay baseline)
- `xapps ai` (Phase-1 internal-mode plan/check contracts under `OPEN-067`, with mock-aware suggestions and optional LLM-assisted manifest hints)

## Profile/auth baseline

- Shared CLI profile config: `~/.xapps/config` (JSON), selected by `--profile` or env `XAPPS_CLI_PROFILE`.
- Remote auth headers support both Bearer token (`--token` / `XAPPS_CLI_TOKEN`) and API key (`--api-key` / `XAPPS_CLI_API_KEY`).
- Effective precedence: command flags > environment variables > selected profile values.
- `publish` includes confirmation flow and supports `--yes` for non-interactive release execution.
- `publish` supports signed metadata headers (`--signing-key`) and version conflict policy (`--version-conflict fail|allow`).
- `publish` release/registry contract baseline includes `--release-channel` and `--registry-target` (plus env/profile resolution).
- Remote publish acknowledgement contract baseline is normalized to `created|updated|already_exists`; unknown outcome values fail with `CLI_REMOTE_PUBLISH_ACK_INVALID`.
- Provider interoperability baseline: canonical ack parser accepts flat or nested outcome containers and normalizes common provider aliases into `created|updated|already_exists`.
- `logs` supports remote cursor/filter/follow options (`--cursor`, `--severity`, `--since`, `--until`, `--follow`) with reconnect-oriented polling, plus durable cursor persistence via `--follow-cursor-file`.
- `logs` managed semantics baseline includes optional lease/checkpoint resume state (`--lease-id`, `--checkpoint`) and durable persistence through `--follow-cursor-file`.
- `context export` produces deterministic context JSON (`xapps.context.v1`) with source hash, summary, tool/widget indexes, and canonicalized manifest payload.
- `tunnel` now enforces explicit target-host allowlist policy (`--allow-target-hosts`, default local-only), supports stable session identity/reconnect semantics (`--session-id`, `--session-file`), and adds explicit session lifecycle policy (`--session-policy reuse|require|rotate`) with runtime status endpoint `GET /__status`.
- CLI errors are normalized to machine-readable codes via `CliError.code`.
- `dev` internal-repo helper baseline (Phase 1 under `OPEN-067`) provides machine-readable repo/status/flow-check outputs without introducing a new runner.
- `ai` Phase-1 internal-mode baseline (under `OPEN-067`) provides machine-readable plan/check contracts (`xapps.ai.plan.v1`, `xapps.ai.check.v1`).
- `ai plan` can inspect local mock assets (`--mocks-dir` / `--mocks`) and emit `suggest.manifest_patch` hints (for example `input_schema` + `input_ui_schema` for JSON Forms).
- `ai plan --ask-guidance` can collect a one-line guidance prompt in TTY mode (for example: infer complete form fields from mockups, build a step wizard, add supported preview sections, exclude payment screens handled by guards).
- `ai plan --llm` enables an OpenAI-compatible suggestion path (default model `gpt-5.2`, override via `--llm-model` / `XAPPS_AI_MODEL`; auth via `--llm-api-key` / `OPENAI_API_KEY` / `XAPPS_AI_API_KEY`; base URL via `--llm-base-url` / `OPENAI_BASE_URL`).
- Remote import fetches default to `--fetch-timeout-ms 10000`; LLM calls default to `--llm-timeout-ms 30000` (or env `XAPPS_AI_TIMEOUT_MS`) so CLI automation does not hang indefinitely on unreachable upstreams.
- If LLM suggestions are unavailable or incomplete (for image mockups, both `input_schema` and `input_ui_schema` are required), CLI reports the error and falls back to heuristic hints.
- `ai plan --apply-manifest-hints` can validate and write suggested manifest patches (optional).
- `ai check` supports a built-in internal preset for quick checks: `--policy-preset internal-readonly` (use `--policy <file>` for app-specific stricter checks).

### Profile schema (baseline)

Config file path:

- `~/.xapps/config`

Schema (current baseline):

```json
{
  "version": 1,
  "profiles": {
    "default": {
      "token": "pat_xxx",
      "apiKey": "xapps_key_xxx"
    },
    "ci": {
      "token": "pat_ci_xxx"
    }
  }
}
```

Rules:

- Unknown top-level keys are ignored (forward-compatible additive evolution).
- `profiles` must be an object keyed by profile name.
- Profile values are optional; command flags and env vars may fully override profile values.
- Schema versioning policy is additive-first for this baseline (`version: 1`).

### Auth precedence matrix

For remote-capable commands (`publish`, `logs`, `tunnel`):

1. command flags (`--token`, `--api-key`)
2. environment (`XAPPS_CLI_TOKEN`, `XAPPS_CLI_API_KEY`)
3. selected profile in `~/.xapps/config` (`--profile` or `XAPPS_CLI_PROFILE`)

If both token and apiKey are present, command behavior uses explicit flag/env resolution order above.

### Command/auth rollout matrix (current-cycle baseline)

| Command   | Remote endpoint knobs                                                        | Auth/profile support                                  | Rollout decision                                 |
| --------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `publish` | `--publish-url` + release routing (`--release-channel`, `--registry-target`) | `--token` / `--api-key` / `--profile` + env fallbacks | Required for CI release handoff                  |
| `logs`    | `--logs-url`                                                                 | `--token` / `--api-key` / `--profile` + env fallbacks | Required for operator triage                     |
| `tunnel`  | local relay + `--target`                                                     | `--profile` + optional inbound auth token policy      | Required for local integration/runtime debugging |

Adoption standardization policy:

1. New CLI docs/examples must include all three remote-capable commands (`publish`, `logs`, `tunnel`) or state explicit out-of-scope rationale.
2. Auth examples must demonstrate `flags > env > profile` precedence at least once per command family.
3. CI snippets must branch deterministically on `CliError.code`/exit semantics, not only free-text matching.

## CI Cookbook

### Strict release

Use `--version-conflict fail` when CI should fail on existing versions.

```bash
xapps publish --yes --from ./manifest.json --publish-url "$PUBLISH_URL" --version-conflict fail --release-channel stable
```

Note: publish is tenant-aware. For `--publish-url`, set `target_client_id` in the manifest. For `--publisher-gateway-url`, you can alternatively use `--target-client-slug <tenant-slug>`.

Expected result:

- exit `0` on success
- exit `3` for `CLI_VERSION_CONFLICT` (`already_exists`)

### Idempotent release

Use `--version-conflict allow` when existing version should be treated as success.

```bash
xapps publish --yes --from ./manifest.json --publish-url "$PUBLISH_URL" --version-conflict allow
```

Note: publish is tenant-aware. For `--publish-url`, set `target_client_id` in the manifest. For `--publisher-gateway-url`, you can alternatively use `--target-client-slug <tenant-slug>`.

Expected result:

- exit `0` for `created`, `updated`, or `already_exists`

### Error code catalog

`CliError.code` baseline:

- `CLI_UNKNOWN_COMMAND`
- `CLI_INVALID_ARGS`
- `CLI_INVALID_OPTION`
- `CLI_INVALID_JSON`
- `CLI_CONFIG_INVALID`
- `CLI_PROFILE_NOT_FOUND`
- `CLI_CONFIRM_REQUIRED`
- `CLI_CONFIRM_DECLINED`
- `CLI_VERSION_CONFLICT`
- `CLI_REMOTE_PUBLISH_ERROR`
- `CLI_REMOTE_PUBLISH_ACK_INVALID`
- `CLI_REMOTE_LOGS_ERROR`
- `CLI_BUNDLE_NOT_FOUND`
- `CLI_CURSOR_STATE_IO`
- `CLI_TUNNEL_TARGET_NOT_ALLOWED`
- `CLI_TUNNEL_SESSION_IO`
- `CLI_TUNNEL_SESSION_REQUIRED`
- `CLI_TUNNEL_SESSION_CONFLICT`
- `CLI_TUNNEL_SESSION_TARGET_MISMATCH`
- `CLI_RUNTIME_ERROR`

## Operator Cookbook

## Internal Repo Helpers (OPEN-067 Phase 1)

These helpers are intended for internal engineering use in this monorepo (`xplace` + first xapp path). They are CLI-native and machine-readable.

### Show canonical implementation refs

```bash
xapps dev status refs --json
```

### Verify V1 repo baseline wiring (PM/docs/audits refs)

```bash
xapps dev check v1 --json
```

### Print predefined flow verification plan

```bash
xapps dev check flow --name pay-per-request --json
xapps dev check flow --name guard-orchestration --json
xapps dev check flow --name xplace-certs --json
xapps dev check flow --name pay-per-request --run --json
xapps dev check flow --name xplace-certs --run --json --artifacts-dir ./tmp/ai-artifacts
xapps dev check flow --from apps/publishers/xplace/xapps/xplace-certs/flows/ai-artifacts.flow.json --run --json --artifacts-dir ./tmp/xplace-certs-ai
xapps dev check flow --from apps/publishers/xplace/xapps/xplace-certs/flows/manual-loop.flow.json --run --json
xapps dev check flow init --type ai-artifacts --out ./tmp/flows/my-ai.flow.json --json
xapps dev check flow init --type ai-artifacts --flow-id xplace-certs-ai --manifest apps/publishers/xplace/xapps/xplace-certs/manifest.json --policy apps/publishers/xplace/xapps/xplace-certs/ai/policy.readonly.internal-v1.json --out ./tmp/flows/xplace-ai.flow.json --json
xapps dev check flow lint --from apps/publishers/xplace/xapps/xplace-certs/flows/ai-artifacts.flow.json --json
```

Current first publisher / first xapp sample used during `OPEN-067`:

- xapp manifest: `apps/publishers/xplace/xapps/xplace-certs/manifest.json`
- xapp workflow docs + read-only AI policy: `apps/publishers/xplace/xapps/xplace-certs/README.md`, `apps/publishers/xplace/xapps/xplace-certs/ai/policy.readonly.internal-v1.json`
- app-owned flow files (preferred for custom workflows): `apps/publishers/xplace/xapps/xplace-certs/flows/*.flow.json`
- generate a starter flow file and then edit app-specific paths: `xapps dev check flow init --type ai-artifacts|manual-loop --out <flow.json>`
- `ai-artifacts` starter templates use `--policy-preset internal-readonly` by default; switch to `--policy <file>` when you want stricter per-app checks
- `flow init` optional prefill flags help generate ready-to-edit workspace flows: `--flow-id`, `--manifest`, `--policy`, `--smoke-script`
- `flow lint` lets you validate custom flow JSON shape/command prefix hygiene before `--run`
- publisher endpoint sample: `apps/publishers/xplace/backend/server.js`

## AI Internal-Mode Stubs (OPEN-067 Phase 1)

Read-only CLI-native stubs for internal repo workflows (no file writes, no apply behavior).

### Emit internal plan contract (review-only)

```bash
xapps ai plan --mode internal --from ./manifest.json --json
```

### Mock-aware review (heuristic)

```bash
xapps ai plan \
  --mode internal \
  --from ./manifest.json \
  --mocks-dir ./mocks \
  --ask-guidance \
  --json
```

Example guidance text:

- `Infer the complete form fields from these mockups, build a step wizard, add supported widget preview sections, and exclude payment screens because payment is handled by guards.`

### Mock-aware review (LLM / OpenAI-compatible)

```bash
export OPENAI_API_KEY=...
export XAPPS_AI_MODEL=gpt-5.2

xapps ai plan \
  --mode internal \
  --from ./manifest.json \
  --mocks-dir ./mocks \
  --guidance "Infer complete form fields from these mockups, build a step wizard, add supported widget preview sections, and exclude payment screens because payment is handled by guards." \
  --llm \
  --json
```

Optional provider override:

```bash
xapps ai plan \
  --mode internal \
  --from ./manifest.json \
  --mocks-dir ./mocks \
  --llm \
  --llm-model gpt-5.2 \
  --llm-base-url https://api.openai.com/v1 \
  --json
```

### Apply suggested manifest hints (optional)

```bash
xapps ai plan \
  --mode internal \
  --from ./manifest.json \
  --mocks-dir ./mocks \
  --guidance "Infer complete form fields from these mockups, build a step wizard, add supported widget preview sections, and exclude payment screens because payment is handled by guards." \
  --llm \
  --apply-manifest-hints \
  --json
```

### Validate plan contract shape (read-only)

```bash
xapps ai check --mode internal --plan ./ai-plan.json --policy-preset internal-readonly --json
xapps ai check --mode internal --plan ./ai-plan.json --policy ./policy.json --json
```

### Export internal repo-aware context preset (for CLI/AI workflows)

```bash
xapps context export --from ./manifest.json --preset internal-v1 --out ./context.internal.json
```

### Local mode (artifact handoff)

```bash
xapps import --from ./openapi.yaml --out ./manifest.json
xapps validate --from ./manifest.json
xapps publish --from ./manifest.json --out ./artifacts/xapps-publish/bundle.json
xapps logs --from ./artifacts/xapps-publish/bundle.json --json
```

### CI mode (remote publish handoff)

```bash
xapps publish \
  --yes \
  --from ./manifest.json \
  --publish-url "$PUBLISH_URL" \
  --token "$XAPPS_CLI_TOKEN" \
  --idempotency-key "$CI_PIPELINE_ID" \
  --version-conflict fail
```

Use `--version-conflict allow` for idempotent release behavior.

### Internal local gateway publish (publisher routes)

```bash
xapps publish \
  --yes \
  --from ./manifest.json \
  --publisher-gateway-url http://localhost:3000 \
  --target-client-slug xconect \
  --api-key "$PUBLISHER_API_KEY"
```

This imports the manifest via `/publisher/import-manifest` and then publishes the version via
`/publisher/xapp-versions/:id/publish`, while still writing the local publish bundle.
`--target-client-slug` resolves the tenant via `/v1/publisher/clients` and injects `target_client_id` for the publish payload/bundle.

### Internal publisher endpoint credential setup (`PUBLISHER_APP` auth)

Use this after publishing an xapp to configure the gateway-side endpoint credential (not a manifest literal).

```bash
export XPLACE_XAPP_INGEST_API_KEY=xplace-dev-api-key

xapps publisher endpoint credential set \
  --gateway-url http://localhost:3000 \
  --api-key xplace-dev-api-key \
  --xapp-slug xplace-weather-now-gateway-stripe \
  --env prod \
  --auth-type api-key \
  --header-name x-xplace-api-key \
  --secret-env XPLACE_XAPP_INGEST_API_KEY \
  --json
```

### Managed remote logs mode

```bash
xapps logs \
  --logs-url "$LOGS_URL" \
  --token "$XAPPS_CLI_TOKEN" \
  --follow \
  --follow-cursor-file ./.xapps/log-cursor.json \
  --lease-id "$LOG_LEASE_ID" \
  --checkpoint "$LOG_CHECKPOINT" \
  --severity warn
```

### Tunnel mode (local relay ops)

```bash
xapps tunnel \
  --target http://127.0.0.1:9999 \
  --listen-port 4041 \
  --session-file ./.xapps/tunnel-session.json \
  --session-policy reuse \
  --allow-target-hosts 127.0.0.1,localhost

curl http://127.0.0.1:4041/__status
```

### Recovery matrix

1. `CLI_VERSION_CONFLICT` (exit `3`)
   - Keep strict pipelines on `--version-conflict fail`.
   - Use `--version-conflict allow` for idempotent/promotion flows.
2. `CLI_REMOTE_PUBLISH_ACK_INVALID`
   - Treat as provider contract drift; fail and escalate.
3. `CLI_REMOTE_LOGS_ERROR`
   - Use retryability/status metadata; preserve cursor state on unexpected failure.
4. `CLI_CURSOR_STATE_IO`
   - Fix file permissions/path first, then retry.
5. `CLI_TUNNEL_TARGET_NOT_ALLOWED` / `CLI_TUNNEL_SESSION_IO`
   - Correct allowlist/session-file policy and rerun.

## Reality flows (your context)

1. Publisher CI release + conflict-safe promotion

```bash
xapps publish \
  --yes \
  --from ./manifest.json \
  --publish-url "$PUBLISH_URL" \
  --token "$XAPPS_CLI_TOKEN" \
  --release-channel stable \
  --registry-target tenant-a \
  --version-conflict allow
```

2. Tenant/operator incident triage across reconnects

```bash
xapps logs \
  --logs-url "$LOGS_URL" \
  --token "$XAPPS_CLI_TOKEN" \
  --follow \
  --follow-cursor-file ./.xapps/logs.state \
  --severity error
```

3. Local callback/webhook debugging with deterministic session behavior

```bash
xapps tunnel \
  --target http://127.0.0.1:9999 \
  --session-file ./.xapps/tunnel-session.json \
  --session-policy reuse
```

### CI/Pipeline handling template

```bash
set +e
output="$(xapps publish --yes --from ./manifest.json --publish-url "$PUBLISH_URL" --version-conflict fail 2>&1)"
status=$?
set -e

if [ "$status" -eq 0 ]; then
  echo "publish_ok"
elif [ "$status" -eq 3 ] || echo "$output" | grep -q "CLI_VERSION_CONFLICT"; then
  echo "publish_conflict_already_exists"
  exit 0
elif echo "$output" | grep -q "CLI_REMOTE_PUBLISH_ACK_INVALID"; then
  echo "publish_provider_contract_drift"
  exit 1
elif echo "$output" | grep -q "CLI_REMOTE_PUBLISH_ERROR"; then
  echo "publish_remote_transport_failure"
  exit 1
else
  echo "$output"
  exit "$status"
fi
```

## Source

- Package: `packages/xapps-cli`
- Local README: `packages/xapps-cli/README.md`
