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
  contained: "One workflow, tool, or issue",
  "multi-step": "Several connected steps",
  "cross-team": "More than one team, part of the business, or location",
  unclear: "We still cannot tell how far the problem spreads",
};

export const frequencyLabels: Record<TriageFrequency, string> = {
  isolated: "One-off or rare",
  monthly: "A few times a month",
  weekly: "Every week",
  daily: "Every day",
  constant: "It happens all the time",
};

export const impactLabels: Record<TriageImpact, string> = {
  friction: "Annoyance or extra effort",
  capacity: "Staff time or workload",
  customer: "Customer experience or response",
  revenue: "Revenue or opportunity",
  delivery: "Service delivery or reliability",
  risk: "Security, access, compliance, or business risk",
};

export const spreadLabels: Record<TriageSpread, string> = {
  one: "One system or team",
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
  if (broadScope) reasons.push(input.scope === "unclear" ? "We cannot yet tell where the problem starts and stops." : "The problem crosses more than one team or part of the business.");
  if (broadSpread) reasons.push(input.spread === "unknown" ? "We still need to learn which systems and teams are involved." : "The problem touches several systems or teams.");
  if (repeats) reasons.push(`The problem happens ${frequencyLabels[input.frequency].toLowerCase()}.`);
  if (material) reasons.push(`The main impact is ${impactLabels[input.impact].toLowerCase()}.`);

  if (reasons.length === 0) {
    reasons.push("The problem looks small enough for a focused review.");
  } else if (!oia && reasons.length === 1) {
    reasons.push("The problem still looks narrow enough to review without a full OIA.");
  }

  const profile = profiles[input.pressure];
  const desiredOutcome = input.desiredOutcome?.trim() || profile.outcome;

  return oia
    ? {
        route: "OPERATIONAL_INFRASTRUCTURE_ASSESSMENT",
        routeLabel: "Operational Infrastructure Assessment",
        summary: "The problem looks bigger or less clear, so Sekinfra should look across the teams and systems involved before suggesting a fix.",
        reasons,
        nextAction: "Use the OIA to show what is happening, where it starts, what matters most, and what should happen next.",
        desiredOutcome,
      }
    : {
        route: "FOCUSED_DIAGNOSTIC",
        routeLabel: "Focused Diagnostic",
        summary: "The problem looks focused enough for a smaller review instead of a full OIA.",
        reasons,
        nextAction: "Keep the review focused: find where the problem starts, show the impact, and define the smallest fix that makes sense.",
        desiredOutcome,
      };
}

export function buildTriageBrief(input: TriageInput, result = deriveTriage(input)): string {
  const profile = profiles[input.pressure];
  return [
    "SEKINFRA PROBLEM REVIEW",
    "",
    `Suggested path: ${result.routeLabel}`,
    `Pressure point: ${profile.label}`,
    `How far it spreads: ${scopeLabels[input.scope]}`,
    `Pattern: ${frequencyLabels[input.frequency]}`,
    `Main impact: ${impactLabels[input.impact]}`,
    `Systems / teams involved: ${spreadLabels[input.spread]}`,
    `What better should look like: ${result.desiredOutcome}`,
    "",
    "Why we picked this path:",
    ...result.reasons.map((reason) => `- ${reason}`),
    "",
    `Next step: ${result.nextAction}`,
    "",
    "This is a first review, not a diagnosis. This website does not send this brief to Sekinfra. Online submission is not connected yet.",
  ].join("\n");
}
