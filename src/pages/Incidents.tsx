import { PageHeader } from "@/components/page-header";
import { useAlerts, useReliabilityEvents, sevClass, timeAgo } from "@/lib/use-operational";
import { AlertOctagon, Loader2, AlertTriangle, ShieldCheck, Activity, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export default function Incidents() {
  const alertsQ = useAlerts();
  const relQ = useReliabilityEvents();
  const [drawer, setDrawer] = useState<any>(null);

  const loading = alertsQ.isLoading || relQ.isLoading;
  const error = alertsQ.error || relQ.error;

  const incidents = useMemo(() => {
    const fromAlerts = (alertsQ.data ?? [])
      .filter(a => ["high", "critical", "crit"].includes(a.severity?.toLowerCase()))
      .map(a => ({
        id: a.id,
        timestamp: a.created_at,
        title: a.message,
        severity: a.severity,
        status: a.status,
        source: a.source ?? a.service ?? "alert",
        resolved: !!a.resolved_at,
        raw: a,
      }));
    const fromRel = (relQ.data ?? [])
      .filter(r => r.event_type?.toLowerCase().includes("incident") || r.event_type?.toLowerCase().includes("degrad"))
      .map(r => ({
        id: r.id,
        timestamp: r.created_at,
        title: r.message ?? r.event_type,
        severity: r.severity,
        status: r.resolved_at ? "resolved" : "open",
        source: r.service ?? "reliability",
        resolved: !!r.resolved_at,
        raw: r,
      }));
    return [...fromAlerts, ...fromRel].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [alertsQ.data, relQ.data]);

  const active = incidents.filter(i => !i.resolved);
  const resolved = incidents.filter(i => i.resolved);

  return (
    <>
      <PageHeader
        title="Incidents"
        description="Active and historical incidents across alerts and reliability events."
        actions={loading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat icon={AlertTriangle} label="Active" value={active.length} tone="crit" />
        <Stat icon={Activity} label="Total" value={incidents.length} tone="info" />
        <Stat icon={ShieldCheck} label="Resolved" value={resolved.length} tone="ok" />
      </div>

      <div className="card-surface overflow-hidden">
        <div className="border-b border-border/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          Incident timeline
        </div>
        {error ? (
          <EmptyState message="Failed to load incidents" sub={(error as Error).message} tone="error" />
        ) : loading ? (
          <EmptyState message="Loading incidents…" />
        ) : incidents.length === 0 ? (
          <EmptyState message="No live incidents yet" sub="Alerts and reliability events will appear here as they occur." />
        ) : (
          <ul className="divide-y divide-border/50 max-h-[640px] overflow-auto">
            {incidents.map(i => (
              <li
                key={i.id}
                onClick={() => setDrawer(i)}
                className="flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors hover:bg-surface-elevated/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface/40">
                  <AlertOctagon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground truncate">{i.title}</p>
                  <p className="text-[10.5px] text-muted-foreground">
                    {i.source} · {i.status}
                  </p>
                </div>
                <span className={cn("rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold", sevClass(i.severity))}>
                  {i.severity}
                </span>
                <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-16 text-right">
                  {timeAgo(i.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {drawer && <Drawer item={drawer} onClose={() => setDrawer(null)} />}
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: "crit" | "info" | "ok" }) {
  const color = tone === "crit" ? "text-status-failed" : tone === "ok" ? "text-status-booked" : "text-primary";
  return (
    <div className="card-surface p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3 w-3", color)} /> {label}
      </div>
      <div className="mt-1 metric-number text-xl font-semibold">{value}</div>
    </div>
  );
}

function EmptyState({ message, sub, tone }: { message: string; sub?: string; tone?: "error" }) {
  return (
    <div className="px-5 py-12 text-center">
      <p className={cn("text-[13px]", tone === "error" ? "text-status-failed" : "text-foreground")}>{message}</p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Drawer({ item, onClose }: { item: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-auto border-l border-border bg-background p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Incident</div>
            <h3 className="text-[15px] font-semibold text-foreground">{item.title}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <pre className="rounded-md border border-border/60 bg-surface/40 p-3 text-[10.5px] text-muted-foreground overflow-auto max-h-[70vh]">
          {JSON.stringify(item.raw, null, 2)}
        </pre>
      </div>
    </div>
  );
}
