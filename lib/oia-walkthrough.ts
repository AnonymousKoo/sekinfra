/** Browser-only OIA discovery: self-reported, never an Avuhz assessment record. */
export const OIA_AREAS = [
  {
    id: "intake", number: "01", category: "Work intake",
    question: "When a new job, request, or issue arrives, is the next step captured and assigned?",
    description: "Consider calls, emails, work orders, tickets and unexpected requests.",
    investigation: "Follow one recent request from arrival to assignment and first response.",
    outcome: "A consistent intake process that reduces missed requests.",
  },
  {
    id: "ownership", number: "02", category: "People & handoffs",
    question: "When work crosses people or departments, does someone clearly own the next step?",
    description: "Think about transfers, approvals, follow-ups and exceptions.",
    investigation: "Map a cross-team handoff, owner, escalation and completion evidence.",
    outcome: "Clear ownership when responsibilities or priorities change.",
  },
  {
    id: "systems", number: "03", category: "Systems & information",
    question: "Can people find reliable information without repeatedly entering or chasing it?",
    description: "Consider business applications, spreadsheets, field tools and duplicated data.",
    investigation: "List systems used in a real workflow and where data gets copied or delayed.",
    outcome: "Reliable information moving between the right systems.",
  },
  {
    id: "visibility", number: "04", category: "Visibility",
    question: "Can managers see delayed work and recurring issues before they become surprises?",
    description: "Consider queues, reports, exceptions, customer updates and performance.",
    investigation: "Trace how one overdue task is detected, escalated and closed.",
    outcome: "Visibility into work that needs action, not just historical reports.",
  },
  {
    id: "reliability", number: "05", category: "Reliability & recovery",
    question: "When a system or process fails, is recovery predictable and owned?",
    description: "Consider downtime, workarounds, network and cloud issues, and continuity.",
    investigation: "Review a recent interruption, recovery actions, ownership and lessons.",
    outcome: "Predictable response and recovery with less repeated firefighting.",
  },
  {
    id: "controls", number: "06", category: "Security & approvals",
    question: "Are important access decisions and changes controlled and reviewable?",
    description: "Think about who grants access, approves changes and checks completion.",
    investigation: "Review the approval process and evidence without disclosing credentials.",
    outcome: "Appropriate access, approvals and change evidence.",
  },
  {
    id: "capacity", number: "07", category: "Growth & capacity",
    question: "Could the operation handle more work without equally more manual coordination?",
    description: "Consider busy periods, staffing, onboarding and repeated tasks.",
    investigation: "Locate the first bottleneck that appears when work volume increases.",
    outcome: "More capacity through better processes, rather than additional chasing.",
  },
] as const;

export type OiaAreaId = (typeof OIA_AREAS)[number]["id"];
export type OiaResponse = "consistent" | "sometimes" | "frequent" | "unknown";
export type OiaAnswers = Partial<Record<OiaAreaId, OiaResponse>>;
export type OiaNotes = Partial<Record<OiaAreaId, string>>;
export type OiaDraft = {
  organization: string;
  objective: string;
  answers: OiaAnswers;
  notes: OiaNotes;
};

export const OIA_CHOICES: readonly { value: OiaResponse; title: string; detail: string }[] = [
  { value: "consistent", title: "Usually works well", detail: "There's a repeatable process." },
  { value: "sometimes", title: "Inconsistent", detail: "It sometimes needs chasing or workarounds." },
  { value: "frequent", title: "Recurring problem", detail: "It regularly delays work or creates risk." },
  { value: "unknown", title: "Not sure yet", detail: "We would need to verify this." },
];

export function oiaResponseTitle(value: OiaResponse): string {
  return OIA_CHOICES.find((option) => option.value === value)?.title ?? "Not assessed";
}

export function summarizeOia(draft: OiaDraft) {
  const signals = OIA_AREAS.map((area) => ({
    ...area, response: draft.answers[area.id], note: (draft.notes[area.id] ?? "").trim(),
  }));
  if (signals.some((item) => !OIA_CHOICES.some((choice) => choice.value === item.response))) {
    throw new Error("Complete every area before creating a brief.");
  }
  const frequent = signals.filter((item) => item.response === "frequent").length;
  const sometimes = signals.filter((item) => item.response === "sometimes").length;
  const unknown = signals.filter((item) => item.response === "unknown").length;
  const rank: Record<OiaResponse, number> = {
    frequent: 0, sometimes: 1, unknown: 2, consistent: 3,
  };
  const priority = signals.filter((item) => item.response !== "consistent")
    .sort((a, b) => rank[a.response!] - rank[b.response!]).slice(0, 3);
  return {
    signals, priority, frequent, sometimes, unknown,
    headline: frequent > 0 ? "Recurring friction to investigate"
      : sometimes > 0 ? "Some processes need a closer look"
      : unknown > 0 ? "Operating details that need validation"
      : "No major friction reported in this first pass",
  };
}

export function buildOiaBrief(draft: OiaDraft): string {
  const result = summarizeOia(draft);
  const lines = [
    "SEKINFRA | PRELIMINARY OIA WALKTHROUGH",
    "Self-reported discovery, NOT a completed Operational Infrastructure Assessment.",
    "",
    `Business: ${draft.organization.trim().slice(0,100) || "Not specified"}`,
    `Desired improvement: ${draft.objective.trim().slice(0,240) || "Not specified"}`,
    "", "INITIAL SIGNALS", result.headline,
    `${result.frequent} recurring concern(s), ${result.sometimes} inconsistent area(s), ${result.unknown} unverified area(s).`,
    "", "SUGGESTED INSPECTION PRIORITIES",
  ];
  if (result.priority.length === 0) {
    lines.push("No major concerns reported. Validate the operating process before suggesting changes.");
  } else {
    for (const area of result.priority) {
      lines.push(`- ${area.category} (${oiaResponseTitle(area.response!)})`);
      lines.push(`  Investigate: ${area.investigation}`);
    }
  }
  lines.push("", "WALKTHROUGH RESPONSES");
  for (const area of result.signals) {
    lines.push(`${area.number} ${area.category}: ${oiaResponseTitle(area.response!)}`);
    if (area.note) lines.push(`  Self-reported example: ${area.note.slice(0,240)}`);
  }
  lines.push(
    "", "NEXT STEP",
    "Agree scope, deliverables, fee and timing before any formal OIA or inspection.",
    "Not a diagnosis, audit, compliance certification or permission to access or change systems.",
    "Nothing is automatically submitted or saved by the site. Copy or print only if you choose.",
    "Contact: admin@sekinfra.com",
  );
  return lines.join("\n");
}
