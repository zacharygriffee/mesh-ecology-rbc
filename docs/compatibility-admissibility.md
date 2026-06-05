# Compatibility And Admissibility

In `effective_view.v1`, `compatibility` and `admissibility` remain scalar
fields.

Default values:

- `compatibility: "compatible"`
- `admissibility: "not_applicable"`

Callers may supply scalar values when compatibility or admissibility has
already been computed outside RBC. RBC preserves those values in the effective
view and includes them in the stable `effectiveViewRef`.

Structured compatibility and admissibility objects are deferred to v1.1. They
should be added only when operational proof shows scalar fields block
downstream use.
