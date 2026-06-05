import base from "./layer-writer-base.js";

export default {
  ...base,
  evidenceRefs: ["grant.layer-writer-local-replica"],
  resolverInput: {
    ...base.resolverInput,
    receipts: []
  }
};
