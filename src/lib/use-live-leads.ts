import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lead, LeadStatus, PipelineStage, PaymentStatus, IntakeStatus, BookingStatus } from "./mock-data";

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
  const stageName = raw?.pipeline_stages?.name ?? "";
  const stage = mapStageName(stageName);

  const payment: PaymentStatus = stageFlow.indexOf(stage) >= stageFlow.indexOf("paid") ? "paid" : "unpaid";
  const intake: IntakeStatus = stageFlow.indexOf(stage) >= stageFlow.indexOf("intake") ? "complete" : "pending";
  const bookingStatus: BookingStatus = stage === "booked" ? "scheduled" : "none";

  const lastActivity = raw?.last_activity_at ?? new Date().toISOString();
  const createdAt = raw?.stage_entered_at ?? lastActivity;
  const hoursSince = Math.max(0, (Date.now() - new Date(lastActivity).getTime()) / 3600_000);

  const name = raw?.clients?.name ?? "Unknown Lead";
  const email = raw?.clients?.email ?? "";
  const followups = raw?.followup_count ?? 0;
  const baseStatus = deriveStatus(stage, hoursSince);
  const status: LeadStatus = followups > 0 && stage !== "booked" ? "needs_followup" : baseStatus;

  return {
    id: raw?.id ?? `${clientId}-N${idx}`,
    clientId,
    name,
    email,
    phone: "",
    location: "",
    businessType: "—",
    source: "Direct",
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

export function useLiveLeads(clientId: string) {
  return useQuery({
    queryKey: ["live-leads", clientId],
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await (supabase as any)
        .from("leads")
        .select(`
          id,
          pipeline_value,
          followup_count,
          stage_entered_at,
          last_activity_at,
          clients(name, email),
          pipeline_stages(name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Leads query error:", error);
        throw error;
      }
      return (data ?? []).map((r: any, i: number) => normalizeLead(r, clientId, i));
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
