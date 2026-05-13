// Mock data for SEKINFRA Growth Engine. Structured to map cleanly onto Supabase later.

export type PipelineStage = "new" | "paid" | "intake" | "emailed" | "opened" | "clicked" | "booked";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type IntakeStatus = "pending" | "complete";
export type BookingStatus = "none" | "scheduled" | "completed" | "no_show";
export type LeadStatus = "new" | "paid" | "intake_complete" | "email_sent" | "opened" | "clicked" | "booked" | "needs_followup" | "failed";

export interface Client {
  id: string;
  name: string;
  industry: string;
  initial: string;
}

export interface Lead {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  businessType: string;
  source: string;
  payment: PaymentStatus;
  intake: IntakeStatus;
  booking: BookingStatus;
  stage: PipelineStage;
  status: LeadStatus;
  lastActivity: string; // ISO
  createdAt: string;
  value?: number;

  // Operational lifecycle (from API)
  operationalState?: string;
  lifecycleStage?: string;
  infrastructureStatus?: string;
  securityStatus?: string;
  automationStatus?: string;
  oiaSubmitted?: boolean;
  oiaCompleted?: boolean;
  deploymentStarted?: boolean;
  dashboardReady?: boolean;
  goLive?: boolean;
  paymentReceived?: boolean;
  bookedCall?: boolean;
  bookingDate?: string | null;
  followupCount?: number;
  followupStatus?: string;
  nextFollowup?: string | null;
  riskLevel?: string;
  uptimePercentage?: number;
  activeAlerts?: number;
  totalIncidents?: number;
  businessName?: string | null;
  paymentAmount?: number;
}

export interface ActivityEvent {
  id: string;
  clientId: string;
  leadId?: string;
  leadName?: string;
  type:
    | "lead_captured"
    | "payment_received"
    | "intake_submitted"
    | "crm_created"
    | "internal_notified"
    | "email_sent"
    | "email_opened"
    | "link_clicked"
    | "appointment_booked"
    | "followup_triggered"
    | "automation_failed";
  message: string;
  timestamp: string;
}

export const clients: Client[] = [
  { id: "sek", name: "SEKINFRA Internal", industry: "Operating system", initial: "S" },
  { id: "law", name: "Demo Law Firm", industry: "Legal services", initial: "L" },
  { id: "ins", name: "Demo Insurance Agency", industry: "Insurance", initial: "I" },
];

const firstNames = ["Marcus", "Aisha", "Daniel", "Priya", "Jordan", "Mei", "Liam", "Sofia", "Ethan", "Zara", "Noah", "Yara", "Owen", "Elena", "Rafael", "Imani", "Theo", "Chloe", "Asher", "Layla"];
const lastNames = ["Vance", "Okafor", "Reyes", "Patel", "Hayes", "Tanaka", "Brennan", "Castillo", "Walsh", "Khan", "Doyle", "Haddad", "Pierce", "Moreau", "Silva", "Adeyemi", "Larsen", "Bishop", "Cole", "Najjar"];
const types = ["Law Firm", "Insurance", "Med Spa", "Real Estate", "Dental", "Accounting", "Wellness", "Consulting"];
const sources = ["Google Ads", "Meta Ads", "Referral", "Organic", "LinkedIn", "Direct"];
const cities = ["Austin, TX", "Miami, FL", "Denver, CO", "Brooklyn, NY", "Seattle, WA", "Atlanta, GA", "Boston, MA", "Phoenix, AZ"];

const stageFlow: PipelineStage[] = ["new", "paid", "intake", "emailed", "opened", "clicked", "booked"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function statusFromStage(stage: PipelineStage, hoursSince: number): LeadStatus {
  if (stage === "booked") return "booked";
  if (stage === "clicked" && hoursSince > 24) return "needs_followup";
  if (stage === "emailed" && hoursSince > 12) return "needs_followup";
  if (stage === "paid" && hoursSince > 6) return "needs_followup";
  return ({ new: "new", paid: "paid", intake: "intake_complete", emailed: "email_sent", opened: "opened", clicked: "clicked", booked: "booked" } as const)[stage];
}

function genLeads(clientId: string, count: number, seed: number): Lead[] {
  const r = rng(seed);
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const stageIdx = Math.floor(Math.pow(r(), 1.4) * stageFlow.length);
    const stage = stageFlow[Math.min(stageIdx, 6)];
    const hoursAgo = Math.floor(r() * 96);
    const createdHoursAgo = hoursAgo + Math.floor(r() * 240);
    const fn = firstNames[Math.floor(r() * firstNames.length)];
    const ln = lastNames[Math.floor(r() * lastNames.length)];
    const bt = types[Math.floor(r() * types.length)];
    const lastActivity = new Date(now - hoursAgo * 3600_000).toISOString();
    const createdAt = new Date(now - createdHoursAgo * 3600_000).toISOString();
    const stageOrder = stageFlow.indexOf(stage);
    return {
      id: `${clientId}-L${1000 + i}`,
      clientId,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${["proton.me", "gmail.com", "outlook.com", "fastmail.com"][Math.floor(r() * 4)]}`,
      phone: `+1 (${200 + Math.floor(r() * 700)}) ${100 + Math.floor(r() * 899)}-${1000 + Math.floor(r() * 8999)}`,
      location: cities[Math.floor(r() * cities.length)],
      businessType: bt,
      source: sources[Math.floor(r() * sources.length)],
      payment: stageOrder >= 1 ? "paid" : "unpaid",
      intake: stageOrder >= 2 ? "complete" : "pending",
      booking: stage === "booked" ? "scheduled" : "none",
      stage,
      status: statusFromStage(stage, hoursAgo),
      lastActivity,
      createdAt,
      value: stageOrder >= 1 ? Math.floor(r() * 400 + 100) : undefined,
    };
  });
}

export const leadsByClient: Record<string, Lead[]> = {
  sek: genLeads("sek", 64, 7),
  law: genLeads("law", 38, 21),
  ins: genLeads("ins", 47, 33),
};

const activityTypes: ActivityEvent["type"][] = [
  "lead_captured", "payment_received", "intake_submitted", "email_sent",
  "email_opened", "link_clicked", "appointment_booked", "followup_triggered", "automation_failed",
];

function genActivity(clientId: string, leads: Lead[], seed: number): ActivityEvent[] {
  const r = rng(seed);
  const now = Date.now();
  return Array.from({ length: 40 }, (_, i) => {
    const lead = leads[Math.floor(r() * leads.length)];
    const type = activityTypes[Math.floor(r() * activityTypes.length)];
    const minsAgo = i * (3 + Math.floor(r() * 12)) + Math.floor(r() * 5);
    const labels: Record<ActivityEvent["type"], string> = {
      lead_captured: "submitted intake form",
      payment_received: "completed payment",
      intake_submitted: "submitted intake details",
      crm_created: "added to CRM",
      internal_notified: "internal team notified",
      email_sent: "received booking email",
      email_opened: "opened booking email",
      link_clicked: "clicked booking link",
      appointment_booked: "booked an appointment",
      followup_triggered: "follow-up sequence triggered",
      automation_failed: "automation step failed",
    };
    return {
      id: `${clientId}-A${i}`,
      clientId,
      leadId: lead.id,
      leadName: lead.name,
      type,
      message: labels[type],
      timestamp: new Date(now - minsAgo * 60_000).toISOString(),
    };
  });
}

export const activityByClient: Record<string, ActivityEvent[]> = {
  sek: genActivity("sek", leadsByClient.sek, 11),
  law: genActivity("law", leadsByClient.law, 22),
  ins: genActivity("ins", leadsByClient.ins, 44),
};

// ---- Helpers ----
export const stageLabels: Record<PipelineStage, string> = {
  new: "New",
  paid: "Paid",
  intake: "Intake Submitted",
  emailed: "Emailed",
  opened: "Opened",
  clicked: "Clicked",
  booked: "Booked",
};

export const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  paid: "Paid",
  intake_complete: "Intake Complete",
  email_sent: "Email Sent",
  opened: "Opened",
  clicked: "Clicked",
  booked: "Booked",
  needs_followup: "Needs Follow-up",
  failed: "Failed",
};

export const statusColor: Record<LeadStatus, string> = {
  new: "bg-status-new/15 text-status-new border-status-new/30",
  paid: "bg-status-paid/15 text-status-paid border-status-paid/30",
  intake_complete: "bg-status-intake/15 text-status-intake border-status-intake/30",
  email_sent: "bg-status-emailed/15 text-status-emailed border-status-emailed/30",
  opened: "bg-status-opened/15 text-status-opened border-status-opened/30",
  clicked: "bg-status-clicked/15 text-status-clicked border-status-clicked/30",
  booked: "bg-status-booked/15 text-status-booked border-status-booked/30",
  needs_followup: "bg-status-followup/15 text-status-followup border-status-followup/30",
  failed: "bg-status-failed/15 text-status-failed border-status-failed/30",
};

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function getMetrics(input: string | Lead[]) {
  const leads = Array.isArray(input) ? input : (leadsByClient[input] ?? []);
  const today = leads.filter(l => Date.now() - new Date(l.createdAt).getTime() < 24 * 3600_000);
  const paid = leads.filter(l => l.payment === "paid");
  const booked = leads.filter(l => l.stage === "booked");
  const bookedToday = today.filter(l => l.stage === "booked");
  const notBooked = leads.filter(l => l.stage !== "booked");
  const followups = leads.filter(l => l.status === "needs_followup");
  const failed = leads.filter(l => l.status === "failed").length + Math.floor(leads.length * 0.03);
  const conv = leads.length ? (booked.length / leads.length) * 100 : 0;
  const paidToBooked = paid.length ? (booked.length / paid.length) * 100 : 0;
  const paidToday = today.filter(l => l.payment === "paid");
  const avgTicket = 285;
  const revenueToday = paidToday.reduce((sum, l) => sum + (l.value ?? avgTicket), 0);
  const stuckPaid = leads.filter(l => l.payment === "paid" && l.stage !== "booked");
  const revenueAtRisk = stuckPaid.reduce((sum, l) => sum + (l.value ?? avgTicket), 0);
  // Recovered: leads that needed followup historically but ended up booked — approximate
  const recoveredBookings = Math.max(2, Math.floor(booked.length * 0.18));
  return {
    leadsToday: today.length,
    totalLeads: leads.length,
    paidAssessments: paid.length,
    paidToday: paidToday.length,
    bookingsToday: bookedToday.length,
    conversion: Math.round(conv * 10) / 10,
    paidToBookedConv: Math.round(paidToBooked * 10) / 10,
    leadsNotBooked: notBooked.length,
    pendingFollowups: followups.length,
    failedAutomations: failed,
    revenueToday,
    revenueAtRisk,
    recoveredBookings,
  };
}

export function getStageCounts(input: string | Lead[]) {
  const leads = Array.isArray(input) ? input : (leadsByClient[input] ?? []);
  return stageFlow.map((stage, i) => {
    const count = leads.filter(l => stageFlow.indexOf(l.stage) >= i).length;
    return { stage, count };
  });
}

// Priority action queues
export function getPaidNotBooked(input: string | Lead[]): Lead[] {
  const leads = Array.isArray(input) ? input : (leadsByClient[input] ?? []);
  return leads
    .filter(l => l.payment === "paid" && l.intake === "complete" && l.stage !== "booked")
    .sort((a, b) => new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime())
    .slice(0, 4);
}

export function getClickedNotScheduled(input: string | Lead[]): Lead[] {
  const leads = Array.isArray(input) ? input : (leadsByClient[input] ?? []);
  return leads
    .filter(l => l.stage === "clicked")
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    .slice(0, 4);
}

export function getNeedsFollowup(input: string | Lead[]): Array<Lead & { reason: string; nextAction: string }> {
  const leads = Array.isArray(input) ? input : (leadsByClient[input] ?? []);
  return leads
    .filter(l => l.status === "needs_followup")
    .slice(0, 4)
    .map(l => {
      let reason = "Inactive after engagement";
      let nextAction = "Send follow-up email";
      if (l.stage === "paid") { reason = "Paid 6h+ ago, no intake"; nextAction = "Send intake reminder"; }
      else if (l.stage === "emailed") { reason = "Email sent, not opened in 12h"; nextAction = "Resend with new subject"; }
      else if (l.stage === "clicked") { reason = "Clicked link, no booking 24h+"; nextAction = "SMS + booking nudge"; }
      return { ...l, reason, nextAction };
    });
}
