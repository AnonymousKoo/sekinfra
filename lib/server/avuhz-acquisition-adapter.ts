/**
 * Sekinfra WEBSITE -> shared Avuhz unqualified acquisition-intake content.
 *
 * This adapter is for a FUTURE SERVER-SIDE acquisition ingress only. It makes
 * no network call and must not be imported into a client component.
 *
 * A browser candidate is untrusted: it supplies no tenant, organization,
 * identity, role, payment, diagnosis or implementation authority. A future
 * Avuhz receiver must independently verify a server-owned active business
 * binding, service authentication, rate limits, consent, tenant RLS and
 * idempotency before any write. This mapper proves none of those controls.
 *
 * Matches the input shape of
 * avuhz-infra/src/avuhz_service/acquisition_intake.py.
 * Do not add a parallel Sekinfra data store or bypass Avuhz's shared API.
 */

import {
  WEBSITE_DIAGNOSTIC_INTAKE_SOURCE,
  WEBSITE_DIAGNOSTIC_INTAKE_VERSION,
} from "../diagnostic-intake.ts";
import {
  deriveTriage,
  TRIAGE_FREQUENCIES,
  TRIAGE_IMPACTS,
  TRIAGE_SCOPES,
  TRIAGE_SPREADS,
  type TriageInput,
} from "../diagnostic-triage.ts";
import { PRESSURES } from "../personalization.ts";

const REJECTION = "invalid_website_acquisition_candidate";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+0-9(). -]+$/;
const CONTROLS = /[\x00-\x1f\x7f]/;

export type AvuhzAcquisitionIntakeContentV1 = Readonly<{
  external_request_id: string;
  source_system: "sekinfra.website";
  route_reference: "diagnostic.focused" | "diagnostic.oia";
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  preferred_contact_method: "EMAIL" | "PHONE";
  contact_requested: true;
  diagnostic_summary: string;
}>;

function deny(): never {
  // Never include supplied names, emails, phone numbers, diagnostic details
  // or request JSON in errors, logs, telemetry, or transport status.
  throw new Error(REJECTION);
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return deny();
  }
  return value as Record<string, unknown>;
}

function fields(value: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []): void {
  const expected = new Set([...required, ...optional]);
  if (
    required.some((key) => !Object.hasOwn(value, key)) ||
    Object.keys(value).some((key) => !expected.has(key))
  ) {
    deny();
  }
}

function text(value: unknown, min: number, max: number): string {
  if (typeof value !== "string" || value !== value.trim() ||
      value.length < min || value.length > max || CONTROLS.test(value)) {
    return deny();
  }
  return value;
}

function selected<T extends string>(value: unknown, options: readonly T[]): T {
  if (typeof value !== "string" || !options.includes(value as T)) {
    return deny();
  }
  return value as T;
}

/**
 * Return only the minimal Avuhz intake fields. No PII-bearing `repr` or logs.
 * This function is deliberately pure and never means "accepted by Avuhz".
 */
export function toAvuhzAcquisitionIntake(raw: unknown): AvuhzAcquisitionIntakeContentV1 {
  const candidate = record(raw);
  fields(candidate, [
    "contractVersion", "sourceSystem", "requestId", "generatedAt",
    "organization", "contact", "contactRequested", "triage", "authority",
  ]);
  if (
    candidate.contractVersion !== WEBSITE_DIAGNOSTIC_INTAKE_VERSION ||
    candidate.sourceSystem !== WEBSITE_DIAGNOSTIC_INTAKE_SOURCE ||
    candidate.contactRequested !== true
  ) {
    deny();
  }
  const externalRequestId = text(candidate.requestId, 36, 36);
  if (!UUID.test(externalRequestId)) deny();
  const generatedAt = text(candidate.generatedAt, 24, 30);
  if (
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(generatedAt) ||
    Number.isNaN(Date.parse(generatedAt)) ||
    new Date(generatedAt).toISOString() !== generatedAt
  ) {
    deny();
  }
  // Browser timestamps are descriptive only. Never use them for JWT/session
  // freshness, rate limiting, consent time, or application authority.

  const authority = record(candidate.authority);
  fields(authority, [
    "diagnosisAuthorized", "systemAccessAuthorized",
    "implementationAuthorized", "deploymentAuthorized",
  ]);
  if (Object.values(authority).some((value) => value !== false)) deny();

  const org = record(candidate.organization);
  fields(org, ["displayName"], ["website"]);
  const businessName = text(org.displayName, 2, 160);
  if (org.website !== undefined) text(org.website, 1, 253);

  const contact = record(candidate.contact);
  fields(contact, ["fullName", "businessEmail", "preferredContactMethod"], ["businessPhone", "role"]);
  const contactName = text(contact.fullName, 2, 120);
  const email = text(contact.businessEmail, 5, 254).toLowerCase();
  if (!EMAIL.test(email)) deny();
  const contactMethod = selected(contact.preferredContactMethod, ["EMAIL", "PHONE"] as const);
  const phone = contact.businessPhone === undefined
    ? null : text(contact.businessPhone, 7, 30);
  if ((phone !== null && !PHONE.test(phone)) || (contactMethod === "PHONE" && phone === null)) deny();
  if (contact.role !== undefined) text(contact.role, 1, 120);

  const triage = record(candidate.triage);
  fields(triage, [
    "pressure", "scope", "frequency", "impact", "spread",
    "desiredOutcome", "recommendedRoute", "recommendedRouteLabel", "routeReasons",
  ]);
  const pressure = selected(triage.pressure, PRESSURES);
  const scope = selected(triage.scope, TRIAGE_SCOPES);
  const frequency = selected(triage.frequency, TRIAGE_FREQUENCIES);
  const impact = selected(triage.impact, TRIAGE_IMPACTS);
  const spread = selected(triage.spread, TRIAGE_SPREADS);
  // Never treat browser-reported triage routing as server authority.
  const recomputed = deriveTriage({ pressure, scope, frequency, impact, spread } satisfies TriageInput);
  if (
    triage.recommendedRoute !== recomputed.route ||
    triage.recommendedRouteLabel !== recomputed.routeLabel ||
    typeof triage.desiredOutcome !== "string" ||
    !Array.isArray(triage.routeReasons) ||
    triage.routeReasons.length !== recomputed.reasons.length ||
    triage.routeReasons.some((reason, i) => reason !== recomputed.reasons[i])
  ) {
    deny();
  }

  // Deterministic vocabulary only: never copy free-text goal, website, role,
  // reasoning, or hidden authority fields into the shared diagnostic summary.
  const summary = [
    "Sekinfra website problem check",
    "area=" + pressure, "scope=" + scope, "frequency=" + frequency,
    "impact=" + impact, "spread=" + spread, "path=" + recomputed.route,
  ].join("; ");
  if (summary.length > 500) deny();

  return {
    external_request_id: externalRequestId,
    source_system: "sekinfra.website",
    route_reference: recomputed.route === "FOCUSED_DIAGNOSTIC"
      ? "diagnostic.focused" : "diagnostic.oia",
    business_name: businessName,
    contact_name: contactName,
    contact_email: email,
    contact_phone: phone,
    preferred_contact_method: contactMethod,
    contact_requested: true,
    diagnostic_summary: summary,
  };
}
