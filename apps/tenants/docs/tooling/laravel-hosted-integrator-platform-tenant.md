# Laravel Hosted-Integrator With Platform-Hosted Tenant

Use this page only for the Laravel-specific implementation details.

The canonical process is:

- [first-hosted-tenant-integrator-handoff.md](./first-hosted-tenant-integrator-handoff.md)

The shared starter boundary is:

- [hosted-integrator-starter-contract.md](./hosted-integrator-starter-contract.md)

## What Changes For Laravel

Only two things change relative to the canonical handoff:

1. the local `POST /api/host-bootstrap` implementation
2. how the local Laravel app serves the launcher, marketplace, and single-xapp pages

Everything else stays the same:

- we keep the tenant backend
- browser uses `X-Xapps-Host-Bootstrap`
- subject profiles are mandatory for the first hosted-integrator tenant lane
- browser host still calls `/api/catalog-customer-profile`
- our hosted tenant still calls `POST /guard/subject-profiles/tenant-candidates`

## Laravel References

- browser starter:
  - [packages/browser-host/examples/hosted-integrator-starter/README.md](../../../../packages/browser-host/examples/hosted-integrator-starter/README.md)
- PHP/Laravel proxy example:
  - [packages/xapps-php/examples/host-proxy/hosted-integrator-bootstrap.php](../../../../packages/xapps-php/examples/host-proxy/hosted-integrator-bootstrap.php)

## Minimum Laravel Config

Use any env names you want, but the app needs these values:

- public host base URL
- remote tenant backend base URL
- remote tenant bootstrap backend base URL
- bootstrap API key

Reference naming in the Laravel proof lane:

- `XCONECTC_HOST_PUBLIC_BASE_URL`
- `XCONECTC_HOST_BACKEND_BASE_URL`
- `XCONECTC_HOST_BOOTSTRAP_BACKEND_BASE_URL`
- `XCONECTC_HOST_BOOTSTRAP_API_KEY`

## Minimum Laravel Route

```php
$response = Http::withHeaders([
    'Content-Type' => 'application/json',
    'X-API-Key' => config('xapps.host_bootstrap_api_key'),
])->post(config('xapps.host_bootstrap_backend_base_url') . '/api/host-bootstrap', [
    ...($subjectId !== '' ? ['subjectId' => $subjectId] : []),
    ...($type !== '' ? ['type' => $type] : []),
    ...($identifier !== null ? ['identifier' => $identifier] : []),
    ...($email !== '' ? ['email' => $email] : []),
    ...($name !== '' ? ['name' => $name] : []),
    ...($metadata !== null ? ['metadata' => $metadata] : []),
    'origin' => config('app.url'),
]);
```

## Minimum Laravel Deliverables

1. local `POST /api/host-bootstrap`
2. launcher route and page using the browser starter
3. marketplace route and page using the browser starter
4. single-xapp route and page using the browser starter
5. profile endpoint behind `POST /guard/subject-profiles/tenant-candidates`

## Practical Rule

If the Laravel team asks “what do we build?”, the answer is:

1. copy the browser starter
2. copy the Laravel bootstrap proxy
3. wire their own identity into bootstrap
4. expose the mandatory profile source
