import { profiles, type Pressure } from "./personalization.ts";

export const TRIAGE_SCOPES = ["contained", "multi-step", "cross-team", "unclear"] as const;
export const TRIAGE_FREQUENCIES = ["isolated", "monthly", "weekly", "daily", "constant"] as const;
export const TRIAGE_IMPACTS = ["friction", "capacity", "customer", "revenue", "delivery", "risk"] as const;
export const TRIAGE_SPREADS = ["one", "few", "many", "unknown"] as const;

export type TriageScope = (typeof TRIAGE_SCOPES)[number];
export type TriageFrequency = (typeof TRIAGE_FREQUENCIES)[number];
export type TriageImpact = (typeof TRIAGE_IMPACTS)[number];
export type TriageSpread = (typeof TRIAGE_SPREADS)[number];
export type DiagnosticRoute = "FOCUSED_DIAGNOSTIC" | "OPERATIONAL_INFRASTRUCTURE_ASSESSMENT";

export type TriageInput = {
  pressure: Pressure;
  scope: TriageScope;
  frequency: TriageFrequency;
  impact: TriageImpact;
  spread: TriageSpread;
  desiredOutcome?: string;
};

export type TriageResult = {
  route: DiagnosticRoute;
  routeLabel: string;
  summary: string;
  reasons: string[];
  nextAction: string;
  desiredOutcome: string;
};

export const scopeLabels: Record<TriageScope, string> = {
  contained: "One contained workflow or issue",
  "multi-step": "Several steps in one operating path",
  "cross-team": "Multiple teams, functions, or locations",
  unclear: "The boundary is still unclear",
};

export const frequencyLabels: Record<TriageFrequency, string> = {
  isolated: "One-off or rare",
  monthly: "A few times a month",
  weekly: "Every week",
  daily: "Every day",
  constant: "It is part of normal operations",
};

export const impactLabels: Record<TriageImpact, string> = {
  friction: "Annoyance or extra effort",
  capacity: "Staff time or operating capacity",
  customer: "Customer experience or response",
  revenue: "Revenue or opportunity",
  delivery: "Service delivery or reliability",
  risk: "Security, access, compliance, or material risk",
};

export const spreadLabels: Record<TriageSpread, string> = {
  one: "One primary system or team",
  few: "Two or three systems or teams",
  many: "Four or more systems or teams",
  unknown: "We cannot tell yet",
};

const recurring = new Set<TriageFrequency>(["weekly", "daily", "constant"]);
const highRecurrence = new Set<TriageFrequency>(["daily", "constant"]);
const materialImpact = new Set<TriageImpact>(["customer", "revenue", "delivery", "risk"]);

export function deriveTriage(input: TriageInput): TriageResult {
  const broadScope = input.scope === "cross-team" || input.scope === "unclear";
  const broadSpread = input.spread === "many" || input.spread === "unknown";
  const repeats = recurring.has(input.frequency);
  const repeatsFrequently = highRecurrence.has(input.frequency);
  const material = materialImpact.has(input.impact);

  const oia =
    (broadScope && broadSpread) ||
    (broadScope && repeats) ||
    (broadSpread && repeatsFrequently) ||
    (input.scope === "multi-step" && broadSpread && material) ||
    (input.scope !== "contained" && repeatsFrequently && material);

  const reasons: string[] = [];
  if (broadScope) reasons.push(input.scope === "unclear" ? "The true operating boundary is not yet clear." : "The issue crosses team or functional boundaries.");
  if (broadSpread) reasons.push(input.spread === "unknown" ? "The systems and teams involved still need to be mapped." : "The issue spans several systems or teams.");
  if (repeats) reasons.push(`The problem recurs ${frequencyLabels[input.frequency].toLowerCase()}.`);
  if (material) reasons.push(`The reported impact reaches ${impactLabels[input.impact].toLowerCase()}.`);

  if (reasons.length === 0) {
    reasons.push("The issue currently appears bounded, infrequent, and suitable for a focused investigation.");
  } else if (!oia && reasons.length === 1) {
    reasons.push("The current scope still appears narrow enough to investigate without a full operating assessment.");
  }

  const profile = profiles[input.pressure];
  const desiredOutcome = input.desiredOutcome?.trim() || profile.outcome;

  return oia
    ? {
        route: "OPERATIONAL_INFRASTRUCTURE_ASSESSMENT",
        routeLabel: "Operational Infrastructure Assessment",
        summary: "The signals point to a broader operating problem that should be mapped across its real boundaries before a fix is prescribed.",
        reasons,
        nextAction: "Use the OIA to establish the operating picture, evidence, failure points, priorities, and the controlled next decision.",
        desiredOutcome,
      }
    : {
        route: "FOCUSED_DIAGNOSTIC",
        routeLabel: "Focused Diagnostic",
        summary: "The signals appear contained enough to investigate the failure point without automatically expanding into a full OIA.",
        reasons,
        nextAction: "Keep the diagnostic boundary tight: verify the failure point, business consequence, and smallest justified intervention.",
        desiredOutcome,
      };
}

export function buildTriageBrief(input: TriageInput, result = deriveTriage(input)): string {
  const profile = profiles[input.pressure];
  return [
    "SEKINFRA OPERATIONAL TRIAGE BRIEF",
    "",
    `Initial route: ${result.routeLabel}`,
    `Pressure point: ${profile.label}`,
    `Scope: ${scopeLabels[input.scope]}`,
    `Pattern: ${frequencyLabels[input.frequency]}`,
    `Business impact: ${impactLabels[input.impact]}`,
    `Systems / teams involved: ${spreadLabels[input.spread]}`,
    `Desired outcome: ${result.desiredOutcome}`,
    "",
    "Why this route:",
    ...result.reasons.map((reason) => `- ${reason}`),
    "",
    `Next diagnostic action: ${result.nextAction}`,
    "",
    "This is triage, not a diagnosis. No information in this brief is submitted to Sekinfra by this website, and governed online intake is not connected yet.",
  ].join("\n");
}
