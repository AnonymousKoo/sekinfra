import test from "node:test";
import assert from "node:assert/strict";
import { buildTriageBrief, deriveTriage, type TriageInput } from "../lib/diagnostic-triage.ts";

const base: TriageInput = {
  pressure: "operations",
  scope: "contained",
  frequency: "isolated",
  impact: "friction",
  spread: "one",
};

test("contained rare issue routes to a Focused Diagnostic", () => {
  const result = deriveTriage(base);
  assert.equal(result.route, "FOCUSED_DIAGNOSTIC");
  assert.equal(result.routeLabel, "Focused Diagnostic");
  assert.match(result.summary, /contained/i);
});

test("cross-team recurring issue routes to the OIA", () => {
  const result = deriveTriage({
    ...base,
    scope: "cross-team",
    frequency: "weekly",
    impact: "delivery",
    spread: "few",
  });
  assert.equal(result.route, "OPERATIONAL_INFRASTRUCTURE_ASSESSMENT");
  assert.ok(result.reasons.some((reason) => /crosses team/i.test(reason)));
  assert.ok(result.reasons.some((reason) => /recurs/i.test(reason)));
});

test("unclear boundary across unknown systems routes to the OIA", () => {
  const result = deriveTriage({
    ...base,
    pressure: "visibility",
    scope: "unclear",
    frequency: "monthly",
    impact: "capacity",
    spread: "unknown",
  });
  assert.equal(result.route, "OPERATIONAL_INFRASTRUCTURE_ASSESSMENT");
  assert.ok(result.reasons.some((reason) => /boundary/i.test(reason)));
  assert.ok(result.reasons.some((reason) => /mapped/i.test(reason)));
});

test("daily material issue can escalate even when the initial path looks bounded", () => {
  const result = deriveTriage({
    ...base,
    scope: "multi-step",
    frequency: "daily",
    impact: "revenue",
    spread: "few",
  });
  assert.equal(result.route, "OPERATIONAL_INFRASTRUCTURE_ASSESSMENT");
});

test("desired outcome falls back to the selected profile outcome", () => {
  const result = deriveTriage({ ...base, pressure: "accountability", desiredOutcome: "   " });
  assert.match(result.desiredOutcome, /Ownership is explicit/);
});

test("triage brief is explicit about browser-only triage and the missing governed intake", () => {
  const input = { ...base, desiredOutcome: "Routine work has a visible owner and exception path." };
  const result = deriveTriage(input);
  const brief = buildTriageBrief(input, result);
  assert.match(brief, /SEKINFRA OPERATIONAL TRIAGE BRIEF/);
  assert.match(brief, /This is triage, not a diagnosis/);
  assert.match(brief, /No information in this brief is submitted/);
  assert.match(brief, /governed online intake is not connected yet/);
  assert.match(brief, /Routine work has a visible owner/);
});
