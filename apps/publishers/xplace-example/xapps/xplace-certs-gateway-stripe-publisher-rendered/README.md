# `xplace-certs-gateway-stripe-publisher-rendered`

`TASK-044` reference xapp for the publisher-rendered certs lane in `xplace-example`.

Purpose:

- keep the certs application isolated from generic runtime code
- prove the real request-owned `after:request_created` payment lifecycle
- keep payment, invoice, notification, and request authority platform-owned

Current status:

- real manifest and publisher widget source
- first request-held lifecycle wired in core
- request-scoped payment reconcile/restart wired for expired or missing hosted sessions
- compact toolbar context aligned with JSON Forms for billing, pending payment, and available usage credits
- intended Node reference tenant family: `xconecta` (local proof lane may appear as `xconect`)

Current practical model:

- publisher iframe renders the business form
- publisher runtime stays blocked until the example backend verifies the short-lived widget token against the gateway contract
- platform creates the request
- platform opens the payment obligation on `after:request_created`
- the same request resumes automatically after payment confirmation
- if the old hosted payment session is expired or missing, the platform mints a fresh session for the same held request and relinks the request to it

Related planning:

- [Implementation Map](../../docs/IMPLEMENTATION_MAP.md)
- [TASK-044 Execution Note](../../../../../dev/engineering/notes/TASK-044_PUBLISHER_RENDERED_CERTS_EXECUTION_NOTE.md)
- [Publisher Rendered Module Composition Audit](../../../../../dev/engineering/audits/systems/PUBLISHER_RENDERED_MODULE_COMPOSITION_AUDIT.md)
