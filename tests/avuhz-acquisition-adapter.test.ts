import test from "node:test";
import assert from "node:assert/strict";

import {
  buildWebsiteDiagnosticIntakeCandidate,
  type WebsiteDiagnosticIntakeCandidateV1,
  type WebsiteDiagnosticIntakeDraft,
} from "../lib/diagnostic-intake.ts";
import { deriveTriage, type TriageInput } from "../lib/diagnostic-triage.ts";
import { toAvuhzAcquisitionIntake } from "../lib/server/avuhz-acquisition-adapter.ts";
import { GET, POST } from "../app/api/diagnostic-intake/route.ts";

const input: TriageInput = {
  pressure: "operations",
  scope: "cross-team",
  frequency: "daily",
  impact: "delivery",
  spread: "many",
};
const draft: WebsiteDiagnosticIntakeDraft = {
  organization: { displayName: "Fictional Field Services", website: "fictional.example" },
  contact: {
    fullName: "Example Operator",
    businessEmail: "OPERATOR@FICTIONAL.EXAMPLE",
    businessPhone: "(555) 010-1234",
    role: "Operations Manager",
    preferredContactMethod: "EMAIL",
  },
  contactRequested: true,
};

function candidate(): WebsiteDiagnosticIntakeCandidateV1 {
  return buildWebsiteDiagnosticIntakeCandidate(
    draft, input, deriveTriage(input),
    { requestId: "a4730000-0000-4000-8000-000000000021",
      generatedAt: "2026-10-10T21:16:00.000Z" },
  );
}

function denial(value: unknown): void {
  assert.throws(
    () => toAvuhzAcquisitionIntake(value),
    (error: unknown) => error instanceof Error &&
      error.message === "invalid_website_acquisition_candidate",
  );
}

test("real Sekinfra website candidate maps to the exact shared Avuhz unqualified intake shape", () => {
  const out = toAvuhzAcquisitionIntake(candidate());
  assert.deepEqual(Object.keys(out).sort(), [
    "external_request_id", "source_system", "route_reference",
    "business_name", "contact_name", "contact_email", "contact_phone",
    "preferred_contact_method", "contact_requested", "diagnostic_summary",
  ].sort());
  assert.equal(out.external_request_id, "a4730000-0000-4000-8000-000000000021");
  assert.equal(out.source_system, "sekinfra.website");
  assert.equal(out.route_reference, "diagnostic.oia");
  assert.equal(out.contact_email, "operator@fictional.example");
  assert.equal(out.contact_phone, "(555) 010-1234");
  assert.equal(out.contact_requested, true);
  assert.match(out.diagnostic_summary, /path=OPERATIONAL_INFRASTRUCTURE_ASSESSMENT/);
  assert.ok(out.diagnostic_summary.length <= 500);
  assert.doesNotMatch(JSON.stringify(out), /tenant_id|organization_id|authority|diagnosisAuthorized|access_token|handoff_version/);
  assert.doesNotMatch(JSON.stringify(out), /Fictional\.example\/|Operations Manager/);
});

test("deterministically maps a focused diagnostic and preserves idempotency reference", () => {
  const focused: TriageInput = {
    pressure: "leads", scope: "contained", frequency: "isolated",
    impact: "friction", spread: "one",
  };
  const original = buildWebsiteDiagnosticIntakeCandidate(
    { ...draft, contact: { ...draft.contact,
      preferredContactMethod: "EMAIL", businessPhone: undefined } },
    focused, deriveTriage(focused), {
      requestId: "a4730000-0000-4000-8000-000000000022",
      generatedAt: "2026-10-10T21:16:00.000Z",
    },
  );
  const first = toAvuhzAcquisitionIntake(original);
  const replay = toAvuhzAcquisitionIntake(original);
  assert.equal(first.route_reference, "diagnostic.focused");
  assert.equal(first.contact_phone, null);
  assert.deepEqual(first, replay);
  assert.equal(first.external_request_id, original.requestId);
});

test("browser cannot supply tenant or organization authority, even with otherwise valid consent", () => {
  for (const injected of [
    { ...candidate(), tenant_id: "an-attacker-tenant" },
    { ...candidate(), organization_id: "an-attacker-org" },
    { ...candidate(), caller_type: "INTERNAL_SERVICE" },
    { ...candidate(), authority: { ...candidate().authority, implementationAuthorized: true } },
    { ...candidate(), authority: { ...candidate().authority, paywallBypassed: true } },
    { ...candidate(), contactRequested: false },
    { ...candidate(), organization: { ...candidate().organization, tenant_id: "attacker" } },
    { ...candidate(), contact: { ...candidate().contact, role: "Operator", access_token: "injected" } },
  ]) {
    denial(injected);
  }
});

test("tampering with client triage result is rejected rather than assigning server authority", () => {
  for (const tampered of [
    { ...candidate(), triage: { ...candidate().triage, recommendedRoute: "FOCUSED_DIAGNOSTIC" } },
    { ...candidate(), triage: { ...candidate().triage, scope: "unknown-scope" } },
    { ...candidate(), triage: { ...candidate().triage, pressure: "unknown" } },
    { ...candidate(), triage: { ...candidate().triage, routeReasons: ["admin override"] } },
    { ...candidate(), triage: { ...candidate().triage, diagnosisAuthorized: true } },
  ]) {
    denial(tampered);
  }
});

test("invalid PII and credential-shaped strings fail closed, with redacted fixed errors", () => {
  for (const data of [
    { ...candidate(), requestId: "../forged-id" },
    { ...candidate(), generatedAt: "not-a-timestamp" },
    { ...candidate(), contact: { ...candidate().contact, businessEmail: "not-an-email" } },
    { ...candidate(), contact: { ...candidate().contact, fullName: "Private\nInjected" } },
    { ...candidate(), contact: { ...candidate().contact, businessPhone: "555x1234" } },
    { ...candidate(), contact: { ...candidate().contact,
      preferredContactMethod: "PHONE", businessPhone: undefined } },
    { ...candidate(), contact: { ...candidate().contact,
      businessEmail: "sensitive@example.invalid", secret: "fictional-credential" } },
    null, [], "not-an-object",
  ]) {
    denial(data);
  }
});

test("maps only safe closed-vocabulary summary; free-text goal and role are never persisted", () => {
  const value = candidate();
  const inputWithFreeText = {
    ...value,
    triage: {
      ...value.triage,
      desiredOutcome: "Bearer fictional-secret-not-for-persistence",
    },
    contact: { ...value.contact, role: "Sensitive fictional job title" },
  };
  const out = toAvuhzAcquisitionIntake(inputWithFreeText);
  assert.doesNotMatch(out.diagnostic_summary, /Bearer|fictional-secret|Sensitive/);
  assert.ok(out.diagnostic_summary.length < 500);
});

test("public website POST stays closed; this adapter is not a new endpoint or credential path", async () => {
  const status = await GET();
  assert.equal((await status.json()).acceptsRealProspectData, false);
  const post = await POST();
  assert.equal(post.status, 503);
  assert.equal((await post.json()).error, "INTAKE_NOT_CONNECTED");
});
