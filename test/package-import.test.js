import assert from "node:assert/strict";
import { mkdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

test("temporary consumer imports package export and resolves effective view", async () => {
  const root = path.resolve(".");
  const consumerDir = path.join(tmpdir(), `mesh-ecology-rbc-consumer-${process.pid}`);
  const nodeModulesDir = path.join(consumerDir, "node_modules");
  const packageLink = path.join(nodeModulesDir, "mesh-ecology-rbc");
  const consumerFile = path.join(consumerDir, "consumer.mjs");

  await mkdir(nodeModulesDir, { recursive: true });
  await symlink(root, packageLink, "dir");
  await writeFile(consumerFile, `
    import {
      EFFECTIVE_VIEW_VERSION,
      resolveEffectiveView,
      resolveReportOnlyEvaluationReceipt,
      resolvePolicyPackView
    } from 'mesh-ecology-rbc';
    import {
      createReportOnlyReceiptProofTranscript,
      listOperationalProofFixtures,
      listReportOnlyReceiptProofFixtures,
      runReportOnlyReceiptProofSuite,
      runOperationalProofSuite
    } from 'mesh-ecology-rbc/conformance';

    const input = {
      basis: {
        actionRef: 'action:publish',
        surfaceRef: 'surface:public-web',
        timeRef: '2026-06-05T00:00:00.000Z'
      },
      grants: [{
        id: 'grant.consumer-publish',
        effect: 'allow',
        scope: {
          actionRef: 'action:publish',
          surfaceRef: 'surface:public-web'
        }
      }],
      time: '2026-06-05T00:00:00.000Z'
    };

    const direct = resolveEffectiveView(input);
    const packed = resolvePolicyPackView({
      basis: input.basis,
      pack: {
        id: 'policy-pack.consumer',
        version: '0.1.0',
        grants: input.grants
      },
      time: input.time
    });
    const fixtureIds = listOperationalProofFixtures();
    const selectedProof = runOperationalProofSuite(['edge-writer-admission-allowed']);
    const receiptFixtureIds = listReportOnlyReceiptProofFixtures();
    const selectedReceiptProof = runReportOnlyReceiptProofSuite(['layer-writer-authorized']);
    const selectedReceiptTranscript = createReportOnlyReceiptProofTranscript(['layer-writer-authorized']);
    const reportOnlyReceipt = resolveReportOnlyEvaluationReceipt({
      rulebookRef: 'rulebook.consumer',
      capabilityRef: 'capability:consumer-publish',
      scope: input.basis,
      resolverInput: input
    });

    globalThis.__rbcConsumerResult = {
      version: EFFECTIVE_VIEW_VERSION,
      directPosture: direct.posture,
      packedPosture: packed.posture,
      directRef: direct.effectiveViewRef,
      packedRef: packed.effectiveViewRef,
      fixtureCount: fixtureIds.length,
      selectedProof,
      receiptFixtureCount: receiptFixtureIds.length,
      selectedReceiptProof,
      selectedReceiptTranscript,
      reportOnlyDecision: reportOnlyReceipt.receipt.decision,
      reportOnlyHashMatches: reportOnlyReceipt.readback.hashMatches,
      reportOnlyGovernedSeamClaim: reportOnlyReceipt.receipt.nonClaims.governedSeam,
      traceLength: direct.trace.length,
      nonClaims: direct.nonClaims
    };
  `);

  await import(pathToFileURL(consumerFile).href);

  assert.equal(globalThis.__rbcConsumerResult.version, "effective_view.v1");
  assert.equal(globalThis.__rbcConsumerResult.directPosture, "allowed");
  assert.equal(globalThis.__rbcConsumerResult.packedPosture, "allowed");
  assert.equal(globalThis.__rbcConsumerResult.directRef, globalThis.__rbcConsumerResult.packedRef);
  assert.equal(globalThis.__rbcConsumerResult.fixtureCount, 11);
  assert.deepEqual(globalThis.__rbcConsumerResult.selectedProof, [{
    id: "edge-writer-admission-allowed",
    posture: "allowed",
    effectiveViewRef: "rbc-view:401ba7d7c528585b5bafd732704b39d81ae08a365c4af8bea7a5b338fe680bd3"
  }]);
  assert.equal(globalThis.__rbcConsumerResult.receiptFixtureCount, 4);
  assert.equal(globalThis.__rbcConsumerResult.selectedReceiptProof[0].id, "layer-writer-authorized");
  assert.equal(globalThis.__rbcConsumerResult.selectedReceiptProof[0].decision, "allowed");
  assert.match(
    globalThis.__rbcConsumerResult.selectedReceiptProof[0].receiptRef,
    /^rbc-evaluation-receipt:[a-f0-9]{16}$/
  );
  assert.equal(
    globalThis.__rbcConsumerResult.selectedReceiptTranscript.transcriptVersion,
    "rbc_report_only_receipt_proof_transcript.v1"
  );
  assert.deepEqual(globalThis.__rbcConsumerResult.selectedReceiptTranscript.fixtureIds, ["layer-writer-authorized"]);
  assert.match(
    globalThis.__rbcConsumerResult.selectedReceiptTranscript.transcriptHash,
    /^sha256:[a-f0-9]{64}$/
  );
  assert.equal(globalThis.__rbcConsumerResult.selectedReceiptTranscript.results[0].readbackVerified, true);
  assert.equal(globalThis.__rbcConsumerResult.selectedReceiptTranscript.results[0].nonClaims.governedSeam, false);
  assert.equal(globalThis.__rbcConsumerResult.reportOnlyDecision, "allowed");
  assert.equal(globalThis.__rbcConsumerResult.reportOnlyHashMatches, true);
  assert.equal(globalThis.__rbcConsumerResult.reportOnlyGovernedSeamClaim, false);
  assert.ok(globalThis.__rbcConsumerResult.traceLength > 0);
  assert.equal(globalThis.__rbcConsumerResult.nonClaims.authority, false);
  delete globalThis.__rbcConsumerResult;
});
