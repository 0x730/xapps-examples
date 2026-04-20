# First Hosted-Tenant Integrator Handoff

Use this page as the single handoff for the first hosted-integrator tenant
lane:

- integrator keeps their own Node.js or Laravel app shell
- we keep the tenant backend
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

They build exactly three things:

1. local `POST /api/browser/host-bootstrap`
2. thin host pages that call `@xapps-platform/browser-host`
3. server-to-server subject-profile source endpoint

They do not host runtime authority. The browser must never receive tenant API
keys, gateway API keys, or signing secrets.

They do not build:

- tenant runtime authority routes
- payment authority routes
- bridge signing logic
- custom browser runtime around the SDK

## 3. Runtime Flow

### Bootstrap flow

1. their app selects the current external identity
2. their app calls local `POST /api/browser/host-bootstrap`
3. their backend forwards to `POST {HOST_BOOTSTRAP_BACKEND_BASE_URL}/api/host-bootstrap`
4. our tenant resolves the platform subject
5. our tenant returns `subjectId` and short-lived `bootstrapToken`
6. the browser uses `X-Xapps-Host-Bootstrap` only to exchange into host-local
   session

### Auth classes

1. browser bootstrap entry
   - browser -> local backend `POST /api/browser/host-bootstrap`
2. tenant bootstrap operation
   - local backend -> tenant backend `POST /api/host-bootstrap`
   - server-side `X-API-Key`
3. host control-plane
   - browser host session cookie
   - catalog/session/lifecycle/advanced bridge routes
4. token-scoped execution-plane
   - gateway-issued widget/access token
   - widget tool execution and monetization routes

Execution-plane rule:

- prefer `Authorization: Bearer <token>` when browser code calls host
  execution-plane routes
- query/body token support should be treated as compatibility input, not the
  preferred integrator contract

This split is intentional:

- host session protects the hosted control-plane
- widget/access tokens protect runtime execution flows
- gateway credentials stay server-side on the tenant backend

### Subject-profile flow

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

- they do not need `subjectId` on first bootstrap
- we resolve `subjectId`
- later they may reuse stored `subjectId`
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

## 5. Expiry And Renewal Rule

`bootstrapToken` is short-lived bootstrap state, not durable browser auth.

Integrators must implement this behavior:

1. keep enough local identity context to call `POST /api/browser/host-bootstrap` again
2. let the browser SDK attempt silent re-bootstrap when the token expires
3. if silent re-bootstrap fails, return the user to the launcher
4. launcher reboots the session from the current local app identity

Failure handling rule:

- expired, missing, invalid, or rejected bootstrap state must fail closed
- the browser must not continue with stale host authority
- the recovery path is silent re-bootstrap first, launcher fallback second

## 6. Target Security Posture

The enterprise-grade target is:

- browser enters through local `POST /api/browser/host-bootstrap`
- local backend forwards to tenant `POST /api/host-bootstrap`
- browser presents bootstrap proof only to enter the host flow
- host backend verifies bootstrap and mints its own local session
- browser stops using bootstrap token as the ongoing credential

Recommended posture:

- secure cookie-backed local session
- `SameSite=None; Secure` for cross-origin hosted-integrator fetches
- strict invalidation and renewal on the host backend
- bootstrap proof kept short-lived and entry-only
- backend replay store for bootstrap exchange
- backend revocation store for explicit host-session logout/invalidation

Current backend-kit policy controls:

- `host.session.absoluteTtlSeconds`
- `host.session.idleTtlSeconds`
- `host.session.cookiePath`
- `host.session.cookieDomain`
- `host.session.cookieSameSite`
- `host.session.cookieSecure`
- required when `host.session.idleTtlSeconds > 0`: `host.session.store.activate`
- required when `host.session.idleTtlSeconds > 0`: `host.session.store.touch`
- required `host.session.store.isRevoked`
- required `host.session.store.revoke`

Important rule:

- current host-session exchange gives explicit absolute lifetime and explicit
  cookie posture
- only treat it as a real idle-timeout model when `idleTtlSeconds`,
  `host.session.store.activate`, and `host.session.store.touch` are configured

Current implementation note:

- hosted browser-host treats host-session exchange as the required path
- bootstrap remains entry proof and local renewal seam, not the ongoing browser
  authority path
- bootstrap-header usage should be treated as retirement cleanup only, not as a
  supported hosted authority path

Important rule:

- identity selection and subject-profile logic must remain the same while the
  session posture moves fully to backend-owned host session

### Host-session exchange contract

Target endpoint:

- `POST /api/host-session/exchange`

Target request:

- browser sends `X-Xapps-Host-Bootstrap`
- browser request still carries the real `Origin`

Target result:

- host backend verifies bootstrap proof
- host backend consumes bootstrap `jti` through a replay store
- host backend sets secure local session cookie
- browser stops using bootstrap token as the ongoing credential

Important rule:

- do not treat host-session exchange as production-ready unless replay
  consumption is configured on the backend
- use Redis, database storage, or an equivalent server-side replay store in
  real deployments
- after exchange, cross-origin hosted API calls must authenticate through the
  host-session cookie, not through bootstrap header reuse

Recovery rule after rollout:

- expired local session should fail closed
- recovery should renew local session if supported
- otherwise return to launcher and bootstrap again from local identity

Target logout/invalidation rule:

- host backend should expose `POST /api/host-session/logout`
- logout must revoke the current host-session server-side, not just clear a
  cookie in the browser
- browser SDK/controller should call that endpoint, clear local identity state,
  and return control to launcher-state

## 7. Identity Rule

The integrator chooses identity. We resolve platform subject from that
identity. Subject profiles must use the same identity basis.

Use identity in this order:

1. `identifier.idType + identifier.value`
2. `email` only as fallback
3. later, stored `subjectId` if available

If one email maps to multiple business identities, the integrator must choose
one before bootstrap. We do not infer “which company under this email”.

## 8. Browser Host Rule

Their host pages mount `@xapps-platform/browser-host` against our hosted
tenant.

Minimum browser work:

1. call `bootstrapXappsEmbedSession(...)`
2. call `mountCatalogEmbed(...)` or `mountSingleXappEmbed(...)`
3. keep local page HTML/CSS only as shell around those SDK calls

Runtime calls:

- `GET /api/host-config`
- `POST /api/create-catalog-session`
- `POST /api/catalog-customer-profile`
- `POST /api/create-widget-session`
- bridge and lifecycle routes as needed

Browser header:

- `X-Xapps-Host-Bootstrap`

Current browser responsibility:

- store the short-lived bootstrap state
- send `X-Xapps-Host-Bootstrap` only for host-session exchange or renewal entry
- silently re-bootstrap when possible
- redirect or return to launcher when re-bootstrap cannot succeed

Backend rule for hosted cross-origin requests:

- host APIs should require host-session cookie after exchange
- do not accept bootstrap header as ongoing cross-origin API authority

Target browser responsibility after host-session rollout:

- enter through bootstrap once
- exchange into host-local session
- stop treating bootstrap token as ongoing authority

Security note:

- browser-stored bootstrap state is bootstrap entry and renewal state only
- the enterprise-grade target is backend-owned host session after bootstrap
  verification
- browser-host runtime still enters through the same bootstrap process

Current integrator responsibility:

- local app identity remains the source of truth
- local `/api/browser/host-bootstrap` remains available for renewal
- launcher must be able to rebuild the session from local identity

## 9. Mandatory Subject-Profile Source

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

## 10. Acceptance Checklist

Ready means all of these are true:

1. local `POST /api/browser/host-bootstrap` forwards correctly
2. first bootstrap works with external `identifier`, not pre-known `subjectId`
3. browser host pages mount successfully and send `X-Xapps-Host-Bootstrap`
4. expired token silently re-bootstrap succeeds when local identity is still valid
5. failed re-bootstrap returns the user to launcher cleanly
6. hosted tenant can call `POST /guard/subject-profiles/tenant-candidates`
7. `POST /api/catalog-customer-profile` returns the expected selected profile
8. one marketplace flow and one single-xapp flow complete successfully

If enterprise host-session mode is used, also verify:

9. bootstrap proof is only needed to enter the host flow
10. host-local session takes over cleanly after verification

## 10.1 CORS/OIDC Checks (Common Local-Dev Failure)

If callback/OIDC/launcher pages run on a separate frontend origin, include that
origin in tenant allowed origins or browser fetches will fail despite `200`
responses.

Minimum rule:

- add every browser origin that calls tenant `/api/*` routes into tenant
  `*_ALLOWED_ORIGINS`

Common local case:

- if callback UI runs on `http://localhost:5177`, include:
  - `http://localhost:5177`
  - `http://127.0.0.1:5177`

Symptoms when missing:

- `No 'Access-Control-Allow-Origin' header is present`
- OIDC metadata fetch to `/api/.well-known/openid-configuration` blocked
- host-session exchange blocked from browser

## 11. References

- browser starter: [packages/browser-host/examples/hosted-integrator-starter/README.md](../../../../packages/browser-host/examples/hosted-integrator-starter/README.md)
- Node proxy example: [packages/server-sdk/examples/host-proxy/hosted-integrator-bootstrap.mjs](../../../../packages/server-sdk/examples/host-proxy/hosted-integrator-bootstrap.mjs)
- PHP/Laravel proxy example:
  - [packages/xapps-php/examples/host-proxy/hosted-integrator-bootstrap.php](../../../../packages/xapps-php/examples/host-proxy/hosted-integrator-bootstrap.php)

Practical rule:

- start with this page
- then read one stack wrapper only
- do not start from repo tenant hosts unless you are debugging our reference lanes
