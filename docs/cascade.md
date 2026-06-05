# Cascade

RBC resolves supplied material in a bounded cascade:

```text
parent rulebooks
-> local overlays
-> scoped grants
-> denials
-> proposed action basis
= effective rule view
```

Inheritance direction is parent material first, local overlays later. The first
implementation treats overlays as additional rule material entering the
cascade after parent rulebooks.

Trace entries include `sourceOrder` and cascade details for matched rule
material so the effective view can explain which parent or overlay source was
used.

## Precedence

```text
hard deny
  >
explicit deny
  >
requires review
  >
scoped allow
  >
unknown/default
```

Semantics:

- A hard denial always wins.
- A normal denial beats an allow.
- `requires_review` beats a plain allow.
- An allow only works if no denial or review gate applies.
- Malformed, unsupported, duplicate, or unresolved material prevents silent
  allow and produces mediation unless a denial already resolves the posture.
- Non-overridable parent constraints cannot be loosened by later overlay or
  grant material; attempts are surfaced as conflicts.
- If no rule applies, RBC returns `requires_mediation`.
- Unknown operations are never silently allowed.
