# Rule Shape

Rules are declarative data. They are not executable functions.

```js
{
  id: "rule.public-publish-requires-review",
  domain: "execution",
  effect: "requires_review",
  priority: 50,
  strength: "normal",
  when: {
    actionRef: "action:publish",
    surfaceClass: "public"
  },
  requires: {
    receipts: ["operator_review"]
  },
  reason: "Publishing to a public surface requires operator review."
}
```

Executable predicates are rejected as unresolved material. A rule with a
function in `when` does not match and cannot allow an action.

## Rulebook

A rulebook is a named collection of rules.

```js
{
  id: "rulebook.edge-basic",
  rules: []
}
```

## Overlay

An overlay is contextual rule material applied after parent rulebooks. In v0 an
overlay may be a rulebook-like object with `rules`, or a single rule object.

## Grant

A grant is a scoped allow. It may expire. RBC only evaluates expiration from
the supplied resolution time.

```js
{
  id: "grant.publish.public.web",
  effect: "allow",
  scope: {
    actionRef: "action:publish",
    surfaceRef: "surface:public-web"
  },
  expiresAt: null,
  reason: "Operator has scoped grant to publish to public web."
}
```

## Denial

A denial blocks a matching scope. A `strength` of `hard` beats all other
material.

```js
{
  id: "deny.private-artifact-public-surface",
  effect: "deny",
  scope: {
    actionRef: "action:publish",
    artifactClass: "private",
    surfaceClass: "public"
  },
  strength: "hard",
  reason: "Private artifacts cannot be published to public surfaces."
}
```

## Receipt Evidence

Receipts are caller-supplied evidence. RBC may decide that supplied evidence
satisfies a review gate, but RBC does not issue, approve, store, or own
receipts.

```js
{
  id: "receipt.operator-review.note-001",
  receiptRef: "operator_review",
  status: "valid",
  issuedAt: "2026-06-05T00:00:00.000Z"
}
```

Expired, revoked, invalid, superseded, or malformed receipt evidence is
traceable and does not satisfy required receipts.
