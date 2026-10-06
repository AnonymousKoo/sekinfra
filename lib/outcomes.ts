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
    goodLooksLike: "Every new inquiry has a clear owner, response time, and next step.",
    pressures: ["leads", "customer-follow-up"],
  },
  {
    id: "control",
    title: "Ownership and accountability",
    summary: "Make it clear who owns the work, who has responded, and what happens when something is missed.",
    outcomes: ["Accountability", "Operational alerts", "Workforce reliability"],
    whatChanges: "Important handoffs stop depending on someone noticing or remembering.",
    whatBecomesVisible: "The current owner, what is still open, what happens if it is missed, and the next step.",
    goodLooksLike: "Important work cannot get lost between people without someone seeing it.",
    pressures: ["accountability"],
  },
  {
    id: "visibility",
    title: "Visibility and decisions",
    summary: "Turn scattered updates into one view that shows work, risk, and next steps.",
    outcomes: ["Workflow visibility", "Reporting", "System state"],
    whatChanges: "Important updates from different systems are brought into one clear view.",
    whatBecomesVisible: "What is moving, what is stuck, where risk exists, and what needs a decision.",
    goodLooksLike: "The right people can understand what is happening without chasing updates by hand.",
    pressures: ["visibility", "systems", "not-sure"],
  },
  {
    id: "capacity",
    title: "Capacity and coordination",
    summary: "Reduce the manual chasing needed to keep routine work moving.",
    outcomes: ["Scheduling and coordination", "Administrative reduction", "Marketing operations"],
    whatChanges: "Repeatable work follows clear steps, clear ownership, and a plan for problems.",
    whatBecomesVisible: "Where work is waiting, what needs help, and when the job is complete.",
    goodLooksLike: "Routine work takes less time because the system carries more of the load.",
    pressures: ["operations"],
  },
  {
    id: "reliability",
    title: "Technology, security, and reliability",
    summary: "Make the technology the business depends on reliable enough to trust.",
    outcomes: ["Service availability", "Clear access rules", "System visibility", "Recovery readiness"],
    whatChanges: "Connections, access, alerts, and recovery are built around the services the business actually needs.",
    whatBecomesVisible: "What failed, who is affected, what protection is active, and how recovery should work.",
    goodLooksLike: "Important services work, access is clear, failures are visible, and recovery does not depend on guessing.",
    pressures: ["cloud-network", "security-reliability"],
  },
];

export const transformations = [
  {
    label: "Response",
    before: "An inquiry waits in the wrong place.",
    controlled: "The owner, response time, and next step are clear.",
  },
  {
    label: "Accountability",
    before: "A handoff has no visible owner.",
    controlled: "The owner, response, and what happens if it is missed are clear.",
  },
  {
    label: "Visibility",
    before: "Status is scattered across updates and systems.",
    controlled: "Work, risk, and next steps are visible in one view.",
  },
  {
    label: "Coordination",
    before: "Routine work depends on memory and manual follow through.",
    controlled: "The steps, what happens when something goes wrong, and when the work is done are clear.",
  },
  {
    label: "Reliability",
    before: "A service fails and the business has to guess where the problem is.",
    controlled: "The failed service, access rules, and recovery steps are clear enough to act.",
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
  ["Feature", "Monitoring is installed.", "Outcome", "A critical service problem is visible early enough for the team to act without guessing."],
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
