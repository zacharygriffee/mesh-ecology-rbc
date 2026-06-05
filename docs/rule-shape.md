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
