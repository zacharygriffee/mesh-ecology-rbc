import allowed from "./edge-writer-admission-allowed.js";

export default {
  ...allowed,
  basis: {
    ...allowed.basis,
    deviceRef: "device:untrusted-terminal"
  },
  facts: {
    ...allowed.facts,
    deviceTrust: "untrusted"
  }
};
