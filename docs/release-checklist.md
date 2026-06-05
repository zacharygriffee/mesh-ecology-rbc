# Release Checklist

RBC release readiness is proven by executable operational proof, not by this
checklist alone.

## v1 Core Gate

- `npm test` passes.
- A temporary consumer can import `mesh-ecology-rbc` through the package export.
- Operational fixtures resolve expected postures with mandatory trace.
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
