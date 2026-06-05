# Effective View

An effective view is the deterministic result returned by RBC for one bounded
basis.

```js
{
  effectiveViewRef: "rbc-view:<stable-hash>",
  posture: "requires_review",
  basis,
  effects: ["requires_review"],
  allowedBy: [],
  deniedBy: [],
  requiredReceipts: ["operator_review"],
  missingReceipts: ["operator_review"],
  satisfiedReceipts: [],
  sourceRefs: ["rule.public-publish-requires-review"],
  appliedRuleRefs: ["rule.public-publish-requires-review"],
  grantRefs: [],
  denialRefs: [],
  overlayRefs: [],
  conflicts: [],
  unresolved: [],
  compatibility: "compatible",
  admissibility: "not_applicable",
  mediation: {
    mode: "review",
    requiredReceipts: ["operator_review"]
  },
  nonClaims: {
    execution: false,
    approval: false,
    authority: false,
    persistence: false,
    canonicalTruth: false,
    hiddenClock: false,
    network: false
  },
  trace: []
}
```

## Postures

- `allowed`: at least one scoped allow applies and no denial or review gate
  beats it.
- `denied`: a hard or normal denial applies.
- `requires_review`: a matching rule requires review or receipts before the
  action can be treated as allowed.
- `provisional`: a matching rule allows only provisional posture.
- `unknown`: reserved for callers that need an explicit unknown posture.
- `requires_mediation`: no matching material resolved the basis, or ambiguity
  must be surfaced.
- `not_applicable`: reserved for contexts where RBC is intentionally not the
  deciding mechanism.

## Trace

Trace is mandatory. It names matched rules, grants, denials, expired grants,
receipt evidence, unresolved validation material, conflicts, and default
mediation decisions. A trace entry should be enough for another agent to see
why the posture was derived.

Trace entries include a `role` when relevant:

- `winner`: material that determined the final posture.
- `shadowed`: material that matched but lost to stricter material.
- `satisfied_gate`: a review gate satisfied by supplied receipt evidence.
- `evidence`: supplied receipt evidence.
- `unresolved`: malformed, expired, ambiguous, or conflicting material that
  prevents silent allow.

## Operational Proof

The effective view contract is considered successful only when executable tests
prove the resolver behavior. Documentation, semantic checks, and schema checks
are supporting gates, not proof of success by themselves.
