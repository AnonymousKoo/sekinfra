import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lead, LeadStatus, PipelineStage, PaymentStatus, IntakeStatus, BookingStatus } from "./mock-data";

const stageFlow: PipelineStage[] = ["new", "paid", "intake", "emailed", "opened", "clicked", "booked"];

function pick<T>(obj: any, keys: string[], fallback: T): T {
  for (const k of keys) {
    const v = k.split(".").reduce((o, p) => (o == null ? o : o[p]), obj);
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return fallback;
}

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
  const stageName = pick<string>(raw, ["pipeline_stages.name", "pipeline_stage_name", "stage_name", "stage"], "");
  const stage = mapStageName(stageName);

  const payment: PaymentStatus = stageFlow.indexOf(stage) >= stageFlow.indexOf("paid") ? "paid" : "unpaid";
  const intake: IntakeStatus = stageFlow.indexOf(stage) >= stageFlow.indexOf("intake") ? "complete" : "pending";
  const bookingStatus: BookingStatus = stage === "booked" ? "scheduled" : "none";

  const lastActivity = pick<string>(raw, ["last_activity_at", "last_activity", "updated_at"], new Date().toISOString());
  const createdAt = pick<string>(raw, ["stage_entered_at", "created_at", "createdAt"], lastActivity);
  const hoursSince = Math.max(0, (Date.now() - new Date(lastActivity).getTime()) / 3600_000);

  const name = pick<string>(raw, ["clients.name", "client_name", "name", "full_name"], "Unknown Lead");
  const email = pick<string>(raw, ["clients.email", "client_email", "email"], "");
  const followups = pick<number>(raw, ["followup_count"], 0);
  const baseStatus = deriveStatus(stage, hoursSince);
  const status: LeadStatus = followups > 0 && stage !== "booked" ? "needs_followup" : baseStatus;

  return {
    id: pick<string>(raw, ["id", "lead_id", "uuid"], `${clientId}-N${idx}`),
    clientId,
    name,
    email,
    phone: pick<string>(raw, ["phone", "phone_number"], ""),
    location: pick<string>(raw, ["location", "city"], ""),
    businessType: pick<string>(raw, ["business_type", "industry", "type"], "—"),
    source: pick<string>(raw, ["source", "lead_source", "utm_source"], "Direct"),
    payment,
    intake,
    booking: bookingStatus,
    stage,
    status,
    lastActivity,
    createdAt,
    value: pick<number | undefined>(raw, ["pipeline_value", "value", "amount"], undefined),
  };
}

export function useLiveLeads(clientId: string) {
  return useQuery({
    queryKey: ["live-leads", clientId],
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await supabase.functions.invoke("n8n-leads", { method: "GET" });
      if (error) throw error;
      if (data && typeof data === "object" && "success" in data && (data as any).success === false) {
        throw new Error((data as any).error || "n8n request failed");
      }
      // Accept multiple shapes: {data:{leads:[]}}, {leads:[]}, or [...]
      const payload: any = data;
      const list: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data?.leads)
        ? payload.data.leads
        : Array.isArray(payload?.leads)
        ? payload.leads
        : Array.isArray(payload?.data)
        ? payload.data
        : [];
      return list.map((r, i) => normalizeLead(r, clientId, i));
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
