import { SOURCE_TYPES } from "./constants.js";

export function collectRuleEntries(rulebooks = [], overlays = []) {
  return [
    ...collectRulebooks(rulebooks, "rulebook"),
    ...collectOverlays(overlays)
  ];
}

function collectRulebooks(rulebooks, cascadeType) {
  return rulebooks.flatMap((rulebook, rulebookIndex) => {
    const rules = Array.isArray(rulebook?.rules) ? rulebook.rules : [];

    return rules.map((rule, ruleIndex) => ({
      rule,
      rulebookRef: rulebook.id ?? `${cascadeType}:${rulebookIndex}`,
      sourceType: SOURCE_TYPES.RULE,
      cascadeType,
      cascadeIndex: rulebookIndex,
      ruleIndex
    }));
  });
}

function collectOverlays(overlays) {
  return overlays.flatMap((overlay, overlayIndex) => {
    if (overlay?.rules) {
      return collectRulebooks([overlay], "overlay").map((entry) => ({
        ...entry,
        overlayRef: overlay.id ?? `overlay:${overlayIndex}`,
        cascadeIndex: overlayIndex
      }));
    }

    return [{
      rule: overlay,
      rulebookRef: overlay?.id ?? `overlay:${overlayIndex}`,
      overlayRef: overlay?.id ?? `overlay:${overlayIndex}`,
      sourceType: SOURCE_TYPES.RULE,
      cascadeType: "overlay",
      cascadeIndex: overlayIndex,
      ruleIndex: 0
    }];
  });
}
