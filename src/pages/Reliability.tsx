import { PageHeader } from "@/components/page-header";
import { useAlerts, useInfrastructureEvents, useReliabilityEvents, timeAgo } from "@/lib/use-operational";
import { ShieldCheck, Loader2, Activity, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export default function Reliability() {
  const alertsQ = useAlerts();
  const infraQ = useInfrastructureEvents();
  const relQ = useReliabilityEvents();

  const loading = alertsQ.isLoading || infraQ.isLoading || relQ.isLoading;
  const error = alertsQ.error || infraQ.error || relQ.error;

  const metrics = useMemo(() => {
    const alerts = alertsQ.data ?? [];
    const infra = infraQ.data ?? [];
    const rel = relQ.data ?? [];

    const unresolvedAlerts = alerts.filter(a => a.status !== "resolved").length;
    const activeIncidents = rel.filter(r => !r.resolved_at && r.event_type?.toLowerCase().includes("incident")).length;
    const downEvents = infra.filter(e => ["down", "failed", "critical"].includes(e.status?.toLowerCase())).length;

    const lastRecovery = rel
      .filter(r => r.event_type?.toLowerCase().includes("recover") || r.resolved_at)
      .sort((a, b) => new Date(b.resolved_at ?? b.created_at).getTime() - new Date(a.resolved_at ?? a.created_at).getTime())[0];

    const totalSignals = alerts.length + infra.length + rel.length;
    const badSignals = unresolvedAlerts + activeIncidents + downEvents;
    const score = totalSignals === 0 ? 100 : Math.max(0, Math.round(100 - (badSignals / Math.max(totalSignals, 10)) * 100));

    return { unresolvedAlerts, activeIncidents, downEvents, lastRecovery, score, totalSignals };
  }, [alertsQ.data, infraQ.data, relQ.data]);

  const recent = useMemo(() => {
    const items = [
      ...(relQ.data ?? []).map(r => ({ id: r.id, t: r.created_at, kind: "Reliability", title: r.message ?? r.event_type, severity: r.severity })),
      ...(alertsQ.data ?? []).slice(0, 20).map(a => ({ id: a.id, t: a.created_at, kind: "Alert", title: a.message, severity: a.severity })),
      ...(infraQ.data ?? []).slice(0, 20).map(e => ({ id: e.id, t: e.created_at, kind: "Infra", title: e.message ?? `${e.service_name} → ${e.status}`, severity: e.status })),
    ].sort((a, b) => new Date(b.t).getTime() - new Date(a.t).getTime()).slice(0, 50);
    return items;
  }, [alertsQ.data, infraQ.data, relQ.data]);

  return (
    <>
      <PageHeader
        title="Reliability"
        description="Uptime posture, incident load, and recovery telemetry across services."
        actions={loading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reliability score</div>
          <div className={cn("mt-1 metric-number text-3xl font-semibold",
            metrics.score >= 90 ? "text-status-booked" : metrics.score >= 70 ? "text-status-followup" : "text-status-failed")}>
            {metrics.score}
          </div>
          <div className="mt-1 text-[10.5px] text-muted-foreground">{metrics.totalSignals} signals analyzed</div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-3 w-3 text-status-failed" /> Active incidents
          </div>
          <div className="mt-1 metric-number text-2xl font-semibold">{metrics.activeIncidents}</div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Unresolved alerts</div>
          <div className="mt-1 metric-number text-2xl font-semibold">{metrics.unresolvedAlerts}</div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Last recovery</div>
          <div className="mt-1 text-[13px] font-semibold text-foreground truncate">
            {metrics.lastRecovery?.message ?? metrics.lastRecovery?.event_type ?? "—"}
          </div>
          <div className="mt-0.5 text-[10.5px] text-muted-foreground">
            {timeAgo(metrics.lastRecovery?.resolved_at ?? metrics.lastRecovery?.created_at)}
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="border-b border-border/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          Recent reliability signals
        </div>
        {error ? (
          <div className="px-5 py-12 text-center text-[13px] text-status-failed">Failed to load reliability data</div>
        ) : loading ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <ShieldCheck className="mx-auto h-6 w-6 text-status-booked/70" />
            <p className="mt-2 text-[13px] text-foreground">All clear — no live signals yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Reliability events, alerts, and infra signals will aggregate here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50 max-h-[560px] overflow-auto">
            {recent.map(r => (
              <li key={`${r.kind}-${r.id}`} className="flex items-center gap-4 px-5 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface/40">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground truncate">{r.title}</p>
                  <p className="text-[10.5px] text-muted-foreground">{r.kind} · {r.severity}</p>
                </div>
                <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-16 text-right">{timeAgo(r.t)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
