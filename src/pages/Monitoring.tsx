import { PageHeader } from "@/components/page-header";
import { useAlerts, sevClass, timeAgo } from "@/lib/use-operational";
import { Radio, Loader2, X, BellRing, AlertTriangle, CircleCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "resolved", label: "Resolved" },
];

export default function Monitoring() {
  const { data, isLoading, error } = useAlerts();
  const [filter, setFilter] = useState("all");
  const [drawer, setDrawer] = useState<any>(null);

  const alerts = data ?? [];

  const stats = useMemo(() => ({
    active: alerts.filter(a => a.status === "active").length,
    critical: alerts.filter(a => ["critical", "high", "crit"].includes(a.severity?.toLowerCase())).length,
    resolved: alerts.filter(a => a.status === "resolved").length,
  }), [alerts]);

  const visible = useMemo(() => {
    if (filter === "all") return alerts;
    return alerts.filter(a => a.status === filter);
  }, [alerts, filter]);

  return (
    <>
      <PageHeader
        title="Monitoring"
        description="Active monitoring alerts across SIEM, uptime probes, and metric streams."
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="card-surface p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <BellRing className="h-3 w-3 text-primary" /> Active
          </div>
          <div className="mt-1 metric-number text-xl font-semibold">{stats.active}</div>
        </div>
        <div className="card-surface p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-3 w-3 text-status-failed" /> Critical/High
          </div>
          <div className="mt-1 metric-number text-xl font-semibold">{stats.critical}</div>
        </div>
        <div className="card-surface p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <CircleCheck className="h-3 w-3 text-status-booked" /> Resolved
          </div>
          <div className="mt-1 metric-number text-xl font-semibold">{stats.resolved}</div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-border/60 p-3">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                filter === f.key
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {error ? (
          <div className="px-5 py-12 text-center text-[13px] text-status-failed">Failed to load alerts</div>
        ) : isLoading ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">Loading alerts…</div>
        ) : visible.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Radio className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-[13px] text-foreground">No live alerts yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Monitoring sources will surface alerts here as they fire.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50 max-h-[640px] overflow-auto">
            {visible.map(a => (
              <li key={a.id} onClick={() => setDrawer(a)} className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-surface-elevated/40">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface/40">
                  <BellRing className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground truncate">{a.message}</p>
                  <p className="text-[10.5px] text-muted-foreground">{a.source ?? "—"} · {a.service ?? "—"} · {a.status}</p>
                </div>
                <span className={cn("rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold", sevClass(a.severity))}>
                  {a.severity}
                </span>
                <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-16 text-right">{timeAgo(a.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm" onClick={() => setDrawer(null)}>
          <div className="h-full w-full max-w-md overflow-auto border-l border-border bg-background p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Alert</div>
                <h3 className="text-[15px] font-semibold">{drawer.message}</h3>
              </div>
              <button onClick={() => setDrawer(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <pre className="rounded-md border border-border/60 bg-surface/40 p-3 text-[10.5px] text-muted-foreground overflow-auto max-h-[70vh]">
              {JSON.stringify(drawer, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
