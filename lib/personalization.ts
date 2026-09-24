export const PRESSURES = [
  "leads",
  "operations",
  "accountability",
  "visibility",
  "customer-follow-up",
  "systems",
  "cloud-network",
  "security-reliability",
  "not-sure",
] as const;

export type Pressure = typeof PRESSURES[number];

export type Profile = {
  id: Pressure;
  label: string;
  recognition: string;
  consequence: string;
  outcome: string;
  response: string;
  hero: string;
  cta: string;
  signals: string[];
  relatedSignals: string[];
  outcomes: string[];
  flow: string[];
  process: Record<string, string>;
  diagnostic: string[];
};

export const profiles: Record<Pressure, Profile> = {
  leads: {
    id: "leads",
    label: "Leads",
    recognition: "Interest arrives, then waits while follow up depends on someone noticing.",
    consequence: "Intent cools before the right person can respond.",
    outcome: "Every inquiry has a visible next action, owner, and response window.",
    response: "Route inquiries, define response expectations, and keep follow up visible.",
    hero: "Bring response timing, routing, and follow up into one dependable path.",
    cta: "Start by tracing the path from inquiry to response.",
    signals: [
      "Leads waiting too long for follow up",
      "Information spread across disconnected tools",
      "Tasks depending on someone remembering",
    ],
    relatedSignals: [
      "Poor visibility into what is actually happening",
      "Inconsistent processes between employees",
    ],
    outcomes: ["Lead response", "Customer follow up", "Workflow visibility"],
    flow: ["Inquiry", "Routing", "Response", "Follow up", "Outcome"],
    process: {
      Diagnose: "Trace where inquiries enter, wait, and lose context.",
      Design: "Define routing, response timing, and follow up ownership.",
      Build: "Connect the workflow points that protect timely response.",
      Validate: "Test whether missed opportunities become visible.",
      Improve: "Refine the path as real inquiry patterns emerge.",
    },
    diagnostic: [
      "Where inquiries enter",
      "Who receives each inquiry",
      "Response time expectations",
      "Follow up behavior",
      "How missed opportunities are identified",
    ],
  },
  operations: {
    id: "operations",
    label: "Operations",
    recognition: "Routine work moves through workarounds and the people who know the unwritten path.",
    consequence: "Small exceptions create avoidable coordination and delay.",
    outcome: "The work follows a repeatable path your team can actually use.",
    response: "Make coordination, exception handling, and completion visible in the flow.",
    hero: "Turn manual coordination into a clearer operating path with room for real exceptions.",
    cta: "Start by mapping where routine work needs a more dependable path.",
    signals: [
      "Repetitive coordination consuming staff time",
      "Inconsistent processes between employees",
      "Too much knowledge trapped in one person",
    ],
    relatedSignals: [
      "Tasks depending on someone remembering",
      "Poor visibility into what is actually happening",
    ],
    outcomes: ["Scheduling & coordination", "Administrative reduction", "Workflow visibility"],
    flow: ["Work input", "Coordination", "Process", "Exceptions", "Completion"],
    process: {
      Diagnose: "Map where routine work relies on workaround and memory.",
      Design: "Define the dependable path and its exception routes.",
      Build: "Connect the coordination points that keep work moving.",
      Validate: "Test the system against real handoffs and exceptions.",
      Improve: "Strengthen the path using operational evidence.",
    },
    diagnostic: [
      "Where work enters",
      "Which handoffs repeat",
      "What depends on memory",
      "How exceptions are handled",
      "Where completion becomes unclear",
    ],
  },
  accountability: {
    id: "accountability",
    label: "Accountability",
    recognition: "When a handoff fails, it is hard to see what happened or who acts next.",
    consequence: "Important work is recovered late, after the impact is already felt.",
    outcome: "Ownership is explicit at every critical point in the process.",
    response: "Define ownership, acknowledgement, escalation, and resolution in the flow.",
    hero: "Make ownership, exceptions, and the next action visible before work falls through.",
    cta: "Start by tracing where ownership becomes unclear.",
    signals: [
      "No clear owner when something goes wrong",
      "Tasks depending on someone remembering",
      "Too much knowledge trapped in one person",
    ],
    relatedSignals: [
      "Poor visibility into what is actually happening",
      "Inconsistent processes between employees",
    ],
    outcomes: ["Accountability", "Operational alerts", "Workforce reliability", "Workflow visibility"],
    flow: ["Event", "Owner", "Acknowledgement", "Escalation", "Resolution"],
    process: {
      Diagnose: "Trace where ownership becomes unclear or is silently dropped.",
      Design: "Define ownership, escalation, and visibility at critical points.",
      Build: "Connect the workflow and control points that support accountability.",
      Validate: "Test whether exceptions are actually surfaced and owned.",
      Improve: "Use unresolved exceptions to strengthen the system.",
    },
    diagnostic: [
      "Where work changes ownership",
      "How missed actions are detected",
      "What happens when someone does not respond",
      "Who can see unresolved exceptions",
      "Which steps depend on memory",
    ],
  },
  visibility: {
    id: "visibility",
    label: "Visibility",
    recognition: "There is plenty of activity but no dependable view of what is moving, stalled, or at risk.",
    consequence: "Leaders spend time chasing updates instead of making decisions.",
    outcome: "The right people can see the operational picture without chasing it.",
    response: "Normalize useful signals into an operational view designed for decisions.",
    hero: "Turn fragmented activity into a useful view of work, risk, and next action.",
    cta: "Start by identifying which operational state is hardest to see.",
    signals: [
      "Poor visibility into what is actually happening",
      "Information spread across disconnected tools",
      "No clear owner when something goes wrong",
    ],
    relatedSignals: [
      "Repetitive coordination consuming staff time",
      "Tasks depending on someone remembering",
    ],
    outcomes: ["Workflow visibility", "Reporting", "Operational alerts", "Accountability"],
    flow: ["Systems", "Signals", "Normalization", "Operational view", "Decision"],
    process: {
      Diagnose: "Identify where status is scattered, delayed, or unclear.",
      Design: "Define the signals and operational view needed for decisions.",
      Build: "Connect the points that create reliable visibility.",
      Validate: "Test whether risk and status are visible in time.",
      Improve: "Refine the view around real decision needs.",
    },
    diagnostic: [
      "Which systems hold operational state",
      "What status is hard to see",
      "Who needs the view",
      "How delays are currently found",
      "Which decisions lack context",
    ],
  },
  "customer-follow-up": {
    id: "customer-follow-up",
    label: "Customer Follow up",
    recognition: "Customer communication is inconsistent because timing and context are scattered across tools.",
    consequence: "The customer experiences uncertainty even when the team is trying to help.",
    outcome: "Customers receive relevant communication at the moments that matter.",
    response: "Use customer events, triggers, response state, and next actions to keep momentum.",
    hero: "Make customer follow up timely, relevant, and visible to the people responsible.",
    cta: "Start by tracing the moments when customer momentum is most often lost.",
    signals: [
      "Leads waiting too long for follow up",
      "Information spread across disconnected tools",
      "Tasks depending on someone remembering",
    ],
    relatedSignals: [
      "Poor visibility into what is actually happening",
      "Repetitive coordination consuming staff time",
    ],
    outcomes: ["Customer follow up", "Lead response", "Workflow visibility"],
    flow: ["Customer event", "Trigger", "Communication", "Response state", "Next action"],
    process: {
      Diagnose: "Trace the customer moments where context or timing is lost.",
      Design: "Define triggers, communication, and next action ownership.",
      Build: "Connect the system points that support consistent follow up.",
      Validate: "Test timing and context against the customer journey.",
      Improve: "Refine communication from real response patterns.",
    },
    diagnostic: [
      "Which customer events matter",
      "What should trigger follow up",
      "Who owns the next action",
      "Where context is lost",
      "How response state is visible",
    ],
  },
  systems: {
    id: "systems",
    label: "Disconnected Systems",
    recognition: "People move information between tools manually because the systems do not share the right state.",
    consequence: "Context is duplicated, delayed, or lost between the systems the business depends on.",
    outcome: "The right information moves between systems with a visible path for exceptions.",
    response: "Map the source of truth, integration points, ownership, and exception path before connecting anything.",
    hero: "Connect business systems around the work they need to support, not around integration for its own sake.",
    cta: "Start by tracing where information stops moving cleanly between systems.",
    signals: [
      "Information spread across disconnected systems",
      "Duplicate entry between tools",
      "Manual handoffs between software",
    ],
    relatedSignals: [
      "Poor visibility into what is actually happening",
      "Repetitive coordination consuming staff time",
    ],
    outcomes: ["Workflow visibility", "Administrative reduction", "Scheduling & coordination"],
    flow: ["Source", "Data", "Integration", "Workflow", "Outcome"],
    process: {
      Diagnose: "Trace which systems hold the needed state and where information breaks down.",
      Design: "Define the source of truth, integration boundaries, ownership, and exception path.",
      Build: "Connect only the approved system points needed for dependable movement.",
      Validate: "Test expected movement, failures, retries, and visibility.",
      Improve: "Refine the integration from real exceptions and operating evidence.",
    },
    diagnostic: [
      "Which systems are involved",
      "What information should move",
      "Where duplicate work occurs",
      "Which system should own each record",
      "How failed transfers are detected",
    ],
  },
  "cloud-network": {
    id: "cloud-network",
    label: "Cloud & Network",
    recognition: "Connectivity, availability, or cloud infrastructure problems are interrupting normal work.",
    consequence: "Staff lose access, services become unreliable, and the business cannot depend on the systems underneath the operation.",
    outcome: "The required services are reachable, observable, and dependable enough for the work they support.",
    response: "Trace the path from user or device through the network and cloud service before changing infrastructure.",
    hero: "Find where connectivity or infrastructure is failing, then repair the path the business actually depends on.",
    cta: "Start by tracing where access, connectivity, or availability breaks.",
    signals: [
      "Network or cloud issues interrupting work",
      "Unreliable access to business systems",
      "Recurring connectivity failures",
    ],
    relatedSignals: [
      "Poor visibility into what is actually happening",
      "No clear owner when something goes wrong",
    ],
    outcomes: ["Workforce reliability", "Operational alerts", "Workflow visibility"],
    flow: ["User or device", "Network", "Cloud", "Service", "Work"],
    process: {
      Diagnose: "Trace the failure path across device, network, cloud, and service dependencies.",
      Design: "Define the required operating state, controls, and infrastructure change.",
      Build: "Repair or implement only the approved infrastructure components.",
      Validate: "Test reachability, resilience, visibility, and the user path.",
      Improve: "Use incidents and operating evidence to strengthen reliability.",
    },
    diagnostic: [
      "Who or what is affected",
      "Where connectivity fails",
      "Which cloud or network dependencies are involved",
      "Whether the issue is intermittent or persistent",
      "What monitoring or evidence already exists",
    ],
  },
  "security-reliability": {
    id: "security-reliability",
    label: "Security & Reliability",
    recognition: "Access, exposure, recovery, or system dependability is uncertain.",
    consequence: "The business may rely on controls that are unclear, overly broad, or difficult to verify when something goes wrong.",
    outcome: "Access and reliability controls are explicit, observable, and aligned to the systems that matter.",
    response: "Establish the real exposure and operating requirement before changing permissions, controls, or recovery paths.",
    hero: "Make critical access, security, and reliability controls explicit around the operation they protect.",
    cta: "Start by identifying the system, access path, or reliability concern that needs to be understood.",
    signals: [
      "Access controls are unclear",
      "Security exposure is uncertain",
      "Recovery or reliability is unproven",
    ],
    relatedSignals: [
      "No clear owner when something goes wrong",
      "Poor visibility into what is actually happening",
    ],
    outcomes: ["Accountability", "Operational alerts", "Workforce reliability"],
    flow: ["Identity", "Access", "Control", "Alert", "Recovery"],
    process: {
      Diagnose: "Establish the affected assets, access paths, controls, and evidence.",
      Design: "Define the least-privilege and reliability state the operation requires.",
      Build: "Apply only separately approved control or reliability changes.",
      Validate: "Test access, observability, recovery, and expected failure handling.",
      Improve: "Use incidents, exceptions, and access evidence to tighten the system.",
    },
    diagnostic: [
      "Which system or asset is affected",
      "Who currently has access",
      "What control or reliability concern exists",
      "What evidence or alerts are available",
      "What recovery path is expected",
    ],
  },
  "not-sure": {
    id: "not-sure",
    label: "Not Sure",
    recognition: "Something is not working the way it should, but the failure does not fit neatly into one category yet.",
    consequence: "Guessing at the category can send time and money toward the wrong fix.",
    outcome: "The problem is bounded well enough to decide what should be investigated and what should happen next.",
    response: "Start from the symptom, map the affected operation and systems, and narrow the problem from evidence.",
    hero: "Bring SekInfra the symptom. We will help establish whether the real problem is operational, technical, or both.",
    cta: "Start with what you are seeing. You do not need to diagnose it first.",
    signals: [
      "A recurring issue has no clear cause",
      "Multiple systems or teams may be involved",
      "The right fix is not obvious",
    ],
    relatedSignals: [
      "Poor visibility into what is actually happening",
      "Too much knowledge trapped in one person",
    ],
    outcomes: ["Workflow visibility", "Accountability", "Operational alerts"],
    flow: ["Symptom", "Scope", "Evidence", "Failure point", "Next action"],
    process: {
      Diagnose: "Bound the symptom, affected work, systems, and available evidence.",
      Design: "Define the smallest useful investigation or intervention.",
      Build: "Implement only after the real failure point and authority are clear.",
      Validate: "Test whether the identified condition explains the original symptom.",
      Improve: "Use what was learned to reduce recurrence and improve visibility.",
    },
    diagnostic: [
      "What is happening",
      "Who or what is affected",
      "When the issue appears",
      "Which systems or processes may be involved",
      "What changed before the problem began",
    ],
  },
};

export function isPressure(value: unknown): value is Pressure {
  return typeof value === "string" && (PRESSURES as readonly string[]).includes(value);
}

export function profileFor(value: unknown): Profile | undefined {
  return isPressure(value) ? profiles[value] : undefined;
}

export function orderedOutcomes(profile?: Profile) {
  const all = [
    "Lead response",
    "Customer follow up",
    "Accountability",
    "Workflow visibility",
    "Scheduling & coordination",
    "Reporting",
    "Operational alerts",
    "Workforce reliability",
    "Marketing operations",
    "Administrative reduction",
  ];
  return profile
    ? [...profile.outcomes, ...all.filter((item) => !profile.outcomes.includes(item))]
    : all;
}
