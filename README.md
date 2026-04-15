# `xapps-examples`

Public starter/reference app family for integrators.

This repo is intended to be:

- GitHub-only
- cloneable as a reference implementation set
- useful for learning, adapting, and bootstrapping real integrator projects

It is not intended to be:

- an npm package
- a Packagist package

Included public surfaces:

- tenant/reference apps under `apps/tenants/`
- shared public tenant docs under `apps/tenants/docs/`
- publisher reference app under `apps/publishers/xplace-example/`
- example deploy lane under `deploy/modes/partners-examples/`

Dependency rule:

- use published npm / Packagist packages for reusable SDK/runtime surfaces where they exist
- prefer the latest published stable versions by default
- keep canonical app names in this repo/export surface
- use `-example` only for deploy hostnames/domains, not for app folder names

Install rule:

- run `npm install` at the repo root to hydrate shared browser/runtime dependencies and the small Node tooling used by the host starter surfaces
- run Composer installs inside the PHP/Laravel starter apps as needed

Root helper commands:

- `npm run dev:xconecta-host`
- `npm run dev:xconectb-host`
