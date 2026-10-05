import type { Pressure } from "./personalization";

export type OutcomeFamilyId = "response" | "control" | "visibility" | "capacity" | "reliability";

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
    title: "Response and follow-up",
    summary: "Keep leads and customers moving without depending on someone noticing at the right time.",
    outcomes: ["Lead response", "Customer follow up"],
    whatChanges: "New inquiries, response timing, and follow-up use one clear path.",
    whatBecomesVisible: "Who owns the response, what happens next, and what is waiting.",
    goodLooksLike: "Every qualified inquiry has a clear owner, response time, and next step.",
    pressures: ["leads", "customer-follow-up"],
  },
  {
    id: "control",
    title: "Ownership and accountability",
    summary: "Make it clear who owns the work, who has responded, and what happens when something is missed.",
    outcomes: ["Accountability", "Operational alerts", "Workforce reliability"],
    whatChanges: "Important handoffs stop depending on someone noticing or remembering.",
    whatBecomesVisible: "The current owner, what is unresolved, when to escalate, and the next step.",
    goodLooksLike: "Important work cannot disappear between people without someone seeing it.",
    pressures: ["accountability"],
  },
  {
    id: "visibility",
    title: "Visibility and decisions",
    summary: "Turn scattered updates into one view that shows work, risk, and next steps.",
    outcomes: ["Workflow visibility", "Reporting", "System state"],
    whatChanges: "Important status from different systems is brought into one view for decisions.",
    whatBecomesVisible: "What is moving, what is stuck, where risk exists, and what needs a decision.",
    goodLooksLike: "The right people can understand what is happening without building the picture by hand.",
    pressures: ["visibility", "systems", "not-sure"],
  },
  {
    id: "capacity",
    title: "Capacity and coordination",
    summary: "Reduce the manual chasing that keeps routine work moving while keeping clear paths for real problems.",
    outcomes: ["Scheduling and coordination", "Administrative reduction", "Marketing operations"],
    whatChanges: "Repeatable work follows clear steps with ownership, timing, and a way to handle exceptions.",
    whatBecomesVisible: "Where work is waiting, what needs help, and when the job is complete.",
    goodLooksLike: "Routine coordination takes less time because the process carries more of the load.",
    pressures: ["operations"],
  },
  {
    id: "reliability",
    title: "Infrastructure, security, and reliability",
    summary: "Make the technology underneath the business reliable enough for people to trust it.",
    outcomes: ["Service availability", "Controlled access", "Infrastructure visibility", "Recovery readiness"],
    whatChanges: "Connections, access, monitoring, and recovery are built around the services the business actually needs.",
    whatBecomesVisible: "What failed, who is affected, what protection is active, and how recovery should work.",
    goodLooksLike: "Important services are reachable, access is clear, failures are visible, and recovery does not depend on guessing.",
    pressures: ["cloud-network", "security-reliability"],
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
    controlled: "The owner, response, and escalation path are clear.",
  },
  {
    label: "Visibility",
    before: "Status is scattered across updates and systems.",
    controlled: "Work, risk, and next steps are visible in one view.",
  },
  {
    label: "Coordination",
    before: "Routine work depends on memory and manual follow through.",
    controlled: "The steps, exception path, and completion status are clear.",
  },
  {
    label: "Reliability",
    before: "A service fails and the business has to guess whether the issue is device, network, cloud, access, or application.",
    controlled: "The failing service, access rules, and recovery path are clear enough to act.",
  },
] as const;

export const illustrativeOutcome = {
  label: "Simple example",
  disclosure: "Synthetic example. This is not a client case study.",
  steps: [
    ["Signal", "An urgent customer request can sit after it is assigned."],
    ["Evidence", "The next person does not always confirm they received the work."],
    ["Finding", "The handoff does not make it clear who owns the response."],
    ["Business consequence", "A qualified request can sit without a clear owner or response time."],
    ["Desired state", "Every qualified request has a clear owner, response time, visible status, and a way to handle exceptions."],
  ],
} as const;

export const outcomeVsFeature = [
  ["Feature", "A CRM is installed.", "Outcome", "Every qualified inquiry has a visible owner and next action."],
  ["Feature", "A dashboard exists.", "Outcome", "Leaders can see stalled work without chasing updates."],
  ["Feature", "Monitoring is installed.", "Outcome", "A critical service problem becomes visible with enough context to act before troubleshooting turns into guesswork."],
] as const;

export const outcomeProcess = [
  ["Understand", "Start with what should work better."],
  ["Prove", "Find what is happening and why it matters."],
  ["Decide", "Define what better looks like and the right fix."],
  ["Improve", "Change only what was approved, then make sure it worked."],
] as const;

export function orderedOutcomeFamilies(pressure?: Pressure): OutcomeFamily[] {
  if (!pressure) return outcomeFamilies;
  const first = outcomeFamilies.find((family) => family.pressures.includes(pressure));
  return first ? [first, ...outcomeFamilies.filter((family) => family.id !== first.id)] : outcomeFamilies;
}

export function allOutcomeLabels(): string[] {
  return outcomeFamilies.flatMap((family) => family.outcomes);
}
