import type { Pressure } from "./personalization";

export type OutcomeFamilyId = "response" | "control" | "visibility" | "capacity";

export type OutcomeFamily = {
  id: OutcomeFamilyId;
  title: string;
  summary: string;
  outcomes: string[];
  whatChanges: string;
  whatBecomesVisible: string;
  goodLooksLike: string;
  pressures: Pressure[];
};

export const outcomeFamilies: OutcomeFamily[] = [
  {
    id: "response",
    title: "Response and customer momentum",
    summary: "Keep interest, context, and the next action moving without depending on someone noticing in time.",
    outcomes: ["Lead response", "Customer follow up"],
    whatChanges: "Inquiry routing, response timing, and follow up become part of one dependable path.",
    whatBecomesVisible: "Who owns the response, what happens next, and where momentum is waiting.",
    goodLooksLike: "Every qualified inquiry has a visible owner, response window, and next action.",
    pressures: ["leads", "customer-follow-up"],
  },
  {
    id: "control",
    title: "Control and accountability",
    summary: "Make ownership, acknowledgment, escalation, and exception handling explicit at the moments that matter.",
    outcomes: ["Accountability", "Operational alerts", "Workforce reliability"],
    whatChanges: "Critical handoffs stop relying on assumptions about who will notice or recover the work.",
    whatBecomesVisible: "The current owner, unresolved exception, escalation path, and accountable next action.",
    goodLooksLike: "Important work cannot disappear between people without becoming visible.",
    pressures: ["accountability"],
  },
  {
    id: "visibility",
    title: "Visibility and decisions",
    summary: "Turn scattered activity into an operating picture that helps leaders see work, risk, and next action.",
    outcomes: ["Workflow visibility", "Reporting"],
    whatChanges: "Operational state is normalized into a view designed around decisions instead of status chasing.",
    whatBecomesVisible: "What is moving, what is stalled, where risk exists, and which decisions need attention.",
    goodLooksLike: "The right people can understand operational state without assembling it manually.",
    pressures: ["visibility"],
  },
  {
    id: "capacity",
    title: "Capacity and coordination",
    summary: "Reduce the manual glue that keeps routine work moving while preserving clear paths for real exceptions.",
    outcomes: ["Scheduling and coordination", "Administrative reduction", "Marketing operations"],
    whatChanges: "Repeatable work follows a defined sequence with ownership, timing, and exception handling.",
    whatBecomesVisible: "Where work is waiting, what needs intervention, and when a process is complete.",
    goodLooksLike: "Routine coordination consumes less attention because the operating path carries more of the load.",
    pressures: ["operations"],
  },
];
export const transformations = [
  {
    label: "Response",
    before: "An inquiry waits in the wrong place.",
    controlled: "Owner, response window, and next action are visible.",
  },
  {
    label: "Accountability",
    before: "A handoff has no visible owner.",
    controlled: "Ownership, acknowledgment, and escalation are explicit.",
  },
  {
    label: "Visibility",
    before: "Status is scattered across updates and systems.",
    controlled: "Work, risk, and next action are visible in one operating picture.",
  },
  {
    label: "Coordination",
    before: "Routine work depends on memory and manual follow through.",
    controlled: "Sequence, exception path, and completion state are defined.",
  },
] as const;

export const illustrativeOutcome = {
  label: "Illustrative operating scenario",
  disclosure: "Synthetic example. This is not a client case study.",
  steps: [
    ["Signal", "An urgent customer request can wait after assignment."],
    ["Evidence", "Acknowledgment is inconsistent at the handoff point."],
    ["Finding", "The assignment path does not make response ownership reliably visible."],
    ["Business consequence", "A qualified request can sit without a visible owner or response window."],
    ["Desired state", "Every qualified request has an accountable owner, response window, visible state, and exception path."],
  ],
} as const;
export const outcomeVsFeature = [
  ["Feature", "A CRM is installed.", "Outcome", "Every qualified inquiry has a visible owner and next action."],
  ["Feature", "A dashboard exists.", "Outcome", "Leaders can see stalled work without chasing updates."],
] as const;

export const outcomeProcess = [
  ["Understand", "Start with the operating condition that should change."],
  ["Prove", "Establish what is happening and why it matters."],
  ["Decide", "Define the desired state and the right intervention."],
  ["Improve", "Change only what is separately approved, then validate the result."],
] as const;

export function orderedOutcomeFamilies(pressure?: Pressure): OutcomeFamily[] {
  if (!pressure) return outcomeFamilies;
  const first = outcomeFamilies.find((family) => family.pressures.includes(pressure));
  return first ? [first, ...outcomeFamilies.filter((family) => family.id !== first.id)] : outcomeFamilies;
}

export function allOutcomeLabels(): string[] {
  return outcomeFamilies.flatMap((family) => family.outcomes);
}
