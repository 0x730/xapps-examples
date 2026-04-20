# xconecta-host

Minimal hosted-integrator proof host for `xconecta`.

This app is intentionally frontend-only:

- runs on its own origin
- mounts `@xapps-platform/browser-host`
- asks its own tiny local server for a short-lived host bootstrap
- the local server calls the remote `xconecta` backend with a server-side API key
- browser code never receives or stores the raw API key

Important:

- this app is a proof/reference host, not a production integrator backend
- its local `/api/browser/host-bootstrap` route is only the minimal dev bridge to the tenant backend
- real integrator deployments should authenticate their own user first, then call the tenant backend server-to-server
- bootstrap tokens are short-lived entry state only; ongoing hosted control-plane access moves to host session after exchange
- the proof host attempts silent re-bootstrap first and falls back to the launcher if renewal fails

Dependency rule:

- this host proves the contract with local repo assets inside the canonical monorepo
- public starter/reference exports should consume the latest published stable `@xapps-platform/browser-host` package by default

Default local proof:

- host app: `http://localhost:3414`
- backend: `http://localhost:3314`

For the backend to allow this cross-origin proof, set:

- `XCONECTA_ALLOWED_ORIGINS=http://localhost:3414`
- `XCONECTA_HOST_BOOTSTRAP_API_KEYS=<shared-server-to-server-key>`
- `XCONECTA_HOST_BOOTSTRAP_SIGNING_SECRET=<shared-signing-secret>`
- `XCONECTA_HOST_SESSION_SIGNING_SECRET=<host-session-signing-secret>`

For the local proof host, set:

- `XCONECTA_HOST_BOOTSTRAP_API_KEY=<same-server-to-server-key>`

Optional when the browser should use the public tenant URL but the local/proxy
server should call an internal backend address:

- `XCONECTA_HOST_BOOTSTRAP_BACKEND_BASE_URL=<internal-bootstrap-target>`

Concrete integrator runbook:

- [apps/tenants/docs/tooling/first-hosted-tenant-integrator-handoff.md](../docs/tooling/first-hosted-tenant-integrator-handoff.md)
- [apps/tenants/docs/tooling/nodejs-hosted-integrator-platform-tenant.md](../docs/tooling/nodejs-hosted-integrator-platform-tenant.md)

Browser contract:

- this proof host now exercises the unified `@xapps-platform/browser-host` surface
- the proof/reference launcher/pages come from `apps/tenants/reference-host-common`
- local `/api/browser/host-bootstrap` only bootstraps the session; ongoing hosted API authority is the tenant-issued host session
- real integrators should start from the browser starter, not from this proof app line-by-line

Run:

```bash
npm run dev:xconecta-host
```

Or start it through the normal stack:

```bash
./dev-start.sh
```
