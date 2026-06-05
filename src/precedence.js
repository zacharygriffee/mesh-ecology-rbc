import { EFFECTS, POSTURES, SOURCE_TYPES, STRENGTHS } from "./constants.js";

export function choosePosture(matches) {
  const hardDenials = matches.denials.filter((source) => source.strength === STRENGTHS.HARD);
  if (hardDenials.length > 0) {
    return {
      posture: POSTURES.DENIED,
      winningSources: hardDenials,
      precedence: "hard_deny"
    };
  }

  const denials = matches.denials.filter((source) => source.strength !== STRENGTHS.HARD);
  if (denials.length > 0) {
    return {
      posture: POSTURES.DENIED,
      winningSources: denials,
      precedence: "explicit_deny"
    };
  }

  if (matches.conflicts.length > 0) {
    return {
      posture: POSTURES.REQUIRES_MEDIATION,
      winningSources: matches.conflicts,
      precedence: "conflict"
    };
  }

  if (matches.unresolved.length > 0) {
    return {
      posture: POSTURES.REQUIRES_MEDIATION,
      winningSources: matches.unresolved,
      precedence: "unresolved_material"
    };
  }

  if (matches.reviewRules.length > 0) {
    return {
      posture: POSTURES.REQUIRES_REVIEW,
      winningSources: matches.reviewRules,
      precedence: "requires_review"
    };
  }

  if (matches.provisionalRules.length > 0) {
    return {
      posture: POSTURES.PROVISIONAL,
      winningSources: matches.provisionalRules,
      precedence: "provisional"
    };
  }

  if (matches.allows.length > 0) {
    return {
      posture: POSTURES.ALLOWED,
      winningSources: matches.allows,
      precedence: "scoped_allow"
    };
  }

  return {
    posture: POSTURES.REQUIRES_MEDIATION,
    winningSources: [{
      id: "rbc.default.requires_mediation",
      sourceType: SOURCE_TYPES.DEFAULT,
      effect: EFFECTS.REQUIRES_REVIEW,
      reason: "No applicable rule, grant, or denial resolved this basis."
    }],
    precedence: "unknown_default"
  };
}
