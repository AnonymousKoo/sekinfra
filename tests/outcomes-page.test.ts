import test from "node:test";
import assert from "node:assert/strict";
import {
  allOutcomeLabels,
  illustrativeOutcome,
  orderedOutcomeFamilies,
  outcomeFamilies,
  transformations,
} from "../lib/outcomes.ts";

const expectedOutcomes = [
  "Lead response",
  "Customer follow up",
  "Accountability",
  "Operational alerts",
  "Workforce reliability",
  "Workflow visibility",
  "Reporting",
  "Scheduling and coordination",
  "Administrative reduction",
  "Marketing operations",
];

test("outcome catalog is complete and unique", () => {
  assert.deepEqual(allOutcomeLabels(), expectedOutcomes);
  assert.equal(new Set(allOutcomeLabels()).size, expectedOutcomes.length);
  assert.equal(outcomeFamilies.length, 4);
});

test("personalization moves only the relevant family to the front", () => {
  assert.equal(orderedOutcomeFamilies("leads")[0].id, "response");
  assert.equal(orderedOutcomeFamilies("customer-follow-up")[0].id, "response");
  assert.equal(orderedOutcomeFamilies("accountability")[0].id, "control");
  assert.equal(orderedOutcomeFamilies("visibility")[0].id, "visibility");
  assert.equal(orderedOutcomeFamilies("operations")[0].id, "capacity");
  for (const pressure of ["leads", "operations", "accountability", "visibility", "customer-follow-up"] as const) {
    assert.deepEqual(new Set(orderedOutcomeFamilies(pressure).map((family) => family.id)), new Set(outcomeFamilies.map((family) => family.id)));
  }
});

test("illustrative scenario stays explicitly synthetic", () => {
  assert.match(illustrativeOutcome.disclosure, /Synthetic example/i);
  assert.match(illustrativeOutcome.disclosure, /not a client case study/i);
  assert.equal(illustrativeOutcome.steps.length, 5);
  assert.equal(illustrativeOutcome.steps.at(-1)?.[0], "Desired state");
});

test("outcome copy avoids fabricated performance claims", () => {
  const copy = JSON.stringify({ outcomeFamilies, transformations, illustrativeOutcome });
  assert.doesNotMatch(copy, /\bROI\b/i);
  assert.doesNotMatch(copy, /\d+%/);
  assert.doesNotMatch(copy, /hours saved/i);
  assert.doesNotMatch(copy, /revenue increase/i);
});

test("transformation field covers distinct operating conditions", () => {
  assert.deepEqual(transformations.map((item) => item.label), ["Response", "Accountability", "Visibility", "Coordination"]);
  for (const item of transformations) {
    assert.ok(item.before.length > 10);
    assert.ok(item.controlled.length > 10);
  }
});
