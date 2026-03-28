# xconectb host

This folder contains the PHP reference tenant host pages for `xconectb`.

Practical rule:

- reuse the shared host implementation under
  [../../../../packages/browser-host/README.md](../../../../packages/browser-host/README.md)
- keep tenant-specific pages and config thin
- do not duplicate host bootstrap logic from `xconect`

Current surface family stays the same as `xconect`:

- `single-panel`
- `split-panel`
- `single-xapp`
- launcher and host headers now expose language selection for embed/runtime testing
- direct host testing can also use `?locale=en` or `?locale=ro`

Read first:

- canonical host guide:
  - [../../docs/host/README.md](../../docs/host/README.md)
- canonical tenant guide:
  - [../../docs/README.md](../../docs/README.md)
