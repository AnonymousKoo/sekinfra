import test from "node:test";
import assert from "node:assert/strict";

import progressJson from "../fixtures/oia-engagement-progress-demo.json" with { type: "json" };
import {
  projectProgressTechnicalFacts,
  type OiaEngagementProgressView,
} from "../lib/oia-workspace-read-model.ts";

const progress = progressJson as unknown as OiaEngagementProgressView;

test("read model adapter projects only bounded workspace technical facts", () => {
  const facts = projectProgressTechnicalFacts(progress);
  assert.equal(facts.readModel.name, "OIAEngagementProgressView");
  assert.equal(facts.assessmentState, "FINDINGS_DELIVERED");
  assert.equal(facts.scopeState, "APPROVED");
  assert.equal(facts.assessmentAccess.state, "CLOSED");
  assert.equal(facts.assessmentAccess.usable, false);
  assert.equal(facts.inspectionCoverage?.BLOCKED, 1);
  assert.equal(facts.findingCounts.DRAFT, 1);
  assert.equal(facts.findingCounts.FINAL, 1);
  assert.equal(facts.latestDeliverySequence, 1);
  assert.equal(facts.readModel.nextRequiredAction.code, "RECORD_CONVERSION_DECISION");
});

test("read model adapter fails closed on implementation or deployment authority", () => {
  const unsafe = {
    ...progress,
    implementation_authorized: true,
  } as unknown as OiaEngagementProgressView;
  assert.throws(
    () => projectProgressTechnicalFacts(unsafe),
    /cannot grant implementation or deployment authority/i,
  );
});
