# xconectb (PHP tenant workspace)

`xconectb` is the PHP reference tenant for the same tenant contract used by
`xconect`.

It is the public vanilla-PHP starter/reference variant of that contract.

Practical rule:

- `xconect` remains the canonical tenant documentation source
- `xconectb` proves the same tenant contract on the PHP backend-kit path
- if behavior is unclear, fix the shared tenant docs instead of inventing a
  separate PHP tenant story

Dependency rule:

- inside this canonical monorepo, `xconectb` may keep local source/path wiring for coordinated development
- public starter/reference exports should prefer Packagist packages where they exist
- for those public exports, prefer the latest published stable versions by default

## Read First

- canonical tenant guide:
  - [../docs/README.md](../docs/README.md)
- PHP backend reference:
  - [backend/README.md](./backend/README.md)
- PHP quickstart note:
  - [../docs/tooling/php-laravel-quickstart.md](../docs/tooling/php-laravel-quickstart.md)

## What Lives Here

This workspace keeps:

- PHP startup/bootstrap and config mapping
- PHP host pages and host asset wiring
- PHP subject-profile defaults
- thin tenant-B provisioning wrappers

It should not define a second tenant API.

## Local Run

- `npm run dev:xconectb`
- `./dev-start.sh`

## Provisioning

- `npm run seed:xconectb-tenant`
- `npm run seed:xconectb-tenant-admin`
- `npm run seed:xconectb-policy-publisher`
- `npm run publish:xconect-xplace-example -- --reference-tenant-profile xconectb`
