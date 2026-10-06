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
    recognition: "New leads come in, but follow-up waits until someone notices.",
    consequence: "People lose interest or choose someone else before your team responds.",
    outcome: "Every lead has an owner, a response time, and a clear next step.",
    response: "Route new leads, set response times, and make follow-up easy to see.",
    hero: "Keep new leads from sitting by giving each one a clear owner and next step.",
    cta: "Start with the path from new lead to first response.",
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
    flow: ["Lead", "Owner", "Response", "Follow-up", "Result"],
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
    recognition: "Routine work depends on people remembering steps that are not written down.",
    consequence: "Small problems turn into delays and extra back-and-forth.",
    outcome: "Routine work follows a clear path, with a known way to handle exceptions.",
    response: "Make the steps, owner, handoffs, and what happens when something goes wrong easy to follow.",
    hero: "Reduce manual coordination by giving routine work a clear path and a clear owner.",
    cta: "Start with the routine work that takes too much chasing.",
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
    flow: ["Work", "Owner", "Steps", "Exceptions", "Done"],
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
    recognition: "Work gets handed off, but it is not always clear who owns the next step.",
    consequence: "Problems are found late, after work has already been missed or delayed.",
    outcome: "Important work always has a visible owner and next step.",
    response: "Make ownership, follow-up, and what happens when work is missed clear.",
    hero: "Make it clear who owns the work, what is late, and what happens next.",
    cta: "Start where ownership gets unclear.",
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
    flow: ["Work", "Owner", "Check-in", "Escalation", "Done"],
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
    recognition: "A lot is happening, but there is no clear view of what is moving, stuck, or at risk.",
    consequence: "Leaders spend time asking for updates instead of making decisions.",
    outcome: "The right people can see what is moving, stuck, or at risk without chasing updates.",
    response: "Bring the most useful status into one clear view for decisions.",
    hero: "Turn scattered updates into one clear view of work, risk, and next steps.",
    cta: "Start with the status your team has the hardest time seeing.",
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
    flow: ["Systems", "Updates", "One view", "Risk", "Decision"],
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
    recognition: "Customer follow-up changes from person to person because timing and details are spread across tools.",
    consequence: "Customers wait, repeat themselves, or have to ask again.",
    outcome: "Customers get the right follow-up at the right time.",
    response: "Set clear timing, ownership, and next steps so follow-up keeps moving.",
    hero: "Make customer follow-up timely, clear, and easy for the team to track.",
    cta: "Start with the moments when customer follow-up most often slips.",
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
    flow: ["Customer", "Trigger", "Follow-up", "Reply", "Next step"],
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
    recognition: "People copy information between tools because the systems do not share what the team needs.",
    consequence: "Information gets copied twice, arrives late, or gets lost between systems.",
    outcome: "The right information moves between systems, and failed handoffs are easy to spot.",
    response: "Decide which system owns the information, what should move, and what happens when a connection fails.",
    hero: "Connect the systems around the work your team actually needs to get done.",
    cta: "Start where people have to copy, re-enter, or chase information.",
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
    flow: ["System", "Information", "Connection", "Work", "Result"],
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
    recognition: "Internet, network, cloud, or service problems interrupt normal work.",
    consequence: "People lose access, services become unreliable, and work slows down or stops.",
    outcome: "Key services stay reachable, visible, and reliable enough for the work they support.",
    response: "Follow the connection from the person or device to the network and cloud service before changing anything.",
    hero: "Find where the connection or service is failing, then fix the path the business depends on.",
    cta: "Start where access, connection, or service keeps breaking.",
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
    flow: ["User", "Network", "Cloud", "Service", "Work"],
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
    recognition: "Who has access, what is protected, or how recovery works is not clear.",
    consequence: "Too much access, weak controls, or an unclear recovery plan can put important systems at risk.",
    outcome: "Access rules, alerts, and recovery steps are clear around the systems that matter.",
    response: "Check the real access, risk, and recovery need before changing permissions or security settings.",
    hero: "Make access, security, alerts, and recovery clear around the systems the business depends on.",
    cta: "Start with the system, access, or reliability concern that worries you.",
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
    flow: ["Person", "Access", "Protection", "Alert", "Recovery"],
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
    recognition: "Something is wrong, but it does not fit one clear category yet.",
    consequence: "Guessing can waste time and money on the wrong fix.",
    outcome: "The problem is clear enough to decide what should be checked and what should happen next.",
    response: "Start with what you see, who is affected, and which systems or work may be involved.",
    hero: "Bring Sekinfra the problem you can see. We will help find whether the cause is in the work, the technology, or both.",
    cta: "Start with what you are seeing. You do not need to know the cause.",
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
    flow: ["Problem", "Who is affected", "What we check", "Cause", "Next step"],
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
