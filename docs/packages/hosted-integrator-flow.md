# Hosted Integrator Flow

This page shows the secure hosted-integrator model visually.

Goal:

- integrator owns the frontend UX on their own domain
- integrator backend performs the trusted bootstrap call
- tenant backend remains the platform backend of record
- tenant backend signs the browser bootstrap token
- browser never receives a raw platform API key

## Component View

```mermaid
flowchart LR
  subgraph BZ[Browser Zone]
    U[End User]
    IFE[Integrator Frontend<br/>domain1.ro]
  end

  subgraph IZ[Integrator Server Zone]
    IFB[Integrator Backend<br/>domain1.ro/api]
  end

  subgraph TZ[Tenant Zone]
    TB[Tenant Backend<br/>xconect.0x730.com]
  end

  subgraph PZ[Platform Zone]
    GW[Gateway / Platform APIs]
    PAY[Payments / Guards / Invoices / Notifications]
  end

  U --> IFE
  IFE -->|browser state:<br/>short-lived bootstrapToken only| U
  IFB -->|server-to-server bootstrap:<br/>POST /api/host-bootstrap + X-API-Key| TB
  U -->|browser host calls:<br/>X-Xapps-Host-Bootstrap| TB
  TB -->|platform authority:<br/>gateway credentials| GW
  TB -->|privileged runtime flows:<br/>payment / guard / invoice / notification secrets| PAY
```

## Bootstrap Sequence

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser
  participant IF as Integrator Frontend
  participant IB as Integrator Backend
  participant TB as Tenant Backend
  participant GW as Gateway

  Note over B,IF: Browser side gets only UI state and the short-lived bootstrapToken
  Note over IB: Integrator backend keeps the bootstrap API key
  Note over TB: Tenant backend keeps signing secret, gateway credentials, and payment/delegation secrets
  Note over GW: Gateway keeps subject/session authority

  B->>IF: Open host page
  IF->>IB: Request host bootstrap for authenticated user
  IB->>TB: POST /api/host-bootstrap + X-API-Key
  TB->>GW: Resolve subject with gateway credentials
  GW-->>TB: Subject-scoped subject identity
  Note over TB: Tenant backend signs short-lived bootstrapToken locally
  TB-->>IB: { subjectId, bootstrapToken }
  IB-->>IF: { subjectId, bootstrapToken }
  IF-->>B: Initialize browser-host identity state

  rect rgb(245, 247, 250)
    B->>TB: /api/host-config + X-Xapps-Host-Bootstrap
    B->>TB: /api/create-catalog-session + X-Xapps-Host-Bootstrap
    B->>TB: /api/create-widget-session + X-Xapps-Host-Bootstrap
    B->>TB: /api/install / update / uninstall + X-Xapps-Host-Bootstrap
    B->>TB: /api/bridge/* + X-Xapps-Host-Bootstrap
  end

  Note over B,TB: Browser presents only the short-lived bootstrap token
  Note over B,TB: Tenant backend continues all privileged runtime work
```

## Trust Boundary

What stays server-side:

- raw platform API key
- subject resolution authority
- bootstrap token signing
- catalog/widget session minting
- bridge refresh/signing
- payment orchestration
- guard, invoice, and notification flows

What reaches the browser:

- short-lived `bootstrapToken`
- subject-scoped host/session responses
- normal embed/browser runtime state

Credential/auth rule:

- integrator backend -> tenant backend: server-side bootstrap API key
- browser -> tenant backend: short-lived bootstrap token
- tenant backend -> gateway/platform services: normal platform credentials/secrets

The model is secure because:

- the browser does not receive raw tenant/gateway credentials
- the browser only receives a short-lived tenant-backend-issued bootstrap token
- the privileged system-to-system calls stay server-side
- the tenant backend remains the authority that mints browser-admission state for its own host APIs

## Secret And Credential Ownership

### Browser / Integrator Frontend

What it may hold:

- short-lived `bootstrapToken`
- normal browser host/runtime state

What it must not hold:

- tenant backend bootstrap API keys
- tenant backend signing secrets
- gateway API keys
- publisher API keys
- delegated payment secrets

### Integrator Backend

What it may hold:

- integrator-side authenticated user/session state
- server-side bootstrap API key used to call `POST /api/host-bootstrap`

What it must not expose to browser code:

- bootstrap API key
- tenant/gateway API keys
- other privileged platform credentials

### Tenant Backend

What it holds:

- `host.bootstrap.apiKeys`
- `host.bootstrap.signingSecret`
- gateway client credentials / API key
- delegated payment secret refs where relevant
- owner-managed payment signing/return secrets where relevant

What it does with them:

- authenticates the integrator backend bootstrap call
- resolves subject through the gateway
- signs the short-lived browser bootstrap token
- mints catalog/widget sessions
- runs bridge, lifecycle, payment, guard, invoice, and notification flows

### Gateway / Platform Side

What it holds:

- platform/gateway credentials
- subject resolution authority
- session minting authority
- platform-owned payment/invoice/notification credentials and state

Current bootstrap note:

- the gateway participates in subject resolution during bootstrap
- the gateway does not issue the browser bootstrap token in the current design

Operational note:

- the browser host should treat the bootstrap token as time-bounded session state
- after expiry, the frontend should re-run bootstrap instead of trying to continue with stale subject identity

## Current Config Surface

Integrator/frontend side:

- `backendBaseUrl`
- local host pages/assets
- local identity bootstrap storage

Integrator backend side:

- server-side bootstrap API key
- authenticated user context
- call to `POST /api/host-bootstrap`

Tenant backend side:

- `host.allowedOrigins`
- `host.bootstrap.apiKeys`
- `host.bootstrap.signingSecret`
- optional `host.bootstrap.ttlSeconds`

Gateway side during bootstrap:

- resolves subject identity
- does not issue the browser bootstrap token in the current design

## Current Local Proof

- [xconect-host](../../apps/tenants/xconect-host/README.md)
- [xconectb-host](../../apps/tenants/xconectb-host/README.md)
- related same-origin launcher-backed tenant sample:
  - [apps/tenants/xconectc/README.md](../../apps/tenants/xconectc/README.md)
- [backend-kit docs](./backend-kit.md)
- [browser-host docs](./browser-host.md)

The local proof hosts are intentionally minimal. They demonstrate the browser
contract and cross-origin tenant backend handoff, but they do not replace a
real integrator backend that authenticates the user before requesting host
bootstrap.
