import type { TriageInput, TriageResult } from "./diagnostic-triage.ts";

export const WEBSITE_DIAGNOSTIC_INTAKE_VERSION = "sekinfra.website-diagnostic-intake.v1" as const;
export const WEBSITE_DIAGNOSTIC_INTAKE_SOURCE = "SEKINFRA_WEBSITE" as const;

export type PreferredContactMethod = "EMAIL" | "PHONE";

export type DiagnosticIntakeContact = {
  fullName: string;
  businessEmail: string;
  businessPhone?: string;
  role?: string;
  preferredContactMethod: PreferredContactMethod;
};

export type DiagnosticIntakeOrganization = {
  displayName: string;
  website?: string;
};

export type WebsiteDiagnosticIntakeDraft = {
  organization: DiagnosticIntakeOrganization;
  contact: DiagnosticIntakeContact;
  contactRequested: boolean;
};

export type WebsiteDiagnosticIntakeCandidateV1 = {
  contractVersion: typeof WEBSITE_DIAGNOSTIC_INTAKE_VERSION;
  sourceSystem: typeof WEBSITE_DIAGNOSTIC_INTAKE_SOURCE;
  requestId: string;
  generatedAt: string;
  organization: DiagnosticIntakeOrganization;
  contact: DiagnosticIntakeContact;
  contactRequested: true;
  triage: {
    pressure: TriageInput["pressure"];
    scope: TriageInput["scope"];
    frequency: TriageInput["frequency"];
    impact: TriageInput["impact"];
    spread: TriageInput["spread"];
    desiredOutcome: string;
    recommendedRoute: TriageResult["route"];
    recommendedRouteLabel: string;
    routeReasons: string[];
  };
  authority: {
    diagnosisAuthorized: false;
    systemAccessAuthorized: false;
    implementationAuthorized: false;
    deploymentAuthorized: false;
  };
};

export type DiagnosticIntakeValidation = {
  valid: boolean;
  errors: Partial<Record<
    "organizationName" | "website" | "fullName" | "businessEmail" | "businessPhone" | "role" | "contactRequested",
    string
  >>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: string, max: number): string {
  return value.trim().replace(/\s+/g, " ").slice(0, max);
}

function cleanPhone(value: string): string {
  return value.trim().replace(/[^0-9+().\- x]/gi, "").slice(0, 30);
}

function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

export function normalizeDiagnosticIntakeDraft(draft: WebsiteDiagnosticIntakeDraft): WebsiteDiagnosticIntakeDraft {
  const website = normalizeWebsite(draft.organization.website || "");
  const phone = cleanPhone(draft.contact.businessPhone || "");
  const role = clean(draft.contact.role || "", 120);

  return {
    organization: {
      displayName: clean(draft.organization.displayName, 160),
      ...(website ? { website } : {}),
    },
    contact: {
      fullName: clean(draft.contact.fullName, 120),
      businessEmail: draft.contact.businessEmail.trim().toLowerCase().slice(0, 254),
      ...(phone ? { businessPhone: phone } : {}),
      ...(role ? { role } : {}),
      preferredContactMethod: draft.contact.preferredContactMethod,
    },
    contactRequested: draft.contactRequested === true,
  };
}

export function validateDiagnosticIntakeDraft(draft: WebsiteDiagnosticIntakeDraft): DiagnosticIntakeValidation {
  const normalized = normalizeDiagnosticIntakeDraft(draft);
  const errors: DiagnosticIntakeValidation["errors"] = {};

  if (normalized.organization.displayName.length < 2) {
    errors.organizationName = "Enter the organization or business name.";
  }

  if (draft.organization.website?.trim() && !normalized.organization.website) {
    errors.website = "Enter a valid business website.";
  }

  if (normalized.contact.fullName.length < 2) {
    errors.fullName = "Enter the person Sekinfra should contact.";
  }

  if (!EMAIL.test(normalized.contact.businessEmail)) {
    errors.businessEmail = "Enter a valid business email address.";
  }

  if (normalized.contact.businessPhone && normalized.contact.businessPhone.length < 7) {
    errors.businessPhone = "Enter a valid phone number or leave it blank.";
  }

  if (
    normalized.contact.preferredContactMethod === "PHONE" &&
    !normalized.contact.businessPhone
  ) {
    errors.businessPhone = "A phone number is required when phone is the preferred contact method.";
  }

  if (!normalized.contactRequested) {
    errors.contactRequested = "Confirm that you want Sekinfra to contact you about this diagnostic.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function buildWebsiteDiagnosticIntakeCandidate(
  draft: WebsiteDiagnosticIntakeDraft,
  triageInput: TriageInput,
  triageResult: TriageResult,
  meta: { requestId: string; generatedAt: string },
): WebsiteDiagnosticIntakeCandidateV1 {
  const normalized = normalizeDiagnosticIntakeDraft(draft);
  const validation = validateDiagnosticIntakeDraft(normalized);
  if (!validation.valid || !normalized.contactRequested) {
    throw new Error("Website diagnostic intake draft is not valid.");
  }

  return {
    contractVersion: WEBSITE_DIAGNOSTIC_INTAKE_VERSION,
    sourceSystem: WEBSITE_DIAGNOSTIC_INTAKE_SOURCE,
    requestId: meta.requestId,
    generatedAt: meta.generatedAt,
    organization: normalized.organization,
    contact: normalized.contact,
    contactRequested: true,
    triage: {
      pressure: triageInput.pressure,
      scope: triageInput.scope,
      frequency: triageInput.frequency,
      impact: triageInput.impact,
      spread: triageInput.spread,
      desiredOutcome: triageResult.desiredOutcome,
      recommendedRoute: triageResult.route,
      recommendedRouteLabel: triageResult.routeLabel,
      routeReasons: [...triageResult.reasons],
    },
    authority: {
      diagnosisAuthorized: false,
      systemAccessAuthorized: false,
      implementationAuthorized: false,
      deploymentAuthorized: false,
    },
  };
}

export function formatWebsiteDiagnosticIntakeCandidate(candidate: WebsiteDiagnosticIntakeCandidateV1): string {
  return [
    "SEKINFRA DIAGNOSTIC INTAKE CANDIDATE",
    `Contract: ${candidate.contractVersion}`,
    `Request: ${candidate.requestId}`,
    "",
    `Organization: ${candidate.organization.displayName}`,
    ...(candidate.organization.website ? [`Website: ${candidate.organization.website}`] : []),
    `Contact: ${candidate.contact.fullName}`,
    `Business email: ${candidate.contact.businessEmail}`,
    ...(candidate.contact.businessPhone ? [`Business phone: ${candidate.contact.businessPhone}`] : []),
    ...(candidate.contact.role ? [`Role: ${candidate.contact.role}`] : []),
    `Preferred contact: ${candidate.contact.preferredContactMethod}`,
    "",
    `Triage route: ${candidate.triage.recommendedRouteLabel}`,
    `Pressure: ${candidate.triage.pressure}`,
    `Desired outcome: ${candidate.triage.desiredOutcome}`,
    "",
    "Authority boundary:",
    "- No diagnosis authorized",
    "- No system access authorized",
    "- No implementation authorized",
    "- No deployment authorized",
    "",
    "This is a website intake candidate only. It is not a canonical Sekinfra Acquisition Opportunity or consulting engagement.",
  ].join("\n");
}
