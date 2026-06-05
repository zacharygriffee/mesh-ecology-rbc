# Strategy

RBC v0 uses containment strategies that keep the first implementation small and
auditable.

## Containment Strategies

- Bounded resolution contexts.
- Domain-separated rules.
- Declarative rules.
- Deny-wins default.
- Hard vs soft constraints.
- Mandatory trace.
- Policy packs later.
- Unknown as first-class result.
- Mediation explicit.

## Current Strategy

The resolver accepts a basis, optional facts, rulebooks, overlays, grants,
denials, and explicit time. It builds a flat resolution context, matches simple
equality conditions, applies precedence, and returns an effective view with a
stable ref.

Adapters for causal history, storage, transport, receipts, policy packs, and
networked material belong outside this core until the pure semantics are
stable.

Policy-pack support in v1 remains pure data mapping. Adapter-shaped data is
prepared outside RBC and must resolve identically to equivalent plain resolver
input.
