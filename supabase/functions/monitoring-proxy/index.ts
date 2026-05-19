// SekInfra monitoring-proxy
// Operational Control Plane data layer.
// Aggregates Prometheus / Grafana / Alertmanager / Uptime Kuma into typed JSON.
//
// Routing (POST body { path } OR query ?path=):
//   /health        upstream connectivity + health score
//   /cluster       node/pod/deployment summary
//   /resources     cpu/mem/disk/net
//   /alerts        alertmanager firing alerts
//   /deployments   per-namespace deployment availability
//   /nodes         per-node ready state
//   /pods          per-namespace pod phase counts
//   /uptime        uptime kuma monitors
//   /              full operational snapshot (default)
//
// All upstreams are optional. Missing config returns nulls — never fake metrics.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// ---------- env ----------
const env = (k: string, d = "") => Deno.env.get(k) ?? d;

const PROM = env("PROMETHEUS_URL", "http://kube-prometheus-stack-prometheus.monitoring:9090");
const PROM_TOKEN = env("PROMETHEUS_TOKEN");
const GRAFANA = env("GRAFANA_URL", "https://grafana.sekinfra.com");
const GRAFANA_TOKEN = env("GRAFANA_TOKEN");
const ALERTMANAGER = env("ALERTMANAGER_URL");
const KUMA = env("UPTIME_KUMA_URL", "https://kuma.sekinfra.com");

const TIMEOUT_MS = 6000;
const RETRIES = 2;
const STALE_AFTER_MS = 60_000;

// ---------- types ----------
interface SourceStatus { online: boolean; latency_ms: number | null; configured: boolean; error?: string }
interface PromSample { metric: Record<string, string>; value: number }

// ---------- core fetch with timeout + retry ----------
async function safeFetch(url: string, init: RequestInit = {}, attempts = RETRIES): Promise<{ ok: boolean; status: number; json: any; latency_ms: number; error?: string }> {
  let lastErr = "";
  for (let i = 0; i <= attempts; i++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const started = performance.now();
    try {
      const r = await fetch(url, { ...init, signal: ctrl.signal });
      const latency = Math.round(performance.now() - started);
      const ct = r.headers.get("content-type") ?? "";
      const json = ct.includes("application/json") ? await r.json().catch(() => null) : await r.text().catch(() => null);
      clearTimeout(t);
      if (!r.ok && i < attempts) { lastErr = `HTTP ${r.status}`; continue; }
      return { ok: r.ok, status: r.status, json, latency_ms: latency };
    } catch (e) {
      clearTimeout(t);
      lastErr = String(e);
      if (i >= attempts) return { ok: false, status: 0, json: null, latency_ms: Math.round(performance.now() - started), error: lastErr };
    }
  }
  return { ok: false, status: 0, json: null, latency_ms: 0, error: lastErr };
}

function promHeaders(): Record<string, string> {
  return PROM_TOKEN ? { Authorization: `Bearer ${PROM_TOKEN}` } : {};
}
function grafanaHeaders(): Record<string, string> {
  return GRAFANA_TOKEN ? { Authorization: `Bearer ${GRAFANA_TOKEN}` } : {};
}

// ---------- Prometheus helpers ----------
async function promQuery(query: string): Promise<number | null> {
  if (!PROM) return null;
  const url = `${PROM.replace(/\/$/, "")}/api/v1/query?query=${encodeURIComponent(query)}`;
  const r = await safeFetch(url, { headers: promHeaders() });
  if (!r.ok) return null;
  const v = r.json?.data?.result?.[0]?.value?.[1];
  return v == null ? null : Number(v);
}

async function promQueryAll(query: string): Promise<PromSample[]> {
  if (!PROM) return [];
  const url = `${PROM.replace(/\/$/, "")}/api/v1/query?query=${encodeURIComponent(query)}`;
  const r = await safeFetch(url, { headers: promHeaders() });
  if (!r.ok) return [];
  return (r.json?.data?.result ?? []).map((x: any) => ({ metric: x.metric ?? {}, value: Number(x.value?.[1]) }));
}

// ---------- collectors ----------
async function getHealth() {
  const [g, p, am, k] = await Promise.all([
    GRAFANA ? safeFetch(`${GRAFANA.replace(/\/$/, "")}/api/health`, { headers: grafanaHeaders() }, 1) : null,
    PROM ? safeFetch(`${PROM.replace(/\/$/, "")}/-/ready`, { headers: promHeaders() }, 1) : null,
    ALERTMANAGER ? safeFetch(`${ALERTMANAGER.replace(/\/$/, "")}/api/v2/status`, {}, 1) : null,
    KUMA ? safeFetch(`${KUMA.replace(/\/$/, "")}/`, {}, 1) : null,
  ]);
  const sources = {
    grafana: { online: !!g?.ok, latency_ms: g?.latency_ms ?? null, configured: !!GRAFANA, error: g?.error } as SourceStatus,
    prometheus: { online: !!p?.ok, latency_ms: p?.latency_ms ?? null, configured: !!PROM, error: p?.error } as SourceStatus,
    alertmanager: { online: !!am?.ok, latency_ms: am?.latency_ms ?? null, configured: !!ALERTMANAGER, error: am?.error } as SourceStatus,
    uptime_kuma: { online: !!k?.ok, latency_ms: k?.latency_ms ?? null, configured: !!KUMA, error: k?.error } as SourceStatus,
  };
  const configured = Object.values(sources).filter(s => s.configured).length || 1;
  const online = Object.values(sources).filter(s => s.online).length;
  const health_score = Math.round((online / configured) * 100);
  return { sources, health_score };
}

async function getCluster() {
  const [nodesTotal, nodesReady, podsTotal, podsReady, depTotal, depAvail] = await Promise.all([
    promQuery(`count(kube_node_info)`),
    promQuery(`sum(kube_node_status_condition{condition="Ready",status="true"})`),
    promQuery(`count(kube_pod_info)`),
    promQuery(`sum(kube_pod_container_status_ready)`),
    promQuery(`sum(kube_deployment_status_replicas)`),
    promQuery(`sum(kube_deployment_status_replicas_available)`),
  ]);
  return {
    nodes_total: nodesTotal, nodes_ready: nodesReady,
    pods_total: podsTotal, pods_ready: podsReady,
    deployments_total: depTotal, deployments_available: depAvail,
  };
}

async function getResources() {
  const [cpu, mem, disk, rx, tx] = await Promise.all([
    promQuery(`100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`),
    promQuery(`(1 - (sum(node_memory_MemAvailable_bytes) / sum(node_memory_MemTotal_bytes))) * 100`),
    promQuery(`(1 - (sum(node_filesystem_avail_bytes{fstype!~"tmpfs|overlay"}) / sum(node_filesystem_size_bytes{fstype!~"tmpfs|overlay"}))) * 100`),
    promQuery(`sum(rate(node_network_receive_bytes_total{device!~"lo|docker.*|veth.*|cni.*"}[5m]))`),
    promQuery(`sum(rate(node_network_transmit_bytes_total{device!~"lo|docker.*|veth.*|cni.*"}[5m]))`),
  ]);
  return { cpu_pct: cpu, memory_pct: mem, disk_pct: disk, net_rx_bps: rx, net_tx_bps: tx };
}

async function getAlerts() {
  if (!ALERTMANAGER) return { active_count: 0, items: [], configured: false };
  const url = `${ALERTMANAGER.replace(/\/$/, "")}/api/v2/alerts?active=true&silenced=false&inhibited=false`;
  const r = await safeFetch(url);
  const arr = Array.isArray(r.json) ? r.json : [];
  const items = arr.map((a: any) => ({
    name: a.labels?.alertname ?? "alert",
    severity: (a.labels?.severity ?? "info").toLowerCase(),
    summary: a.annotations?.summary ?? a.annotations?.description ?? "",
    starts_at: a.startsAt,
    status: a.status?.state ?? "active",
    labels: a.labels ?? {},
  }));
  return { active_count: items.length, items: items.slice(0, 100), configured: true };
}

async function getDeployments() {
  const samples = await promQueryAll(
    `sum by (namespace, deployment) (kube_deployment_status_replicas_available) / sum by (namespace, deployment) (kube_deployment_status_replicas)`
  );
  return samples.map(s => ({
    namespace: s.metric.namespace ?? "default",
    deployment: s.metric.deployment ?? "unknown",
    availability_ratio: Number.isFinite(s.value) ? s.value : null,
  }));
}

async function getNodes() {
  const samples = await promQueryAll(`kube_node_status_condition{condition="Ready"}`);
  const byNode = new Map<string, { ready: boolean; status: string }>();
  for (const s of samples) {
    const node = s.metric.node ?? "unknown";
    const status = s.metric.status ?? "false";
    if (s.value === 1) byNode.set(node, { ready: status === "true", status });
  }
  return Array.from(byNode.entries()).map(([node, v]) => ({ node, ...v }));
}

async function getPods() {
  const samples = await promQueryAll(`sum by (namespace, phase) (kube_pod_status_phase)`);
  return samples.map(s => ({
    namespace: s.metric.namespace ?? "default",
    phase: s.metric.phase ?? "Unknown",
    count: s.value,
  }));
}

async function getUptime() {
  if (!KUMA) return { configured: false, total: 0, up: 0, down: 0, monitors: [] };
  const r = await safeFetch(`${KUMA.replace(/\/$/, "")}/api/status-page/heartbeat/default`);
  if (!r.ok || !r.json) return { configured: true, total: 0, up: 0, down: 0, monitors: [] };
  const monitors = Object.entries(r.json.heartbeatList ?? {}).map(([id, beats]: any) => {
    const last = Array.isArray(beats) && beats.length ? beats[beats.length - 1] : null;
    return {
      id,
      status: last?.status === 1 ? "up" : last?.status === 0 ? "down" : "unknown",
      ping: last?.ping ?? null,
      time: last?.time ?? null,
    };
  });
  return {
    configured: true,
    total: monitors.length,
    up: monitors.filter(m => m.status === "up").length,
    down: monitors.filter(m => m.status === "down").length,
    monitors,
  };
}

// ---------- response wrapper ----------
function ok(body: any, started: number) {
  const checked_at = new Date().toISOString();
  return new Response(JSON.stringify({
    success: true,
    checked_at,
    response_time_ms: Math.round(performance.now() - started),
    stale: false,
    stale_after_ms: STALE_AFTER_MS,
    ...body,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
function fail(e: unknown, started: number, status = 500) {
  return new Response(JSON.stringify({
    success: false,
    error: String(e),
    checked_at: new Date().toISOString(),
    response_time_ms: Math.round(performance.now() - started),
  }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// ---------- snapshot (default) ----------
async function snapshot() {
  const [health, cluster, resources, alerts, uptime] = await Promise.all([
    getHealth(), getCluster(), getResources(), getAlerts(), getUptime(),
  ]);
  return { ...health, cluster, resources, alerts, uptime };
}

// ---------- legacy shape for current frontend ----------
async function legacySnapshot() {
  const [health, cluster, resources, alerts, uptime, deployByNs] = await Promise.all([
    getHealth(), getCluster(), getResources(), getAlerts(), getUptime(),
    promQueryAll(`sum by (namespace) (kube_deployment_status_replicas_available) / sum by (namespace) (kube_deployment_status_replicas)`),
  ]);
  return {
    sources: health.sources,
    health_score: health.health_score,
    cluster: { ...cluster, deployments_by_namespace: deployByNs },
    resources,
    alerts: { active_count: alerts.active_count, items: alerts.items.slice(0, 50) },
    uptime,
  };
}

// ---------- router ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const started = performance.now();

  let path = "/";
  try {
    const url = new URL(req.url);
    const qp = url.searchParams.get("path");
    if (qp) path = qp;
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (body?.path) path = String(body.path);
    }
  } catch { /* ignore */ }

  path = "/" + path.replace(/^\/+/, "").toLowerCase();
  console.log(`[monitoring-proxy] ${req.method} ${path}`);

  try {
    switch (path) {
      case "/health":      return ok(await getHealth(), started);
      case "/cluster":     return ok({ cluster: await getCluster() }, started);
      case "/resources":   return ok({ resources: await getResources() }, started);
      case "/alerts":      return ok({ alerts: await getAlerts() }, started);
      case "/deployments": return ok({ deployments: await getDeployments() }, started);
      case "/nodes":       return ok({ nodes: await getNodes() }, started);
      case "/pods":        return ok({ pods: await getPods() }, started);
      case "/uptime":      return ok({ uptime: await getUptime() }, started);
      case "/snapshot":    return ok(await snapshot(), started);
      case "/":
      default:             return ok(await legacySnapshot(), started);
    }
  } catch (e) {
    console.error(`[monitoring-proxy] error on ${path}:`, e);
    return fail(e, started);
  }
});
