import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SourceStatus { online: boolean; latency_ms?: number | null; configured: boolean; }

export interface MonitoringPayload {
  success: boolean;
  checked_at: string;
  sources: {
    grafana: SourceStatus;
    prometheus: SourceStatus;
    uptime_kuma: SourceStatus;
    alertmanager: { configured: boolean };
  };
  cluster: {
    nodes_total: number | null;
    nodes_ready: number | null;
    pods_total: number | null;
    pods_ready: number | null;
    deployments_total: number | null;
    deployments_available: number | null;
    deployments_by_namespace: Array<{ metric: any; value: number }>;
  };
  resources: {
    cpu_pct: number | null;
    memory_pct: number | null;
    disk_pct: number | null;
    net_rx_bps: number | null;
    net_tx_bps: number | null;
  };
  alerts: {
    active_count: number;
    items: Array<{ name: string; severity: string; summary: string; starts_at: string; status: string; labels: Record<string, string> }>;
  };
  uptime: {
    monitors: Array<{ id: string; status: string; ping: number | null; time: string | null }>;
    total: number; up: number; down: number;
  };
}

export function useMonitoring(intervalMs = 15_000) {
  return useQuery<MonitoringPayload>({
    queryKey: ["monitoring-proxy"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("monitoring-proxy", { body: {} });
      if (error) throw error;
      return data as MonitoringPayload;
    },
    refetchInterval: intervalMs,
    refetchIntervalInBackground: false,
    staleTime: 5_000,
  });
}

export function fmtBps(n: number | null | undefined) {
  if (n == null) return "—";
  const u = ["B/s", "KB/s", "MB/s", "GB/s"];
  let i = 0; let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${u[i]}`;
}

export function fmtPct(n: number | null | undefined, digits = 1) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n.toFixed(digits)}%`;
}

export function fmtInt(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return Math.round(n).toLocaleString();
}
