// SekInfra monitoring-proxy
// Aggregates Prometheus / Grafana / Uptime Kuma into a single operational payload.
// All upstreams are optional; missing ones report as "offline" / null without faking metrics.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const env = (k: string) => Deno.env.get(k) ?? "";

const PROM = env("PROMETHEUS_URL");
const PROM_TOKEN = env("PROMETHEUS_TOKEN");
const GRAFANA = env("GRAFANA_URL");
const GRAFANA_TOKEN = env("GRAFANA_TOKEN");
const KUMA = env("UPTIME_KUMA_URL");
const ALERTMANAGER = env("ALERTMANAGER_URL");

const TIMEOUT_MS = 6000;

async function ping(url: string, headers: Record<string, string> = {}) {
  if (!url) return { online: false, latency_ms: null as number | null };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const started = performance.now();
  try {
    const r = await fetch(url, { headers, signal: ctrl.signal });
    await r.body?.cancel();
    return { online: r.ok, latency_ms: Math.round(performance.now() - started) };
  } catch {
    return { online: false, latency_ms: null };
  } finally {
    clearTimeout(t);
  }
}

async function promQuery(query: string): Promise<number | null> {
  if (!PROM) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {};
    if (PROM_TOKEN) headers.Authorization = `Bearer ${PROM_TOKEN}`;
    const r = await fetch(`${PROM.replace(/\/$/, "")}/api/v1/query?query=${encodeURIComponent(query)}`, {
      headers, signal: ctrl.signal,
    });
    if (!r.ok) return null;
    const j = await r.json();
    const v = j?.data?.result?.[0]?.value?.[1];
    return v == null ? null : Number(v);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function promQueryAll(query: string): Promise<Array<{ metric: any; value: number }>> {
  if (!PROM) return [];
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {};
    if (PROM_TOKEN) headers.Authorization = `Bearer ${PROM_TOKEN}`;
    const r = await fetch(`${PROM.replace(/\/$/, "")}/api/v1/query?query=${encodeURIComponent(query)}`, {
      headers, signal: ctrl.signal,
    });
    if (!r.ok) return [];
    const j = await r.json();
    return (j?.data?.result ?? []).map((x: any) => ({ metric: x.metric, value: Number(x.value?.[1]) }));
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

async function alertmanagerAlerts(): Promise<any[]> {
  if (!ALERTMANAGER) return [];
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`${ALERTMANAGER.replace(/\/$/, "")}/api/v2/alerts?active=true&silenced=false&inhibited=false`, { signal: ctrl.signal });
    if (!r.ok) return [];
    return await r.json();
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

async function kumaStatus(): Promise<{ online: boolean; monitors: any[] }> {
  if (!KUMA) return { online: false, monitors: [] };
  const base = KUMA.replace(/\/$/, "");
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // Try public status page heartbeat
    const r = await fetch(`${base}/api/status-page/heartbeat/default`, { signal: ctrl.signal });
    if (!r.ok) {
      const p = await ping(base);
      return { online: p.online, monitors: [] };
    }
    const j = await r.json();
    const monitors = Object.entries(j?.heartbeatList ?? {}).map(([id, beats]: any) => {
      const last = Array.isArray(beats) && beats.length ? beats[beats.length - 1] : null;
      return {
        id,
        status: last?.status === 1 ? "up" : last?.status === 0 ? "down" : "unknown",
        ping: last?.ping ?? null,
        time: last?.time ?? null,
      };
    });
    return { online: true, monitors };
  } catch {
    return { online: false, monitors: [] };
  } finally {
    clearTimeout(t);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const checkedAt = new Date().toISOString();

  try {
    const [
      grafanaPing,
      promPing,
      kuma,
      nodeCount,
      podCount,
      podReady,
      deployTotal,
      deployAvail,
      nodeReady,
      cpuPct,
      memPct,
      diskPct,
      netRx,
      netTx,
      amAlerts,
    ] = await Promise.all([
      ping(GRAFANA ? `${GRAFANA.replace(/\/$/, "")}/api/health` : "", GRAFANA_TOKEN ? { Authorization: `Bearer ${GRAFANA_TOKEN}` } : {}),
      ping(PROM ? `${PROM.replace(/\/$/, "")}/-/ready` : "", PROM_TOKEN ? { Authorization: `Bearer ${PROM_TOKEN}` } : {}),
      kumaStatus(),
      promQuery(`count(kube_node_info)`),
      promQuery(`count(kube_pod_info)`),
      promQuery(`sum(kube_pod_status_ready{condition="true"})`),
      promQuery(`sum(kube_deployment_status_replicas)`),
      promQuery(`sum(kube_deployment_status_replicas_available)`),
      promQuery(`sum(kube_node_status_condition{condition="Ready",status="true"})`),
      promQuery(`100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`),
      promQuery(`(1 - (sum(node_memory_MemAvailable_bytes) / sum(node_memory_MemTotal_bytes))) * 100`),
      promQuery(`(1 - (sum(node_filesystem_avail_bytes{fstype!~"tmpfs|overlay"}) / sum(node_filesystem_size_bytes{fstype!~"tmpfs|overlay"}))) * 100`),
      promQuery(`sum(rate(node_network_receive_bytes_total{device!~"lo|docker.*|veth.*|cni.*"}[5m]))`),
      promQuery(`sum(rate(node_network_transmit_bytes_total{device!~"lo|docker.*|veth.*|cni.*"}[5m]))`),
      alertmanagerAlerts(),
    ]);

    const deploymentsByNs = await promQueryAll(
      `sum by (namespace) (kube_deployment_status_replicas_available) / sum by (namespace) (kube_deployment_status_replicas)`
    );

    const alerts = amAlerts.map((a: any) => ({
      name: a.labels?.alertname ?? "alert",
      severity: (a.labels?.severity ?? "info").toLowerCase(),
      summary: a.annotations?.summary ?? a.annotations?.description ?? "",
      starts_at: a.startsAt,
      status: a.status?.state ?? "active",
      labels: a.labels ?? {},
    }));

    const body = {
      success: true,
      checked_at: checkedAt,
      sources: {
        grafana: { online: grafanaPing.online, latency_ms: grafanaPing.latency_ms, configured: !!GRAFANA },
        prometheus: { online: promPing.online, latency_ms: promPing.latency_ms, configured: !!PROM },
        uptime_kuma: { online: kuma.online, configured: !!KUMA },
        alertmanager: { configured: !!ALERTMANAGER },
      },
      cluster: {
        nodes_total: nodeCount,
        nodes_ready: nodeReady,
        pods_total: podCount,
        pods_ready: podReady,
        deployments_total: deployTotal,
        deployments_available: deployAvail,
        deployments_by_namespace: deploymentsByNs,
      },
      resources: {
        cpu_pct: cpuPct,
        memory_pct: memPct,
        disk_pct: diskPct,
        net_rx_bps: netRx,
        net_tx_bps: netTx,
      },
      alerts: {
        active_count: alerts.length,
        items: alerts.slice(0, 50),
      },
      uptime: {
        monitors: kuma.monitors,
        total: kuma.monitors.length,
        up: kuma.monitors.filter(m => m.status === "up").length,
        down: kuma.monitors.filter(m => m.status === "down").length,
      },
    };

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e), checked_at: checkedAt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
