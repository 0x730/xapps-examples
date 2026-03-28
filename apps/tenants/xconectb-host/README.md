# xconectb-host

Minimal hosted-integrator proof host for `xconectb`.

This app is intentionally frontend-only:

- runs on its own origin
- mounts `@xapps-platform/browser-host`
- asks its own tiny local server for a short-lived host bootstrap
- the local server calls the remote `xconectb` backend with a server-side API key
- browser code never receives or stores the raw API key

Important:

- this app is a proof/reference host, not a production integrator backend
- its local `/api/host-bootstrap` route is only the minimal dev bridge to the tenant backend
- real integrator deployments should authenticate their own user first, then call the tenant backend server-to-server
- bootstrap tokens are short-lived; the proof host now attempts silent re-bootstrap first and falls back to the launcher if renewal fails

Dependency rule:

- this host proves the contract with local repo assets inside the canonical monorepo
- public starter/reference exports should consume the latest published stable `@xapps-platform/browser-host` package by default

Default local proof:

- host app: `http://localhost:3413`
- backend: `http://localhost:3313`

For the backend to allow this cross-origin proof, set:

- `XCONECTB_ALLOWED_ORIGINS=http://localhost:3413`
- `XCONECTB_HOST_BOOTSTRAP_API_KEYS=<shared-server-to-server-key>`
- `XCONECTB_HOST_BOOTSTRAP_SIGNING_SECRET=<shared-signing-secret>`

For the local proof host, set:

- `XCONECTB_HOST_BOOTSTRAP_API_KEY=<same-server-to-server-key>`

Optional when the browser should use the public tenant URL but the local/proxy
server should call an internal backend address:

- `XCONECTB_HOST_BOOTSTRAP_BACKEND_BASE_URL=<internal-bootstrap-target>`

Run:

```bash
npm run dev:xconectb-host
```

Or start it through the normal stack:

```bash
./dev-start.sh
```
