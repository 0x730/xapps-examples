# `xapps-examples`

Public starter/reference app family for integrators.

This repo is intended to be:

- GitHub-only
- cloneable as a reference implementation set
- useful for learning, adapting, and bootstrapping real integrator projects

It is not intended to be:

- an npm package
- a Packagist package

Dependency rule:

- use published npm / Packagist packages for reusable SDK/runtime surfaces where they exist
- prefer the latest published stable versions by default
- keep canonical app names in this repo/export surface
- use `-example` only for deploy hostnames/domains, not for app folder names
