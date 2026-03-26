# PHP Reference Tenant Note (`xconectb`)

This page is kept only as a short archival note.

The long roadmap/worklog that originally lived here is no longer needed in the
normal integrator documentation path.

## Current Meaning Of `xconectb`

`xconectb` exists to prove that the same tenant backend contract used by
`xconect` also works on PHP.

Current practical rule:

- `xconect` remains the canonical tenant documentation source
- `xconectb` is the PHP validation tenant
- both should follow the same tenant contract and backend-kit model

## What To Read Instead

If you are integrating a tenant now, use these pages instead:

1. [../README.md](../README.md)
2. [../backend/README.md](../backend/README.md)
3. [README.md](./README.md)
4. [php-laravel-quickstart.md](./php-laravel-quickstart.md)

If you need the current PHP reference tenant itself, use:

- [apps/tenants/xconectb/backend/README.md](../../xconectb/backend/README.md)
- [apps/tenants/xconectb/backend/bootstrap.php](../../xconectb/backend/bootstrap.php)

## Current Status

`xconectb` is no longer a speculative roadmap item.

It is now:

- bootable locally
- aligned to the backend-kit-first tenant model
- part of the current tenant parity validation path

Further PHP work should be tracked in the normal package and tenant docs, not in
another long roadmap page here.
