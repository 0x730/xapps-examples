# reference-host-common

Shared repo reference launcher/pages/runtime presets for the remaining reference
host lanes.

Purpose:

- keep repo-owned proof/reference browser pages out of the public SDK packages
- provide one shared reference layer for host examples that still want the same
  launcher/pages/CSS/preset behavior
- let reference hosts consume `@xapps-platform/browser-host` as an SDK instead
  of treating sample controller code as the SDK

Current consumers:

- `xconecta-host`
- `xconectb-host`

What belongs here:

- shared proof/reference Fastify server bootstrap
- shared proof/reference launcher and workspace pages
- shared proof/reference CSS
- shared proof/reference shell/runtime presets

What does not belong here:

- public browser SDK contract
- backend-kit host API contract
- integrator-mandatory code
- tenant-specific branding or production backend logic

Practical rule:

- `packages/browser-host` stays the browser SDK
- `packages/server-sdk` and `packages/xapps-php` stay backend SDK examples
- `reference-host-common` is only repo reference infrastructure
