import { useQuery } from "@tanstack/react-query";
import { Lead, LeadStatus, PipelineStage, PaymentStatus, IntakeStatus, BookingStatus } from "./types";

const DASHBOARD_PROXY_URL =
  "https://gnuqaefotwgkwurjpyik.supabase.co/functions/v1/dashboard-proxy";

const stageFlow: PipelineStage[] = ["new", "paid", "intake", "emailed", "opened", "clicked", "booked"];

function deriveStatus(stage: PipelineStage, hoursSince: number): LeadStatus {
  if (stage === "booked") return "booked";
  if (stage === "clicked" && hoursSince > 24) return "needs_followup";
  if (stage === "emailed" && hoursSince > 12) return "needs_followup";
  if (stage === "paid" && hoursSince > 6) return "needs_followup";
  return ({ new: "new", paid: "paid", intake: "intake_complete", emailed: "email_sent", opened: "opened", clicked: "clicked", booked: "booked" } as const)[stage];
}

function mapStageName(name: string): PipelineStage {
  const n = (name || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (stageFlow.includes(n as PipelineStage)) return n as PipelineStage;
  if (n.includes("book")) return "booked";
  if (n.includes("click")) return "clicked";
  if (n.includes("open")) return "opened";
  if (n.includes("email") || n.includes("sent")) return "emailed";
  if (n.includes("intake")) return "intake";
  if (n.includes("paid") || n.includes("payment")) return "paid";
  return "new";
}

function normalizeLead(raw: any, clientId: string, idx: number): Lead {
  // Prefer the API's operational state, then fall back to legacy fields
  const opState: string = raw?.operational_state ?? raw?.stage ?? raw?.pipeline_stages?.name ?? "";
  const stage = mapStageName(opState);

  const payment: PaymentStatus = raw?.payment_received || raw?.payment_status === "paid"
    ? "paid"
    : stageFlow.indexOf(stage) >= stageFlow.indexOf("paid") ? "paid" : "unpaid";
  const intake: IntakeStatus = raw?.intake_status === true || raw?.oia_submitted
    ? "complete"
    : stageFlow.indexOf(stage) >= stageFlow.indexOf("intake") ? "complete" : "pending";
  const bookingStatus: BookingStatus = raw?.booked_call || raw?.booking_status === "booked" || stage === "booked"
    ? "scheduled"
    : "none";

  const lastActivity = raw?.updated_at ?? raw?.last_activity_at ?? raw?.created_at ?? new Date().toISOString();
  const createdAt = raw?.created_at ?? raw?.stage_entered_at ?? lastActivity;
  const hoursSince = Math.max(0, (Date.now() - new Date(lastActivity).getTime()) / 3600_000);

  const name = raw?.display_name ?? raw?.clients?.name ?? raw?.name ?? "Unknown Lead";
  const email = raw?.email ?? raw?.clients?.email ?? "";
  const followups = raw?.followup_count ?? 0;
  const baseStatus = deriveStatus(stage, hoursSince);
  const status: LeadStatus = followups > 0 && stage !== "booked" ? "needs_followup" : baseStatus;

  return {
    id: raw?.id ?? `${clientId}-N${idx}`,
    clientId,
    name,
    email,
    phone: raw?.phone ?? "",
    location: raw?.location ?? "",
    businessType: raw?.business_type ?? "—",
    source: raw?.source ?? "Direct",
    payment,
    intake,
    booking: bookingStatus,
    stage,
    status,
    lastActivity,
    createdAt,
    value: raw?.pipeline_value ?? raw?.payment_amount ?? undefined,

    operationalState: raw?.operational_state ?? undefined,
    lifecycleStage: raw?.lifecycle_stage ?? undefined,
    infrastructureStatus: raw?.infrastructure_status ?? undefined,
    securityStatus: raw?.security_status ?? undefined,
    automationStatus: raw?.automation_status ?? undefined,
    oiaSubmitted: raw?.oia_submitted ?? raw?.intake_status ?? false,
    oiaCompleted: raw?.oia_completed ?? false,
    deploymentStarted: raw?.deployment_started ?? false,
    dashboardReady: raw?.dashboard_ready ?? false,
    goLive: raw?.go_live ?? false,
    paymentReceived: raw?.payment_received ?? false,
    bookedCall: raw?.booked_call ?? false,
    bookingDate: raw?.booking_date ?? null,
    followupCount: raw?.followup_count ?? 0,
    followupStatus: raw?.followup_status ?? undefined,
    nextFollowup: raw?.next_followup ?? null,
    riskLevel: raw?.risk_level ?? undefined,
    uptimePercentage: raw?.uptime_percentage ?? undefined,
    activeAlerts: raw?.active_alerts ?? 0,
    totalIncidents: raw?.total_incidents ?? 0,
    businessName: raw?.business_name ?? null,
    paymentAmount: raw?.payment_amount ?? 0,
  };
}

export interface DashboardPayload {
  leads: Lead[];
  rawLeads: any[];
  summary: Record<string, any>;
  priority_actions: any[];
  pipeline: any[];
  activity: any[];
  automations: any[];
  settings: Record<string, any>;
  infrastructure_summary: Record<string, any>;
  infrastructure_events: any[];
}

async function fetchDashboard(clientId: string): Promise<DashboardPayload> {
  const res = await fetch(DASHBOARD_PROXY_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Dashboard proxy returned ${res.status}`);
  const payload = await res.json();
  if (payload && payload.success === false) throw new Error("Dashboard API failed");
  const data = payload?.data ?? {};

  const rawLeads: any[] = Array.isArray(data.leads) ? data.leads : [];
  const leads = rawLeads.map((r, i) => normalizeLead(r, clientId, i));

  return {
    leads,
    rawLeads,
    summary: data.summary ?? {},
    priority_actions: Array.isArray(data.priority_actions) ? data.priority_actions : [],
    pipeline: Array.isArray(data.pipeline) ? data.pipeline : [],
    activity: Array.isArray(data.activity) ? data.activity : [],
    automations: Array.isArray(data.automations) ? data.automations : [],
    settings: data.settings ?? {},
    infrastructure_summary: data.infrastructure_summary ?? {},
    infrastructure_events: Array.isArray(data.infrastructure_events) ? data.infrastructure_events : [],
  };
}

export function useDashboardData(clientId: string) {
  return useQuery({
    queryKey: ["dashboard-proxy", clientId],
    queryFn: () => fetchDashboard(clientId),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useLiveLeads(clientId: string) {
  const query = useDashboardData(clientId);
  return {
    ...query,
    data: query.data?.leads ?? [],
  } as typeof query & { data: Lead[] };
}
