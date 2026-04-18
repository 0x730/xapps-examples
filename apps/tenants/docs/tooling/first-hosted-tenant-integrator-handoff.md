# First Hosted-Tenant Integrator Handoff

Use this page as the single operational handoff for the first hosted-integrator
tenant lane.

This lane means:

- the integrator keeps their own Node.js or Laravel application shell
- we keep the tenant backend hosted on our side
- subject profiles are mandatory from day one

## 1. Values We Give The Integrator

We provide:

- `TENANT_BASE_URL`
- `HOST_BOOTSTRAP_BACKEND_BASE_URL`
- `HOST_BOOTSTRAP_API_KEY`
- the allowed public host origin
- `xappId` when single-xapp mode is needed
- the server-to-server auth method we will use against their profile endpoint

## 2. What The Integrator Must Build

They must build exactly three things:

1. local `POST /api/host-bootstrap`
2. host pages that mount `@xapps-platform/browser-host`
3. a server-to-server subject-profile source endpoint

They do not host runtime authority. The browser must never receive tenant API
keys, gateway API keys, or signing secrets.

## 3. Runtime Flow

### Bootstrap flow

1. their app selects the current external identity
2. their app calls local `POST /api/host-bootstrap`
3. their backend forwards to `POST {HOST_BOOTSTRAP_BACKEND_BASE_URL}/api/host-bootstrap`
4. our tenant resolves the platform subject
5. our tenant returns `subjectId` and short-lived `bootstrapToken`
6. the browser uses `X-Xapps-Host-Bootstrap`

### Subject-profile flow

Two current-system seams are involved:

- browser host -> our hosted tenant:
  - `POST /api/catalog-customer-profile`
- our hosted tenant -> integrator profile source:
  - `POST /guard/subject-profiles/tenant-candidates`

The browser never calls the integrator profile source directly.

## 4. Exact Bootstrap Contract

### Request body

First bootstrap usually looks like this:

```json
{
  "type": "business_member",
  "identifier": {
    "idType": "tenant_member_id",
    "value": "acct-company-a-user-42",
    "hint": "Company A"
  },
  "email": "user@example.com",
  "name": "Alex Example",
  "metadata": {
    "companyId": "company-a",
    "role": "member"
  }
}
```

Rules:

- first bootstrap does not require them to know `subjectId`
- we resolve `subjectId`
- later they may reuse stored `subjectId` if they kept it
- use `identifier` first; use `email` only as fallback

### Response body

They should treat the tenant response like this:

```json
{
  "subjectId": "sub_01...",
  "email": "user@example.com",
  "name": "Alex Example",
  "bootstrapToken": "....",
  "expiresIn": 300
}
```

They must store:

- `subjectId`
- `bootstrapToken`
- expiry

## 5. Identity Rule

The integrator chooses the identity. We resolve the platform subject from that
identity. Subject profiles must use the same identity basis.

Use identity in this order:

1. `identifier.idType + identifier.value`
2. `email` only as fallback
3. later, stored `subjectId` if available

If one email maps to multiple business identities, the integrator must choose
one before bootstrap. We do not infer “which company under this email”.

## 6. Browser Host Rule

Their host pages mount `@xapps-platform/browser-host` against our hosted tenant.

The current runtime uses:

- `GET /api/host-config`
- `POST /api/create-catalog-session`
- `POST /api/catalog-customer-profile`
- `POST /api/create-widget-session`
- bridge and lifecycle routes as needed

The browser sends:

- `X-Xapps-Host-Bootstrap`

## 7. Mandatory Subject-Profile Source

For this first lane, subject profiles are mandatory.

The integrator must expose:

- `POST /guard/subject-profiles/tenant-candidates`

This endpoint must resolve candidates from the same chosen identity that
bootstrap resolved. It must not re-infer identity from email alone.

Example request from our hosted tenant:

```json
{
  "subjectId": "sub_01...",
  "profile_family": "billing_business",
  "xapp_slug": "marketplace_custom_dashboard",
  "tool_name": "submit",
  "guard_context": {
    "trigger": "before:tool_run"
  },
  "clientId": "01...",
  "installationId": "01...",
  "requestId": "01..."
}
```

Example response:

```json
[
  {
    "id": "company-a-billing",
    "label": "Company A Billing",
    "profile_family": "billing_business",
    "is_default": true,
    "subject_id": "sub_01...",
    "data": {
      "profile_family": "billing_business",
      "company_name": "Company A SRL",
      "company_identification_number": "12345678",
      "vat_code": "RO12345678",
      "company_registration_number": "J40/123/2024",
      "address": "Str. Exemplu 1",
      "city": "Bucuresti",
      "country": "Romania",
      "country_code": "RO",
      "email": "billing@company-a.example",
      "phone": "+40 700 000 000"
    }
  }
]
```

## 8. Acceptance Checklist

The integration is ready only when all of these are true:

1. local `POST /api/host-bootstrap` forwards correctly
2. first bootstrap works with external `identifier`, not pre-known `subjectId`
3. browser host pages mount successfully and send `X-Xapps-Host-Bootstrap`
4. hosted tenant can call `POST /guard/subject-profiles/tenant-candidates`
5. `POST /api/catalog-customer-profile` returns the expected selected profile
6. one marketplace flow and one single-xapp flow complete successfully

## 9. Implementation References

- browser starter:
  - [packages/browser-host/examples/hosted-integrator-starter/README.md](../../../../packages/browser-host/examples/hosted-integrator-starter/README.md)
- Node proxy example:
  - [packages/server-sdk/examples/host-proxy/hosted-integrator-bootstrap.mjs](../../../../packages/server-sdk/examples/host-proxy/hosted-integrator-bootstrap.mjs)
- PHP/Laravel proxy example:
  - [packages/xapps-php/examples/host-proxy/hosted-integrator-bootstrap.php](../../../../packages/xapps-php/examples/host-proxy/hosted-integrator-bootstrap.php)
