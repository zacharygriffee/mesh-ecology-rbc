# Release Checklist

RBC release readiness is proven by executable operational proof, not by this
checklist alone.

## v1 Core Gate

- `npm test` passes.
- A temporary consumer can import `mesh-ecology-rbc` through the package export.
- A temporary consumer can import `mesh-ecology-rbc/conformance` through the
  package export.
- `npm run proof:list` prints named operational proof fixtures.
- `npm run proof:run` executes named operational proof fixtures.
- `rbc-proof run <fixture-id>` executes selected proof fixtures and fails
  closed on unknown names.
- Operational fixtures resolve expected postures with mandatory trace.
- Operational fixtures validate deterministic repeated refs, required receipts,
  unresolved source refs, and policy-history posture where applicable.
- Effective views emit `viewVersion: "effective_view.v1"`.
- Stable refs are deterministic for equivalent input.
- Input material is not mutated.
- Unknown, malformed, conflicting, expired, and unresolved material cannot
  silently allow an action.
- Non-claims remain false for execution, approval, authority, persistence,
  canonical truth, hidden clock, and network.

## Boundary Gate

- No TypeScript.
- No runtime dependencies.
- No server, daemon, database, scheduler, network, storage, identity, governance,
  Hypercore, Autobase, Corestore, DHT, hidden clock, or random ID behavior in
  core.

## Tagging Guidance

Do not tag v1 until the operator explicitly requests it. When requested, use:

```bash
npm test
npm run example
npm run proof:list
npm run proof:run
rbc-proof run edge-writer-admission-allowed
git tag -a v1.0.0 -m "mesh-ecology-rbc operational v1"
git push origin v1.0.0
```
