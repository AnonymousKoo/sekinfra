import { PageHeader } from "@/components/page-header";
import { useEventLogs, timeAgo } from "@/lib/use-operational";
import { Server, Loader2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const statusTone = (s?: string | null) => {
  const v = (s ?? "").toLowerCase();
  if (["ok", "healthy", "up", "success", "deployed", "running", "completed"].includes(v))
    return "bg-status-booked/15 text-status-booked border-status-booked/30";
  if (["degraded", "warning", "pending", "starting"].includes(v))
    return "bg-status-followup/15 text-status-followup border-status-followup/30";
  if (["down", "failed", "critical", "error"].includes(v))
    return "bg-status-failed/15 text-status-failed border-status-failed/30";
  return "bg-muted/40 text-muted-foreground border-border/50";
};

export default function Infrastructure() {
  const { data, isLoading, error } = useEventLogs({ contains: "infra" });
  const [drawer, setDrawer] = useState<any>(null);
  const events = data ?? [];

  const buckets = useMemo(() => {
    const health = events.filter(e => e.event_type?.toLowerCase().includes("health"));
    const deploys = events.filter(e => /deploy|provision|release/i.test(e.event_type));
    const workflows = events.filter(e => /workflow|run|job/i.test(e.event_type));
    return { health, deploys, workflows };
  }, [events]);

  return (
    <>
      <PageHeader
        title="Infrastructure"
        description="System health events, deployment states, and workflow runs across the SekInfra operating layer."
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Health events" value={buckets.health.length} />
        <Stat label="Deployment events" value={buckets.deploys.length} />
        <Stat label="Workflow runs" value={buckets.workflows.length} />
      </div>

      <div className="card-surface overflow-hidden">
        <div className="border-b border-border/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          Infrastructure event stream · {events.length}
        </div>
        {error ? (
          <div className="px-5 py-12 text-center text-[13px] text-status-failed">Failed to load infrastructure events</div>
        ) : isLoading ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">Loading…</div>
        ) : events.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Server className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-[13px] text-foreground">No infrastructure events yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Service health, deployments, and workflow runs will populate here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50 max-h-[640px] overflow-auto">
            {events.map(e => (
              <li key={e.id} onClick={() => setDrawer(e)} className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-surface-elevated/40">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface/40">
                  <Server className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground truncate">{e.message ?? e.event_type}</p>
                  <p className="text-[10.5px] text-muted-foreground">{e.event_type} · {e.source ?? "system"}</p>
                </div>
                <span className={cn("rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold", statusTone(e.status))}>
                  {e.status ?? "—"}
                </span>
                <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-16 text-right">{timeAgo(e.created_at)}</span>
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
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Infrastructure event</div>
                <h3 className="text-[15px] font-semibold">{drawer.message ?? drawer.event_type}</h3>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-surface p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 metric-number text-2xl font-semibold">{value}</div>
    </div>
  );
}
