# Mock And Proto RBC Compatibility

This note maps common mock/proto RBC shapes into `mesh-ecology-rbc` v1 input.
It is guidance for callers preparing plain data. It is not an adapter, loader,
storage layer, or sibling-repo integration.

## Mapping

- `allowedActorIds` maps to role, observer, or actor facts plus allow/deny rule
  material.
- `allowedActionKinds` maps to `basis.actionRef` and rule `when.actionRef`.
- `allowedResolutionHorizons`, transitions, and mutation kinds map to explicit
  facts and declarative `when` patterns.
- Temporary local permission maps to a scoped `grant`.
- Local rejection maps to `denials` or deny-effect rules.
- Review or operator gates map to `requires_review` rules and caller-supplied
  receipt evidence.
- Proto-RBC non-claims map to RBC `nonClaims`, which remain false for
  execution, approval, authority, persistence, canonical truth, hidden clock,
  and network.

## Boundary

RBC does not evaluate executable proto-RBC functions. A caller must translate
mock/proto material into declarative rulebooks, overlays, grants, denials,
facts, receipts, basis, and explicit time before calling RBC.

Operational proof lives in tests. This document is not proof by itself.
