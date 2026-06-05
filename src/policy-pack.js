import { resolveEffectiveView } from "./resolve.js";

export function resolvePolicyPackView(input = {}) {
  const resolverInput = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const pack = resolverInput.pack && typeof resolverInput.pack === "object" && !Array.isArray(resolverInput.pack)
    ? resolverInput.pack
    : {};

  return resolveEffectiveView({
    basis: resolverInput.basis,
    facts: resolverInput.facts,
    artifact: resolverInput.artifact,
    surface: resolverInput.surface,
    role: resolverInput.role,
    device: resolverInput.device,
    observer: resolverInput.observer,
    branch: resolverInput.branch,
    envelope: resolverInput.envelope,
    context: resolverInput.context,
    rulebooks: pack.rulebooks,
    overlays: pack.overlays,
    grants: pack.grants,
    denials: pack.denials,
    receipts: resolverInput.receipts,
    time: resolverInput.time,
    compatibility: resolverInput.compatibility,
    admissibility: resolverInput.admissibility
  });
}
