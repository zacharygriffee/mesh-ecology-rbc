import {
  DEFAULT_ADMISSIBILITY,
  DEFAULT_COMPATIBILITY,
  EFFECTS,
  SOURCE_TYPES,
  STRENGTHS
} from "./constants.js";
import { collectRuleEntries } from "./cascade.js";
import { stableHash, cloneStable } from "./hash.js";
import { buildResolutionContext, matchesScope, matchesWhen } from "./match.js";
import { choosePosture } from "./precedence.js";
import { omitUndefined, traceEntry } from "./trace.js";

export function resolveEffectiveView(input = {}) {
  const basis = cloneStable(input.basis ?? {});
  const context = buildResolutionContext(input);
  const time = input.time ?? basis.timeRef ?? null;

  const ruleSources = collectRuleEntries(input.rulebooks ?? [], input.overlays ?? [])
    .filter((entry) => matchesWhen(entry.rule?.when ?? {}, context))
    .map(ruleSource);

  const denialSources = (input.denials ?? [])
    .filter((denial) => matchesScope(denial.scope ?? {}, context))
    .map((denial) => materialSource(denial, SOURCE_TYPES.DENIAL));

  const grantEvaluations = (input.grants ?? [])
    .filter((grant) => matchesScope(grant.scope ?? {}, context))
    .map((grant) => evaluateGrant(grant, time));

  const activeGrantSources = grantEvaluations
    .filter((grant) => grant.status === "active")
    .map((grant) => materialSource(grant.material, SOURCE_TYPES.GRANT));

  const matches = {
    denials: [
      ...ruleSources.filter(isDeny),
      ...denialSources
    ],
    reviewRules: ruleSources.filter((source) => source.effect === EFFECTS.REQUIRES_REVIEW),
    provisionalRules: ruleSources.filter((source) => source.effect === EFFECTS.PROVISIONAL),
    allows: [
      ...ruleSources.filter((source) => source.effect === EFFECTS.ALLOW),
      ...activeGrantSources
    ]
  };

  const decision = choosePosture(matches);
  const trace = [
    ...ruleSources.map(sourceTrace),
    ...denialSources.map(sourceTrace),
    ...grantEvaluations.map(grantTrace),
    ...defaultTrace(decision, ruleSources, denialSources, grantEvaluations)
  ];

  const deniedBy = matches.denials.map((source) => source.id);
  const allowedBy = matches.allows.map((source) => source.id);
  const requiredReceipts = unique(matches.reviewRules.flatMap((source) => source.receipts));
  const effects = unique([
    ...ruleSources.map((source) => source.effect),
    ...denialSources.map((source) => source.effect),
    ...activeGrantSources.map((source) => source.effect)
  ]);

  const viewWithoutRef = {
    posture: decision.posture,
    basis,
    effects,
    allowedBy,
    deniedBy,
    requiredReceipts,
    compatibility: input.compatibility ?? DEFAULT_COMPATIBILITY,
    admissibility: input.admissibility ?? DEFAULT_ADMISSIBILITY,
    mediation: mediationFor(decision, requiredReceipts),
    trace
  };

  return {
    effectiveViewRef: `rbc-view:${stableHash(viewWithoutRef)}`,
    ...viewWithoutRef
  };
}

function ruleSource(entry) {
  const rule = entry.rule ?? {};
  return {
    id: rule.id ?? `${entry.rulebookRef}:rule:${entry.ruleIndex}`,
    sourceType: SOURCE_TYPES.RULE,
    rulebookRef: entry.rulebookRef,
    overlayRef: entry.overlayRef,
    effect: rule.effect,
    strength: rule.strength ?? STRENGTHS.NORMAL,
    priority: rule.priority ?? 0,
    receipts: rule.requires?.receipts ?? [],
    reason: rule.reason ?? "Rule matched the resolution context."
  };
}

function materialSource(material, sourceType) {
  return {
    id: material.id,
    sourceType,
    effect: material.effect,
    strength: material.strength ?? STRENGTHS.NORMAL,
    receipts: material.requires?.receipts ?? [],
    reason: material.reason ?? `${sourceType} matched the resolution context.`
  };
}

function evaluateGrant(grant, time) {
  if (grant.expiresAt && !time) {
    return {
      material: grant,
      status: "unresolved_time",
      reason: "Grant has expiresAt, but no resolution time was provided."
    };
  }

  if (grant.expiresAt && !validTimePair(grant.expiresAt, time)) {
    return {
      material: grant,
      status: "unresolved_time",
      reason: "Grant expiration could not be compared to the supplied resolution time."
    };
  }

  if (grant.expiresAt && Date.parse(grant.expiresAt) <= Date.parse(time)) {
    return {
      material: grant,
      status: "expired",
      reason: "Grant expired before or at the resolution time."
    };
  }

  return {
    material: grant,
    status: "active",
    reason: grant.reason
  };
}

function isDeny(source) {
  return source.effect === EFFECTS.DENY;
}

function sourceTrace(source) {
  return traceEntry({
    sourceRef: source.id,
    sourceType: source.sourceType,
    effect: source.effect,
    reason: source.reason,
    details: source.rulebookRef || source.overlayRef
      ? omitUndefined({
          rulebookRef: source.rulebookRef,
          overlayRef: source.overlayRef,
          strength: source.strength,
          priority: source.priority
        })
      : {
          strength: source.strength
        }
  });
}

function validTimePair(expiresAt, time) {
  return Number.isFinite(Date.parse(expiresAt)) && Number.isFinite(Date.parse(time));
}

function grantTrace(evaluation) {
  return traceEntry({
    sourceRef: evaluation.material.id,
    sourceType: SOURCE_TYPES.GRANT,
    effect: evaluation.material.effect,
    status: evaluation.status,
    reason: evaluation.reason ?? evaluation.material.reason
  });
}

function defaultTrace(decision, ruleSources, denialSources, grantEvaluations) {
  if (
    decision.precedence !== "unknown_default" ||
    ruleSources.length > 0 ||
    denialSources.length > 0 ||
    grantEvaluations.some((grant) => grant.status === "active")
  ) {
    return [];
  }

  return decision.winningSources.map((source) => traceEntry({
    sourceRef: source.id,
    sourceType: source.sourceType,
    effect: source.effect,
    posture: decision.posture,
    reason: source.reason,
    precedence: decision.precedence
  }));
}

function mediationFor(decision, requiredReceipts) {
  if (decision.posture === "requires_review") {
    return {
      mode: "review",
      requiredReceipts
    };
  }

  if (decision.posture === "requires_mediation") {
    return {
      mode: "mediation",
      reason: "Resolution did not produce an allow, deny, or review gate."
    };
  }

  return null;
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null))];
}
