import { PageHeader } from "@/components/page-header";
import { useIncidentLogs, sevClass, timeAgo } from "@/lib/use-operational";
import { AlertOctagon, Loader2, X, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

function durationLabel(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

export default function Incidents() {
  const { data, isLoading, error } = useIncidentLogs();
  const [drawer, setDrawer] = useState<any>(null);
  const incidents = data ?? [];

  const stats = useMemo(() => {
    const active = incidents.filter(i => i.status !== "resolved" && !i.resolved_at);
    const resolved = incidents.filter(i => i.status === "resolved" || i.resolved_at);
    const durations = resolved
      .map(i => i.resolved_at ? new Date(i.resolved_at).getTime() - new Date(i.created_at).getTime() : 0)
      .filter(n => n > 0);
    const mttr = durations.length ? durations.reduce((s, n) => s + n, 0) / durations.length : 0;
    const critical = incidents.filter(i => i.severity?.toLowerCase() === "critical" && i.status !== "resolved").length;
    return { active: active.length, resolved: resolved.length, total: incidents.length, mttr, critical };
  }, [incidents]);

  return (
    <>
      <PageHeader
        title="Incidents"
        description="Workflow and node-level incident telemetry across the operational pipeline."
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active" value={stats.active} tone="warn" />
        <Stat label="Critical open" value={stats.critical} tone="crit" />
        <Stat label="Resolved" value={stats.resolved} tone="ok" />
        <Stat label="MTTR" value={durationLabel(stats.mttr)} tone="info" icon={Clock} />
      </div>

      <div className="card-surface overflow-hidden">
        <div className="border-b border-border/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          Incident log
        </div>
        {error ? (
          <div className="px-5 py-12 text-center text-[13px] text-status-failed">Failed to load incident logs</div>
        ) : isLoading ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">Loading…</div>
        ) : incidents.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <AlertOctagon className="mx-auto h-6 w-6 text-status-booked/70" />
            <p className="mt-2 text-[13px] text-foreground">No active operational incidents.</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Workflow failures will stream here as they occur.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50 max-h-[640px] overflow-auto">
            {incidents.map(i => {
              const resolved = i.status === "resolved" || !!i.resolved_at;
              const dur = i.resolved_at ? new Date(i.resolved_at).getTime() - new Date(i.created_at).getTime() : Date.now() - new Date(i.created_at).getTime();
              return (
                <li key={i.id} onClick={() => setDrawer(i)} className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-surface-elevated/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface/40">
                    <AlertOctagon className={cn("h-4 w-4", resolved ? "text-muted-foreground" : "text-status-failed")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground truncate">{i.workflow_name ?? "workflow"} · <span className="text-muted-foreground">{i.node_name ?? "node"}</span></p>
                    <p className="text-[10.5px] text-muted-foreground truncate">{i.error_message ?? "—"}</p>
                  </div>
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold", sevClass(i.severity))}>
                    {i.severity}
                  </span>
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold",
                    resolved
                      ? "bg-status-booked/15 text-status-booked border-status-booked/30"
                      : "bg-status-failed/15 text-status-failed border-status-failed/30")}>
                    {resolved ? "resolved" : i.status}
                  </span>
                  <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-20 text-right">{durationLabel(dur)}</span>
                  <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-16 text-right">{timeAgo(i.created_at)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm" onClick={() => setDrawer(null)}>
          <div className="h-full w-full max-w-md overflow-auto border-l border-border bg-background p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Incident</div>
                <h3 className="text-[15px] font-semibold">{drawer.workflow_name ?? "workflow"} → {drawer.node_name ?? "node"}</h3>
              </div>
              <button onClick={() => setDrawer(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <p className="mb-3 text-[12px] text-foreground/90">{drawer.error_message ?? "—"}</p>
            <pre className="rounded-md border border-border/60 bg-surface/40 p-3 text-[10.5px] text-muted-foreground overflow-auto max-h-[60vh]">
              {JSON.stringify(drawer, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, tone, icon: Icon }: { label: string; value: string | number; tone: "ok" | "warn" | "crit" | "info"; icon?: any }) {
  const color = tone === "ok" ? "text-status-booked" : tone === "warn" ? "text-status-followup" : tone === "crit" ? "text-status-failed" : "text-primary";
  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {Icon ? <Icon className={cn("h-3 w-3", color)} /> : <span className={cn("h-1.5 w-1.5 rounded-full", color.replace("text-", "bg-"))} />} {label}
      </div>
      <div className="mt-1 metric-number text-2xl font-semibold">{value}</div>
    </div>
  );
}
