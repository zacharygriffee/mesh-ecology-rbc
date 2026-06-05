import publicPublishWithReviewReceipt from "./public-publish-with-review-receipt.js";

export default {
  ...publicPublishWithReviewReceipt,
  basis: {
    ...publicPublishWithReviewReceipt.basis,
    artifactRef: "artifact:private-note-001"
  },
  facts: {
    ...publicPublishWithReviewReceipt.facts,
    artifactClass: "private"
  }
};
