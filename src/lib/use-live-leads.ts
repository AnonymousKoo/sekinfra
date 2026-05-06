import { useQuery } from "@tanstack/react-query";
import { Lead, LeadStatus, PipelineStage, PaymentStatus, IntakeStatus, BookingStatus } from "./mock-data";

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
  const stageName = raw?.pipeline_stages?.name ?? raw?.stage_name ?? raw?.stage ?? "";
  const stage = mapStageName(stageName);

  const payment: PaymentStatus = stageFlow.indexOf(stage) >= stageFlow.indexOf("paid") ? "paid" : "unpaid";
  const intake: IntakeStatus = stageFlow.indexOf(stage) >= stageFlow.indexOf("intake") ? "complete" : "pending";
  const bookingStatus: BookingStatus = stage === "booked" ? "scheduled" : "none";

  const lastActivity = raw?.last_activity_at ?? new Date().toISOString();
  const createdAt = raw?.stage_entered_at ?? lastActivity;
  const hoursSince = Math.max(0, (Date.now() - new Date(lastActivity).getTime()) / 3600_000);

  const name = raw?.clients?.name ?? raw?.client_name ?? raw?.name ?? "Unknown Lead";
  const email = raw?.clients?.email ?? raw?.client_email ?? raw?.email ?? "";
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
    value: raw?.pipeline_value ?? undefined,
  };
}

export interface DashboardPayload {
  leads: Lead[];
  summary: Record<string, any>;
  priority_actions: any[];
  pipeline: any[];
  activity: any[];
  automations: any[];
  settings: Record<string, any>;
}

async function fetchDashboard(clientId: string): Promise<DashboardPayload> {
  const res = await fetch(DASHBOARD_PROXY_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: DASHBOARD_PROXY_ANON_KEY,
      Authorization: `Bearer ${DASHBOARD_PROXY_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Dashboard proxy returned ${res.status}`);
  const payload = await res.json();
  const data = payload?.data ?? payload ?? {};

  const rawLeads: any[] = Array.isArray(data.leads) ? data.leads : [];
  const leads = rawLeads.map((r, i) => normalizeLead(r, clientId, i));

  return {
    leads,
    summary: data.summary ?? {},
    priority_actions: Array.isArray(data.priority_actions) ? data.priority_actions : [],
    pipeline: Array.isArray(data.pipeline) ? data.pipeline : [],
    activity: Array.isArray(data.activity) ? data.activity : [],
    automations: Array.isArray(data.automations) ? data.automations : [],
    settings: data.settings ?? {},
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
