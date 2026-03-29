# Common Tenant Concerns

Use this section after choosing either:

- [host-mode](../host-mode/README.md)
- [full-mode](../full-mode/README.md)

These topics are shared across both adoption modes.

## Shared Areas

- publishing and manifest operations:
  - [../publishing/README.md](../publishing/README.md)
- guards and policy ownership:
  - [../guards/README.md](../guards/README.md)
- supported modules and lane boundaries:
  - [../modules/README.md](../modules/README.md)
- data seams and subject-profile inputs:
  - [../data-seams/README.md](../data-seams/README.md)
- integration consequences by surface:
  - [../integrations/README.md](../integrations/README.md)
- deeper ownership tradeoffs:
  - [../reference-options/README.md](../reference-options/README.md)

## Shared Practical Rule

Regardless of mode:

- keep manifests as the source of truth
- keep the browser runtime shared where possible
- keep raw gateway or tenant secrets out of the browser
- use the backend kit before dropping to low-level SDKs
- keep tenant-specific code focused on real local seams
