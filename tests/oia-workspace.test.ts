import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { clientDemoEngagement, oiaDemoEngagement, operatorDemoEngagement, projectClientEngagement, SYNTHETIC_DEMO_NOTICE } from "../fixtures/oia-demo-engagement.ts";
import { isPrototypeRouteBlocked } from "../lib/prototype-route.ts";

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

test("access approval is distinct from lifecycle closed access and grants no change authority", () => {
  assert.equal(oiaDemoEngagement.authority.assessmentAccessGrantApprovalMilestone.technicalState, "APPROVED");
  assert.equal(oiaDemoEngagement.authority.currentAssessmentAccessGrant.technicalState, "CLOSED");
  assert.notEqual(oiaDemoEngagement.authority.assessmentAccessGrantApprovalMilestone.label, oiaDemoEngagement.authority.currentAssessmentAccessGrant.label);
  assert.equal(oiaDemoEngagement.authority.implementationAuthority, false);
  assert.equal(oiaDemoEngagement.authority.deploymentAuthority, false);
  assert.equal(oiaDemoEngagement.assessment.technicalState, "FINDINGS_DELIVERED");
  assert.ok(oiaDemoEngagement.scope.prohibitedActions.includes("Modify system configuration"));
});

test("diagnostic agreement state matches the closed contract vocabulary", () => {
  const schema = JSON.parse(readFileSync(new URL("../consulting/contracts/schemas/v1/domain/diagnostic-agreement-authority.schema.json", import.meta.url), "utf8"));
  assert.deepEqual(schema.properties.status.enum, ["VERIFIED_ACTIVE", "EXPIRED", "REVOKED", "SUPERSEDED"]);
  assert.equal(oiaDemoEngagement.authority.diagnosticAgreement.technicalState, "VERIFIED_ACTIVE");
  assert.ok(schema.properties.status.enum.includes(oiaDemoEngagement.authority.diagnosticAgreement.technicalState));
});

test("prototype routes are blocked only in the Vercel production environment", () => {
  assert.equal(isPrototypeRouteBlocked("production"), true);
  assert.equal(isPrototypeRouteBlocked("preview"), false);
  assert.equal(isPrototypeRouteBlocked("development"), false);
  assert.equal(isPrototypeRouteBlocked(undefined), false);
});

test("priority remains categorical with no numerical score", () => {
  const allowed = new Set(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
  for (const finding of oiaDemoEngagement.findings) {
    assert.ok(allowed.has(finding.priority));
    assert.equal("score" in finding, false);
    assert.equal("priorityScore" in finding, false);
  }
});
