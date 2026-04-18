# Node.js Hosted-Integrator With Platform-Hosted Tenant

Use this page only for the Node-specific implementation details.

The canonical process is:

- [first-hosted-tenant-integrator-handoff.md](./first-hosted-tenant-integrator-handoff.md)

The shared starter boundary is:

- [hosted-integrator-starter-contract.md](./hosted-integrator-starter-contract.md)

## What Changes For Node

Only two things change relative to the canonical handoff:

1. the local `POST /api/host-bootstrap` implementation
2. how the local app serves the launcher, marketplace, and single-xapp pages

Everything else stays the same:

- we keep the tenant backend
- browser uses `X-Xapps-Host-Bootstrap`
- subject profiles are mandatory for the first hosted-integrator tenant lane
- browser host still calls `/api/catalog-customer-profile`
- our hosted tenant still calls `POST /guard/subject-profiles/tenant-candidates`

## Node References

- browser starter:
  - [packages/browser-host/examples/hosted-integrator-starter/README.md](../../../../packages/browser-host/examples/hosted-integrator-starter/README.md)
- Node proxy example:
  - [packages/server-sdk/examples/host-proxy/hosted-integrator-bootstrap.mjs](../../../../packages/server-sdk/examples/host-proxy/hosted-integrator-bootstrap.mjs)

## Minimum Node Config

Use any env names you want, but the app needs these values:

- public host base URL
- remote tenant backend base URL
- remote tenant bootstrap backend base URL
- bootstrap API key

Reference naming in the proof lane:

- `XCONECT_HOST_PUBLIC_BASE_URL`
- `XCONECT_HOST_BACKEND_BASE_URL`
- `XCONECT_HOST_BOOTSTRAP_BACKEND_BASE_URL`
- `XCONECT_HOST_BOOTSTRAP_API_KEY`

## Minimum Node Route

```ts
app.post("/api/host-bootstrap", async (req, res) => {
  const response = await fetch(
    `${process.env.HOST_BOOTSTRAP_BACKEND_BASE_URL}/api/host-bootstrap`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": String(process.env.HOST_BOOTSTRAP_API_KEY || ""),
      },
      body: JSON.stringify({
        ...(req.body.subjectId ? { subjectId: req.body.subjectId } : {}),
        ...(req.body.type ? { type: req.body.type } : {}),
        ...(req.body.identifier ? { identifier: req.body.identifier } : {}),
        ...(req.body.email ? { email: req.body.email } : {}),
        ...(req.body.name ? { name: req.body.name } : {}),
        ...(req.body.metadata ? { metadata: req.body.metadata } : {}),
        origin: String(process.env.HOST_PUBLIC_BASE_URL || ""),
      }),
    },
  );

  res.status(response.status).json(await response.json());
});
```

## Minimum Node Deliverables

1. local `POST /api/host-bootstrap`
2. launcher page using the browser starter
3. marketplace page using the browser starter
4. single-xapp page using the browser starter
5. profile endpoint behind `POST /guard/subject-profiles/tenant-candidates`

## Practical Rule

If the Node team asks “what do we build?”, the answer is:

1. copy the browser starter
2. copy the Node bootstrap proxy
3. wire their own identity into bootstrap
4. expose the mandatory profile source
