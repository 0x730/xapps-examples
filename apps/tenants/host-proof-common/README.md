# host-proof-common

Shared hosted-integrator proof scaffold for the tenant reference hosts.

This folder is not a reusable package. It is the shared app/support layer used by:

- [xconect-host](/home/dacrise/x/xapps/apps/tenants/xconect-host/README.md)
- [xconectb-host](/home/dacrise/x/xapps/apps/tenants/xconectb-host/README.md)
- [xconectc-host](/home/dacrise/x/xapps/apps/tenants/xconectc-host/README.md)

Publication policy:

- keep this as a shared support module in the canonical repo
- treat it as part of the public starter/reference family exported through `xapps-examples`
- do not present it as the primary starter entrypoint by itself

It owns only the proof/reference host pieces:

- tiny local bootstrap proxy server shape
- proof host HTML/CSS/JS
- expiring bootstrap identity handling

It does not own:

- shared browser runtime logic
- gateway credentials
- tenant backend host/session minting

Those stay in:

- [packages/browser-host/README.md](/home/dacrise/x/xapps/packages/browser-host/README.md)
- [packages/backend-kit/README.md](/home/dacrise/x/xapps/packages/backend-kit/README.md)
- [packages/xapps-backend-kit-php/README.md](/home/dacrise/x/xapps/packages/xapps-backend-kit-php/README.md)
