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

function normalizeLead(raw: any, clientId: string, idx: number): Lead {
  const payment = (pick<string>(raw, ["payment_status", "payment", "paid"], "unpaid")?.toString().toLowerCase() === "paid" || raw.paid === true) ? "paid" : "unpaid";
  const intake = (pick<string>(raw, ["intake_status", "intake"], "pending")?.toString().toLowerCase() === "complete" || raw.intake === true) ? "complete" : "pending";
  const booking = pick<string>(raw, ["booking_status", "booking"], "none")?.toString().toLowerCase();
  const bookingStatus: BookingStatus = ["scheduled", "completed", "no_show"].includes(booking) ? booking as BookingStatus : "none";

  let stage = pick<string>(raw, ["stage", "pipeline_stage"], "")?.toString().toLowerCase() as PipelineStage;
  if (!stageFlow.includes(stage)) {
    if (bookingStatus === "scheduled" || bookingStatus === "completed") stage = "booked";
    else if (intake === "complete") stage = "intake";
    else if (payment === "paid") stage = "paid";
    else stage = "new";
  }
  const lastActivity = pick<string>(raw, ["last_activity", "updated_at", "lastActivity"], new Date().toISOString());
  const createdAt = pick<string>(raw, ["created_at", "createdAt", "created"], lastActivity);
  const hoursSince = Math.max(0, (Date.now() - new Date(lastActivity).getTime()) / 3600_000);

  const fullName = pick<string>(raw, ["name", "full_name", "lead_name"], "Unknown Lead");
  return {
    id: pick<string>(raw, ["id", "lead_id", "uuid"], `${clientId}-N${idx}`),
    clientId,
    name: fullName,
    email: pick<string>(raw, ["email", "email_address"], ""),
    phone: pick<string>(raw, ["phone", "phone_number"], ""),
    location: pick<string>(raw, ["location", "city"], ""),
    businessType: pick<string>(raw, ["business_type", "industry", "type"], "—"),
    source: pick<string>(raw, ["source", "lead_source", "utm_source"], "Direct"),
    payment: payment as PaymentStatus,
    intake: intake as IntakeStatus,
    booking: bookingStatus,
    stage,
    status: deriveStatus(stage, hoursSince),
    lastActivity,
    createdAt,
    value: pick<number | undefined>(raw, ["value", "amount", "ticket"], undefined),
  };
}

export function useLiveLeads(clientId: string) {
  return useQuery({
    queryKey: ["live-leads", clientId],
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await supabase.functions.invoke("n8n-leads");
      if (error) throw error;
      const payload = (data as any)?.data;
      const list: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.leads) ? payload.leads
        : Array.isArray(payload?.data) ? payload.data
        : Array.isArray(payload?.results) ? payload.results
        : [];
      return list.map((r, i) => normalizeLead(r, clientId, i));
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
