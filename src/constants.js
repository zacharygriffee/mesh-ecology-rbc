export const POSTURES = Object.freeze({
  ALLOWED: "allowed",
  DENIED: "denied",
  REQUIRES_REVIEW: "requires_review",
  PROVISIONAL: "provisional",
  UNKNOWN: "unknown",
  REQUIRES_MEDIATION: "requires_mediation",
  NOT_APPLICABLE: "not_applicable"
});

export const EFFECTS = Object.freeze({
  ALLOW: "allow",
  DENY: "deny",
  REQUIRES_REVIEW: "requires_review",
  PROVISIONAL: "provisional"
});

export const SOURCE_TYPES = Object.freeze({
  RULE: "rule",
  RULEBOOK: "rulebook",
  OVERLAY: "overlay",
  GRANT: "grant",
  DENIAL: "denial",
  RECEIPT: "receipt",
  VALIDATION: "validation",
  DEFAULT: "default"
});

export const STRENGTHS = Object.freeze({
  HARD: "hard",
  NORMAL: "normal"
});

export const DEFAULT_COMPATIBILITY = "compatible";
export const DEFAULT_ADMISSIBILITY = "not_applicable";

export const NON_CLAIMS = Object.freeze({
  execution: false,
  approval: false,
  authority: false,
  persistence: false,
  canonicalTruth: false,
  hiddenClock: false,
  network: false
});
