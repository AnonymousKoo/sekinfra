import test from "node:test";
import assert from "node:assert/strict";
import {
  WEBSITE_DIAGNOSTIC_INTAKE_VERSION,
  buildWebsiteDiagnosticIntakeCandidate,
  formatWebsiteDiagnosticIntakeCandidate,
  normalizeDiagnosticIntakeDraft,
  validateDiagnosticIntakeDraft,
  type WebsiteDiagnosticIntakeDraft,
} from "../lib/diagnostic-intake.ts";
import { deriveTriage, type TriageInput } from "../lib/diagnostic-triage.ts";

const triageInput: TriageInput = {
  pressure: "operations",
  scope: "cross-team",
  frequency: "daily",
  impact: "delivery",
  spread: "many",
  desiredOutcome: "Critical work moves with visible ownership and exception handling.",
};

const draft: WebsiteDiagnosticIntakeDraft = {
  organization: {
    displayName: "  Fictional Field Services  ",
    website: "fictional.example",
  },
  contact: {
    fullName: "  Jordan Example ",
    businessEmail: "JORDAN@FICTIONAL.EXAMPLE",
    businessPhone: "(555) 010-1234",
    role: "  Operations Manager ",
    preferredContactMethod: "EMAIL",
  },
  contactRequested: true,
};

test("intake normalization minimizes and normalizes bounded fields", () => {
  const normalized = normalizeDiagnosticIntakeDraft(draft);
  assert.equal(normalized.organization.displayName, "Fictional Field Services");
  assert.equal(normalized.organization.website, "https://fictional.example/");
  assert.equal(normalized.contact.fullName, "Jordan Example");
  assert.equal(normalized.contact.businessEmail, "jordan@fictional.example");
  assert.equal(normalized.contact.role, "Operations Manager");
});

test("intake requires explicit contact request and a valid business email", () => {
  const invalid = validateDiagnosticIntakeDraft({
    ...draft,
    contact: { ...draft.contact, businessEmail: "not-an-email" },
    contactRequested: false,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.businessEmail);
  assert.ok(invalid.errors.contactRequested);
});

test("phone preference requires a phone number", () => {
  const invalid = validateDiagnosticIntakeDraft({
    ...draft,
    contact: {
      ...draft.contact,
      businessPhone: "",
      preferredContactMethod: "PHONE",
    },
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.businessPhone);
});

test("candidate preserves triage and grants no authority", () => {
  const triageResult = deriveTriage(triageInput);
  const candidate = buildWebsiteDiagnosticIntakeCandidate(draft, triageInput, triageResult, {
    requestId: "11111111-1111-4111-8111-111111111111",
    generatedAt: "2026-10-04T22:00:00.000Z",
  });

  assert.equal(candidate.contractVersion, WEBSITE_DIAGNOSTIC_INTAKE_VERSION);
  assert.equal(candidate.triage.recommendedRoute, "OPERATIONAL_INFRASTRUCTURE_ASSESSMENT");
  assert.deepEqual(candidate.authority, {
    diagnosisAuthorized: false,
    systemAccessAuthorized: false,
    implementationAuthorized: false,
    deploymentAuthorized: false,
  });
});

test("candidate is explicitly not a canonical acquisition opportunity", () => {
  const result = deriveTriage(triageInput);
  const candidate = buildWebsiteDiagnosticIntakeCandidate(draft, triageInput, result, {
    requestId: "22222222-2222-4222-8222-222222222222",
    generatedAt: "2026-10-04T22:00:00.000Z",
  });
  const text = formatWebsiteDiagnosticIntakeCandidate(candidate);
  assert.match(text, /website intake candidate only/i);
  assert.match(text, /not a canonical Sekinfra Acquisition Opportunity/i);
  assert.match(text, /No system access authorized/i);
});
