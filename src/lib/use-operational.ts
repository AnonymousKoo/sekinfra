import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AlertRow {
  id: string;
  created_at: string;
  severity: string;
  status: string;
  source: string | null;
  service: string | null;
  message: string;
  payload: any;
  acknowledged_at: string | null;
  resolved_at: string | null;
}

export interface InfraEventRow {
  id: string;
  created_at: string;
  service_name: string;
  status: string;
  source: string | null;
  message: string | null;
  payload: any;
}

export interface ReliabilityEventRow {
  id: string;
  created_at: string;
  event_type: string;
  service: string | null;
  severity: string;
  message: string | null;
  resolved_at: string | null;
  payload: any;
}

const PAGE = 200;

export function useAlerts() {
  return useQuery({
    queryKey: ["ops", "alerts"],
    queryFn: async (): Promise<AlertRow[]> => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(PAGE);
      if (error) throw error;
      return (data ?? []) as AlertRow[];
    },
    refetchInterval: 60_000,
  });
}

export function useInfrastructureEvents() {
  return useQuery({
    queryKey: ["ops", "infrastructure_events"],
    queryFn: async (): Promise<InfraEventRow[]> => {
      const { data, error } = await supabase
        .from("infrastructure_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(PAGE);
      if (error) throw error;
      return (data ?? []) as InfraEventRow[];
    },
    refetchInterval: 60_000,
  });
}

export function useReliabilityEvents() {
  return useQuery({
    queryKey: ["ops", "reliability_events"],
    queryFn: async (): Promise<ReliabilityEventRow[]> => {
      const { data, error } = await supabase
        .from("reliability_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(PAGE);
      if (error) throw error;
      return (data ?? []) as ReliabilityEventRow[];
    },
    refetchInterval: 60_000,
  });
}

export const SEV_BADGE: Record<string, string> = {
  info: "bg-status-booked/15 text-status-booked border-status-booked/30",
  low: "bg-status-booked/15 text-status-booked border-status-booked/30",
  warning: "bg-status-followup/15 text-status-followup border-status-followup/30",
  warn: "bg-status-followup/15 text-status-followup border-status-followup/30",
  medium: "bg-status-followup/15 text-status-followup border-status-followup/30",
  high: "bg-status-failed/15 text-status-failed border-status-failed/30",
  critical: "bg-status-failed/15 text-status-failed border-status-failed/30",
  crit: "bg-status-failed/15 text-status-failed border-status-failed/30",
};

export function sevClass(s: string) {
  return SEV_BADGE[s?.toLowerCase()] ?? SEV_BADGE.info;
}

export function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
