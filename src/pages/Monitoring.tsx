import { PageHeader } from "@/components/page-header";
import { useMonitoring, fmtPct, fmtInt, fmtBps } from "@/lib/use-monitoring";
import { SourcePill } from "@/components/monitoring/source-pill";
import { ResourceBar } from "@/components/monitoring/resource-bar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, AlertTriangle, Box, Cpu, HardDrive, MemoryStick, Network,
  RefreshCw, Server, ShieldAlert, Layers, CheckCircle2, XCircle, Loader2, Wifi, WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { sevClass, timeAgo } from "@/lib/use-operational";

const INTERVALS = [
  { label: "5s",  ms: 5_000  },
  { label: "15s", ms: 15_000 },
  { label: "30s", ms: 30_000 },
  { label: "1m",  ms: 60_000 },
  { label: "off", ms: 0 },
];

export default function Monitoring() {
  const [intervalMs, setIntervalMs] = useState(15_000);
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useMonitoring(intervalMs || 0);

  const stale = useMemo(() => {
    if (!dataUpdatedAt) return false;
    return Date.now() - dataUpdatedAt > 60_000;
  }, [dataUpdatedAt]);

  const sources = data?.sources;
  const cluster = data?.cluster;
  const resources = data?.resources;
  const alerts = data?.alerts;
  const uptime = data?.uptime;

  const anySourceOnline = sources && (sources.grafana.online || sources.prometheus.online || sources.uptime_kuma.online);

  return (
    <>
      <PageHeader
        title="Operational Control Plane"
        description="Real-time visibility across the K3s cluster, observability stack, and infrastructure perimeter."
        actions={
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10.5px] uppercase tracking-wider",
              anySourceOnline ? "border-status-booked/40 text-status-booked bg-status-booked/10"
              : "border-status-failed/40 text-status-failed bg-status-failed/10")}>
              {anySourceOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {anySourceOnline ? "live" : "offline"}
            </div>
            {stale && (
              <span className="rounded-md border border-status-followup/40 bg-status-followup/10 px-2 py-1 text-[10.5px] uppercase tracking-wider text-status-followup">
                stale
              </span>
            )}
            <div className="flex overflow-hidden rounded-md border border-border/60 bg-surface/40">
              {INTERVALS.map(i => (
                <button key={i.label}
                  onClick={() => setIntervalMs(i.ms)}
                  className={cn("px-2 py-1 text-[10.5px] uppercase tracking-wider transition-colors",
                    intervalMs === i.ms ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}>
                  {i.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="h-7 gap-1.5 text-[11px]">
              <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} /> Refresh
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-md border border-status-failed/40 bg-status-failed/10 px-4 py-3 text-[12px] text-status-failed">
          monitoring-proxy unreachable — {String((error as any)?.message ?? error)}
        </div>
      )}

      {/* Source perimeter */}
      <section className="mb-6">
        <SectionTitle icon={Server}>Infrastructure Status</SectionTitle>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading || !sources ? (
            <>{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</>
          ) : (
            <>
              <SourcePill label="Grafana" online={sources.grafana.online} configured={sources.grafana.configured} latency={sources.grafana.latency_ms} />
              <SourcePill label="Prometheus" online={sources.prometheus.online} configured={sources.prometheus.configured} latency={sources.prometheus.latency_ms} />
              <SourcePill label="Uptime Kuma" online={sources.uptime_kuma.online} configured={sources.uptime_kuma.configured} />
              <SourcePill label="Alertmanager" online={(alerts?.active_count ?? 0) >= 0 && sources.alertmanager.configured} configured={sources.alertmanager.configured} />
            </>
          )}
        </div>
      </section>

      {/* Cluster health */}
      <section className="mb-6">
        <SectionTitle icon={Layers}>Cluster Health</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ClusterTile icon={Server} label="Nodes" primary={fmtInt(cluster?.nodes_ready)} secondary={`/ ${fmtInt(cluster?.nodes_total)} ready`} tone={tonePair(cluster?.nodes_ready, cluster?.nodes_total)} loading={isLoading} />
          <ClusterTile icon={Box} label="Pods" primary={fmtInt(cluster?.pods_ready)} secondary={`/ ${fmtInt(cluster?.pods_total)} ready`} tone={tonePair(cluster?.pods_ready, cluster?.pods_total)} loading={isLoading} />
          <ClusterTile icon={Layers} label="Deployments" primary={fmtInt(cluster?.deployments_available)} secondary={`/ ${fmtInt(cluster?.deployments_total)} available`} tone={tonePair(cluster?.deployments_available, cluster?.deployments_total)} loading={isLoading} />
          <ClusterTile icon={AlertTriangle} label="Active alerts" primary={fmtInt(alerts?.active_count)} secondary="from Alertmanager" tone={(alerts?.active_count ?? 0) > 0 ? "warn" : "ok"} loading={isLoading} />
        </div>
      </section>

      {/* Resources */}
      <section className="mb-6">
        <SectionTitle icon={Cpu}>Resource Consumption</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ResourceBar label="CPU" pct={resources?.cpu_pct ?? null} hint="cluster-wide 5m avg" />
          <ResourceBar label="Memory" pct={resources?.memory_pct ?? null} hint="MemAvailable vs total" />
          <ResourceBar label="Disk" pct={resources?.disk_pct ?? null} hint="non-tmpfs filesystems" />
          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground">Network</span>
              <Network className="h-3 w-3 text-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-3 text-[13px] font-semibold tabular">
              <span className="text-status-booked">↓ {fmtBps(resources?.net_rx_bps ?? null)}</span>
              <span className="text-status-followup">↑ {fmtBps(resources?.net_tx_bps ?? null)}</span>
            </div>
            <p className="mt-1.5 text-[10.5px] text-muted-foreground">rx / tx, external interfaces</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active alerts */}
        <section className="lg:col-span-2">
          <SectionTitle icon={ShieldAlert}>Active Alerts</SectionTitle>
          <div className="card-surface overflow-hidden">
            {isLoading ? (
              <div className="space-y-px">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : !alerts || alerts.items.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="All systems nominal"
                body="No firing alerts reported by Alertmanager."
              />
            ) : (
              <ul className="divide-y divide-border/50 max-h-[420px] overflow-auto">
                {alerts.items.map((a, i) => (
                  <motion.li key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-surface-elevated/40">
                    <span className={cn("mt-0.5 rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold", sevClass(a.severity))}>
                      {a.severity}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-foreground truncate">{a.name}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{a.summary || "—"}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground/70 tabular">
                        {a.labels?.namespace ?? ""} {a.labels?.pod ? `· ${a.labels.pod}` : ""}
                      </p>
                    </div>
                    <span className="text-[10.5px] tabular text-muted-foreground whitespace-nowrap">{timeAgo(a.starts_at)}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>

          {/* Deployments */}
          <div className="mt-6">
            <SectionTitle icon={Layers}>Deployment Status</SectionTitle>
            <div className="card-surface overflow-hidden">
              {isLoading ? (
                <Skeleton className="h-24" />
              ) : !cluster?.deployments_by_namespace?.length ? (
                <EmptyState icon={Layers} title="No deployment telemetry" body="Connect Prometheus to populate deployment availability." />
              ) : (
                <ul className="divide-y divide-border/50">
                  {cluster.deployments_by_namespace.slice(0, 12).map((d, i) => {
                    const pct = Math.round((d.value || 0) * 100);
                    const tone = pct >= 100 ? "ok" : pct >= 75 ? "warn" : "crit";
                    return (
                      <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-[12px] text-foreground w-40 truncate">{d.metric?.namespace ?? "—"}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                          <div className={cn("h-full transition-all",
                            tone === "ok" ? "bg-status-booked" : tone === "warn" ? "bg-status-followup" : "bg-status-failed")}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-12 text-right text-[11px] tabular text-muted-foreground">{pct}%</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Uptime + summary */}
        <section className="space-y-6">
          <div>
            <SectionTitle icon={Activity}>Uptime Metrics</SectionTitle>
            <div className="card-surface p-4">
              {isLoading ? (
                <Skeleton className="h-20" />
              ) : !uptime || uptime.total === 0 ? (
                <EmptyState icon={Activity} title="No monitors" body="Configure Uptime Kuma to surface endpoint health." compact />
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Stat label="Up" value={uptime.up} tone="ok" />
                    <Stat label="Down" value={uptime.down} tone="crit" />
                    <Stat label="Total" value={uptime.total} tone="muted" />
                  </div>
                  <ul className="mt-3 divide-y divide-border/50 max-h-[260px] overflow-auto">
                    {uptime.monitors.slice(0, 20).map((m) => (
                      <li key={m.id} className="flex items-center gap-2 py-1.5">
                        {m.status === "up" ? <CheckCircle2 className="h-3 w-3 text-status-booked" />
                          : m.status === "down" ? <XCircle className="h-3 w-3 text-status-failed" />
                          : <Activity className="h-3 w-3 text-muted-foreground" />}
                        <span className="flex-1 text-[12px] text-foreground truncate">monitor {m.id}</span>
                        <span className="text-[10px] tabular text-muted-foreground">{m.ping != null ? `${m.ping}ms` : "—"}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div>
            <SectionTitle icon={CheckCircle2}>Operational Summary</SectionTitle>
            <div className="card-surface p-4 space-y-2 text-[12px]">
              <SummaryRow icon={Cpu} label="CPU pressure" value={fmtPct(resources?.cpu_pct)} />
              <SummaryRow icon={MemoryStick} label="Memory pressure" value={fmtPct(resources?.memory_pct)} />
              <SummaryRow icon={HardDrive} label="Disk pressure" value={fmtPct(resources?.disk_pct)} />
              <SummaryRow icon={Box} label="Pod readiness" value={cluster?.pods_total ? `${fmtInt(cluster.pods_ready)} / ${fmtInt(cluster.pods_total)}` : "—"} />
              <SummaryRow icon={AlertTriangle} label="Active alerts" value={fmtInt(alerts?.active_count)} />
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10.5px] uppercase tracking-wider text-muted-foreground">
                <span>last checked</span>
                <span className="tabular flex items-center gap-1.5">
                  {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
                  {data?.checked_at ? timeAgo(data.checked_at) : "—"}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
      <Icon className="h-3 w-3 text-primary" /> {children}
    </div>
  );
}

function tonePair(ready?: number | null, total?: number | null): "ok" | "warn" | "crit" | "muted" {
  if (ready == null || total == null || total === 0) return "muted";
  const pct = (ready / total) * 100;
  if (pct >= 95) return "ok";
  if (pct >= 75) return "warn";
  return "crit";
}

function ClusterTile({ icon: Icon, label, primary, secondary, tone, loading }: { icon: any; label: string; primary: string; secondary: string; tone: "ok" | "warn" | "crit" | "muted"; loading: boolean }) {
  const color =
    tone === "ok" ? "text-status-booked" :
    tone === "warn" ? "text-status-followup" :
    tone === "crit" ? "text-status-failed" : "text-foreground";
  if (loading) return <Skeleton className="h-24" />;
  return (
    <motion.div whileHover={{ y: -2 }} className="card-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={cn("h-3.5 w-3.5", color)} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={cn("metric-number text-[26px] font-semibold tabular", color)}>{primary}</span>
        <span className="text-[10.5px] text-muted-foreground">{secondary}</span>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "ok" | "crit" | "muted" }) {
  const color = tone === "ok" ? "text-status-booked" : tone === "crit" ? "text-status-failed" : "text-foreground";
  return (
    <div>
      <div className={cn("metric-number text-xl font-semibold tabular", color)}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3 w-3" /> {label}</span>
      <span className="tabular font-medium text-foreground">{value}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body, compact }: { icon: any; title: string; body: string; compact?: boolean }) {
  return (
    <div className={cn("text-center", compact ? "py-6" : "py-12 px-5")}>
      <Icon className="mx-auto h-6 w-6 text-muted-foreground/60" />
      <p className="mt-2 text-[13px] text-foreground">{title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{body}</p>
    </div>
  );
}
