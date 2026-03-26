# `xplace-core`

Shared publisher core for:

- private production `xplace`
- public reference `xplace-example`

Current extracted scope:

- request/callback constants
- PostgreSQL schema bootstrap
- PostgreSQL repository layer
- shared request/callback runtime helpers
- shared tool and preview registry builders
- shared subject-profile envelope builders
- shared Fastify workspace app factory
- shared workspace root-script runner

This stays below the publisher shells so `xplace` and `xplace-example` can diverge at the shell
layer without duplicating the core request/persistence contract.
