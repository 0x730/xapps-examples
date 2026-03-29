# Tenant Module And Capability Matrix

Use this page when the tenant team needs a short answer to:

- what is supported now
- what is recommended for the first release
- what is tenant-owned versus platform-managed

This is a shared/common decision page. Choose the adoption mode first:

- [host-mode](../host-mode/README.md)
- [full-mode](../full-mode/README.md)
- [common](../common/README.md)

## First-Release Recommendation

Use this unless the tenant already knows it needs more ownership:

- browser host:
  - shared marketplace runtime
- backend:
  - backend kit default backend
- payments:
  - Stripe
  - `gateway_managed`
- lifecycle:
  - included
- subject profiles:
  - optional candidate sourcing only
- invoicing:
  - platform-managed
- notifications:
  - platform-managed

## Capability Matrix

| Capability                  | Current status    | First-release recommendation        | Ownership                                |
| --------------------------- | ----------------- | ----------------------------------- | ---------------------------------------- |
| Browser host                | supported         | required                            | shared runtime, tenant branding/config   |
| Host core routes            | supported         | required                            | backend kit default                      |
| Installation lifecycle      | supported         | required                            | backend kit default                      |
| Guard request seam          | supported         | required if tenant publishes guards | backend kit default, tenant policy logic |
| `gateway_managed` payments  | supported         | recommended default                 | shared runtime, tenant policy choice     |
| `tenant_delegated` payments | supported         | optional                            | tenant delegated refs/secrets            |
| `owner_managed` payments    | supported         | later option                        | tenant payment page and return handling  |
| Subject-profile candidates  | supported         | optional                            | tenant data/hook                         |
| Subject-profile persistence | partial           | platform-managed                    | platform-managed                         |
| Invoicing                   | supported in lane | platform-managed default            | platform-managed                         |
| Notifications               | supported in lane | platform-managed default            | platform-managed                         |

## Host Surface Matrix

| Surface        | Current status | First-release role              |
| -------------- | -------------- | ------------------------------- |
| `single-panel` | supported      | recommended marketplace default |
| `split-panel`  | supported      | optional marketplace variant    |
| `single-xapp`  | supported      | demo or validation surface      |

## Payment Mode Matrix

| Payment mode          | Current status | First-release role                                              |
| --------------------- | -------------- | --------------------------------------------------------------- |
| `gateway_managed`     | supported      | recommended default                                             |
| `tenant_delegated`    | supported      | optional if tenant already has delegated credentials            |
| `publisher_delegated` | supported      | optional if publisher-scoped delegated credentials are required |
| `owner_managed`       | supported      | later advanced option                                           |

Code anchors:

- [hostApiCore.js](../../../../packages/backend-kit/src/backend/routes/gateway/hostApiCore.ts)
- [hostApiLifecycle.js](../../../../packages/backend-kit/src/backend/routes/gateway/hostApiLifecycle.ts)
- [payment.js](../../../../packages/backend-kit/src/backend/routes/gateway/payment.ts)
- [subjectProfiles.js](../../../../packages/backend-kit/src/backend/routes/gateway/subjectProfiles.ts)
- [modes/index.js](../../xconect/backend/modes/index.js)

## Practical Rule

The tenant should start from the default backend-kit surface and customize only:

- branding and host pages
- policy choices
- subject-profile data
- explicit overrides
