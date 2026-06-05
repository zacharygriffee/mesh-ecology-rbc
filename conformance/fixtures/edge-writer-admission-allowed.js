import base from "./edge-writer-admission-base.js";

export default {
  ...base,
  receipts: [{
    id: "receipt.edge-writer-review.writer-001",
    receiptRef: "edge_writer_review",
    status: "valid",
    issuedAt: "2026-06-05T00:00:00.000Z",
    reason: "Edge supplied review evidence for local writer admission."
  }]
};
