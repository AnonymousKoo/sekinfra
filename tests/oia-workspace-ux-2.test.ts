import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { oiaDemoEngagement } from "../fixtures/oia-demo-engagement.ts";
import {
  ACCESS_EXPIRY_WARNING_DAYS,
  deriveWorkspaceQueues,
  getWorkspaceQueue,
  oiaWorkspaceFixture,
  WORKSPACE_QUEUE_MODEL,
  WORKSPACE_REFERENCE_TIME,
  workspaceQueues,
  type WorkspaceEngagementSummary,
} from "../fixtures/oia-workspace.ts";

const summary = (overrides: Partial<WorkspaceEngagementSummary> = {}): WorkspaceEngagementSummary => ({
  provenance: {
    kind: "SYNTHETIC_FIXTURE",
    authoritative: false,
    notice: "Synthetic test summary. Not authoritative.",
  },
  identity: {
    engagementId: "synthetic-test-engagement",
    organization: "Synthetic Test Company",
    label: "Synthetic test assessment",
  },
  stage: "Assess",
  ...overrides,
});

test("workspace fixture is synthetic and deterministic", () => {
  assert.equal(oiaWorkspaceFixture.provenance.kind, "SYNTHETIC_FIXTURE");
  assert.equal(oiaWorkspaceFixture.provenance.authoritative, false);
  assert.equal(oiaWorkspaceFixture.referenceTime, WORKSPACE_REFERENCE_TIME);
  assert.equal(WORKSPACE_REFERENCE_TIME, "2027-02-15T17:00:00Z");
  assert.ok(oiaWorkspaceFixture.engagements.every((item) => item.provenance.kind === "SYNTHETIC_FIXTURE" && item.provenance.authoritative === false));
  assert.deepEqual(
    deriveWorkspaceQueues(oiaWorkspaceFixture.engagements, WORKSPACE_REFERENCE_TIME),
    deriveWorkspaceQueues(oiaWorkspaceFixture.engagements, WORKSPACE_REFERENCE_TIME),
  );
});

test("Northline retains the existing identity and only detailed summary href", () => {
  const northline = oiaWorkspaceFixture.engagements.find((item) => item.identity.organization === "Northline Field Services");
  assert.ok(northline);
  assert.equal(northline.identity.engagementId, oiaDemoEngagement.identity.engagementId);
  assert.equal(northline.identity.label, oiaDemoEngagement.identity.label);
  assert.equal(northline.identity.detailHref, "/workspace/engagements/demo");
  assert.equal(oiaWorkspaceFixture.engagements.filter((item) => item.identity.detailHref).length, 1);
});

test("all operator prototype entry routes use the shared production guard", () => {
  const routeSources = [
    "../app/(prototype)/workspace/page.tsx",
    "../app/(prototype)/workspace/engagements/page.tsx",
    "../app/(prototype)/workspace/engagements/demo/page.tsx",
  ];

  for (const routeSource of routeSources) {
    const source = readFileSync(new URL(routeSource, import.meta.url), "utf8");
    assert.match(source, /isPrototypeRouteBlocked\((?:process\.env\.VERCEL_ENV)?\)/);
    assert.match(source, /notFound\(\)/);
  }

  const helperSource = readFileSync(new URL("../lib/prototype-route.ts", import.meta.url), "utf8");
  assert.match(helperSource, /process\.env\.VERCEL_ENV/);
  assert.match(helperSource, /vercelEnvironment === "production"/);
});

test("queue model is presentation only and contains no numerical score", () => {
  assert.equal(WORKSPACE_QUEUE_MODEL.kind, "PRESENTATION_PROJECTION");
  assert.equal(WORKSPACE_QUEUE_MODEL.authoritative, false);
  assert.match(WORKSPACE_QUEUE_MODEL.notice, /not authoritative/i);
  assert.ok(workspaceQueues.every((queue) => queue.presentationOnly && queue.authoritative === false));

  const scoreKeys: string[] = [];
  const inspect = (value: unknown): void => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (key.toLowerCase().includes("score") && typeof child === "number") scoreKeys.push(key);
      inspect(child);
    }
  };
  inspect(workspaceQueues);
  assert.deepEqual(scoreKeys, []);
});

test("client action requires the explicit synthetic presentation owner", () => {
  const lifecycleOnly = summary({ assessmentState: "FINDINGS_DELIVERED" });
  const explicitlyOwned = summary({
    identity: { ...lifecycleOnly.identity, engagementId: "synthetic-client-owned" },
    assessmentState: "IN_PROGRESS",
    presentationAttentionOwner: { owner: "CLIENT", presentationOnly: true, authoritative: false },
  });
  const queue = getWorkspaceQueue(deriveWorkspaceQueues([lifecycleOnly, explicitlyOwned]), "needs-client-action");
  assert.deepEqual(queue.engagements.map((item) => item.identity.engagementId), ["synthetic-client-owned"]);
});

test("access expiry includes only active access inside the deterministic warning window", () => {
  assert.equal(ACCESS_EXPIRY_WARNING_DAYS, 14);
  const fixtures = [
    summary({ identity: { engagementId: "active-inside", organization: "Inside Window", label: "Test" }, assessmentAccess: { state: "ACTIVE", expiresAt: "2027-03-01T17:00:00Z" } }),
    summary({ identity: { engagementId: "approved-inside", organization: "Approved Window", label: "Test" }, assessmentAccess: { state: "APPROVED", expiresAt: "2027-02-20T17:00:00Z" } }),
    summary({ identity: { engagementId: "active-outside", organization: "Outside Window", label: "Test" }, assessmentAccess: { state: "ACTIVE", expiresAt: "2027-03-01T17:00:01Z" } }),
    summary({ identity: { engagementId: "active-past", organization: "Past Window", label: "Test" }, assessmentAccess: { state: "ACTIVE", expiresAt: "2027-02-14T17:00:00Z" } }),
  ];
  const queue = getWorkspaceQueue(deriveWorkspaceQueues(fixtures), "access-expiring-soon");
  assert.deepEqual(queue.engagements.map((item) => item.identity.engagementId), ["active-inside"]);
});

test("ready for delivery uses only the real assessment state", () => {
  const ready = summary({ identity: { engagementId: "ready", organization: "Ready Company", label: "Test" }, assessmentState: "READY_FOR_DELIVERY" });
  const finalFindingsOnly = summary({ identity: { engagementId: "final-only", organization: "Final Company", label: "Test" }, assessmentState: "IN_PROGRESS", findingCounts: { FINAL: 3 } });
  const queue = getWorkspaceQueue(deriveWorkspaceQueues([ready, finalFindingsOnly]), "ready-for-delivery");
  assert.deepEqual(queue.engagements.map((item) => item.identity.engagementId), ["ready"]);
});

test("findings awaiting finalization requires a draft finding count", () => {
  const draft = summary({ identity: { engagementId: "draft", organization: "Draft Company", label: "Test" }, findingCounts: { DRAFT: 1 } });
  const finalOnly = summary({ identity: { engagementId: "final", organization: "Final Company", label: "Test" }, findingCounts: { DRAFT: 0, FINAL: 2 } });
  const queue = getWorkspaceQueue(deriveWorkspaceQueues([draft, finalOnly]), "findings-awaiting-finalization");
  assert.deepEqual(queue.engagements.map((item) => item.identity.engagementId), ["draft"]);
});

test("awaiting conversion requires delivered findings and the synthetic presentation condition", () => {
  const qualifying = summary({
    identity: { engagementId: "delivered-awaiting", organization: "Awaiting Company", label: "Test" },
    assessmentState: "FINDINGS_DELIVERED",
    latestDeliverySequence: 1,
    presentationConversionCondition: { condition: "AWAITING_CLIENT_DECISION", presentationOnly: true, authoritative: false },
  });
  const conditionOnly = summary({
    identity: { engagementId: "condition-only", organization: "Condition Company", label: "Test" },
    assessmentState: "IN_PROGRESS",
    presentationConversionCondition: { condition: "AWAITING_CLIENT_DECISION", presentationOnly: true, authoritative: false },
  });
  const technicalStateOnly = summary({
    identity: { engagementId: "state-only", organization: "State Company", label: "Test" },
    assessmentState: "FINDINGS_DELIVERED",
    conversionState: "PENDING_SEKINFRA",
  });
  const queue = getWorkspaceQueue(deriveWorkspaceQueues([qualifying, conditionOnly, technicalStateOnly]), "awaiting-conversion-decision");
  assert.deepEqual(queue.engagements.map((item) => item.identity.engagementId), ["delivered-awaiting"]);
  assert.match(queue.purpose, /synthetic presentation condition/i);
  assert.equal(queue.authoritative, false);
});
