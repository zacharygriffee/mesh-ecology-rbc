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
      resolvePolicyPackView
    } from 'mesh-ecology-rbc';

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

    globalThis.__rbcConsumerResult = {
      version: EFFECTIVE_VIEW_VERSION,
      directPosture: direct.posture,
      packedPosture: packed.posture,
      directRef: direct.effectiveViewRef,
      packedRef: packed.effectiveViewRef,
      traceLength: direct.trace.length,
      nonClaims: direct.nonClaims
    };
  `);

  await import(pathToFileURL(consumerFile).href);

  assert.equal(globalThis.__rbcConsumerResult.version, "effective_view.v1");
  assert.equal(globalThis.__rbcConsumerResult.directPosture, "allowed");
  assert.equal(globalThis.__rbcConsumerResult.packedPosture, "allowed");
  assert.equal(globalThis.__rbcConsumerResult.directRef, globalThis.__rbcConsumerResult.packedRef);
  assert.ok(globalThis.__rbcConsumerResult.traceLength > 0);
  assert.equal(globalThis.__rbcConsumerResult.nonClaims.authority, false);
  delete globalThis.__rbcConsumerResult;
});
