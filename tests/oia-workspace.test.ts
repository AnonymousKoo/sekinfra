import test from "node:test";
import assert from "node:assert/strict";
import { clientDemoEngagement, oiaDemoEngagement, operatorDemoEngagement, projectClientEngagement, SYNTHETIC_DEMO_NOTICE } from "../fixtures/oia-demo-engagement.ts";

test("fixture is explicitly synthetic and internally coherent", () => {
  assert.equal(oiaDemoEngagement.provenance.authoritative, false);
  assert.equal(oiaDemoEngagement.provenance.kind, "SYNTHETIC_FIXTURE");
  assert.equal(oiaDemoEngagement.provenance.notice, SYNTHETIC_DEMO_NOTICE);
  assert.equal(SYNTHETIC_DEMO_NOTICE, "Synthetic demonstration. Not an active engagement.");
  assert.equal(operatorDemoEngagement.provenance.notice, SYNTHETIC_DEMO_NOTICE);
  assert.equal(clientDemoEngagement.provenance.notice, SYNTHETIC_DEMO_NOTICE);
  assert.ok(oiaDemoEngagement.assessment.inspections.some((item) => item.coverage === "BLOCKED"));
  assert.ok(oiaDemoEngagement.assessment.inspections.some((item) => item.coverage === "PARTIALLY_EVIDENCED"));
  assert.equal(oiaDemoEngagement.deliveries[0].label, "Delivery 01");
});

test("operator and client projections share one engagement identity", () => {
  assert.strictEqual(operatorDemoEngagement.identity, oiaDemoEngagement.identity);
  assert.strictEqual(clientDemoEngagement.identity, oiaDemoEngagement.identity);
  assert.equal(operatorDemoEngagement.identity.engagementId, clientDemoEngagement.identity.engagementId);
});

test("client projection excludes restricted analysis and evidence references", () => {
  const client = projectClientEngagement(oiaDemoEngagement);
  const clientJson = JSON.stringify(client);
  assert.equal("observations" in client, false);
  assert.equal("rootCauses" in client, false);
  assert.equal("evidence" in client, false);
  assert.equal("assessorNotes" in client, false);
  assert.equal(clientJson.includes("secureObjectReference"), false);
  assert.equal(clientJson.includes("REDACTED_SYNTHETIC_REFERENCE"), false);
  assert.equal(clientJson.includes(oiaDemoEngagement.restrictedAnalysis.observations[0].condition), false);
  assert.equal(clientJson.includes(oiaDemoEngagement.restrictedAnalysis.rootCauses[0].statement), false);
});

test("client projection includes only final findings preserved in a delivery", () => {
  const client = projectClientEngagement(oiaDemoEngagement);
  assert.equal(client.deliveredFindings.length, 1);
  assert.ok(client.deliveredFindings.every((finding) => finding.state === "FINAL" && finding.delivered));
  assert.equal(client.deliveredFindings[0].id, "finding-assignment");
  assert.equal(JSON.stringify(client).includes("Reporting visibility requires further review"), false);
});

test("access approval is distinct from active access and grants no change authority", () => {
  assert.equal(oiaDemoEngagement.authority.accessApproval.technicalState, "APPROVED");
  assert.equal(oiaDemoEngagement.authority.assessmentAccess.technicalState, "ACTIVE");
  assert.notEqual(oiaDemoEngagement.authority.accessApproval.label, oiaDemoEngagement.authority.assessmentAccess.label);
  assert.equal(oiaDemoEngagement.authority.implementationAuthority, false);
  assert.equal(oiaDemoEngagement.authority.deploymentAuthority, false);
  assert.ok(oiaDemoEngagement.scope.prohibitedActions.includes("Modify system configuration"));
});

test("priority remains categorical with no numerical score", () => {
  const allowed = new Set(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
  for (const finding of oiaDemoEngagement.findings) {
    assert.ok(allowed.has(finding.priority));
    assert.equal("score" in finding, false);
    assert.equal("priorityScore" in finding, false);
  }
});
