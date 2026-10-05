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
  assert.match(result.summary, /focused enough/i);
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
  assert.ok(result.reasons.some((reason) => /more than one team/i.test(reason)));
  assert.ok(result.reasons.some((reason) => /happens every week/i.test(reason)));
});

test("unclear spread across unknown systems routes to the OIA", () => {
  const result = deriveTriage({
    ...base,
    pressure: "visibility",
    scope: "unclear",
    frequency: "monthly",
    impact: "capacity",
    spread: "unknown",
  });
  assert.equal(result.route, "OPERATIONAL_INFRASTRUCTURE_ASSESSMENT");
  assert.ok(result.reasons.some((reason) => /where the problem starts and stops/i.test(reason)));
  assert.ok(result.reasons.some((reason) => /which systems and teams are involved/i.test(reason)));
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
  assert.match(result.desiredOutcome, /visible owner and next step/i);
});

test("problem review is explicit about browser-only triage and missing online intake", () => {
  const input = { ...base, desiredOutcome: "Routine work has a visible owner and exception path." };
  const result = deriveTriage(input);
  const brief = buildTriageBrief(input, result);
  assert.match(brief, /SEKINFRA PROBLEM REVIEW/);
  assert.match(brief, /first review, not a diagnosis/i);
  assert.match(brief, /does not send the information/i);
  assert.match(brief, /online intake is not connected yet/i);
  assert.match(brief, /Routine work has a visible owner/);
});
