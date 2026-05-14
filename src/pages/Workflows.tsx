import { PageHeader } from "@/components/page-header";
import { useDashboardData } from "@/lib/use-live-leads";
import { useClient } from "@/lib/client-context";
import { Workflow, Loader2, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Workflows() {
  const { client } = useClient();
  const { data, isLoading, error } = useDashboardData(client.id);
  const [drawer, setDrawer] = useState<any>(null);

  const automations = ((data?.automations as any[]) ?? [])
    .slice()
    .sort((a, b) => new Date(b.last_run ?? b.timestamp ?? 0).getTime() - new Date(a.last_run ?? a.timestamp ?? 0).getTime());

  const stats = {
    total: automations.length,
    healthy: automations.filter(a => (a.status ?? a.last_status) === "success" || a.success_rate >= 0.9).length,
    failing: automations.filter(a => (a.status ?? a.last_status) === "failed" || a.errors > 0).length,
  };

  return (
    <>
      <PageHeader
        title="Workflows"
        description="Automation graphs, triggers, and execution telemetry."
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="card-surface p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Workflow className="h-3 w-3 text-primary" /> Workflows
          </div>
          <div className="mt-1 metric-number text-xl font-semibold">{stats.total}</div>
        </div>
        <div className="card-surface p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-status-booked" /> Healthy
          </div>
          <div className="mt-1 metric-number text-xl font-semibold">{stats.healthy}</div>
        </div>
        <div className="card-surface p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-3 w-3 text-status-failed" /> Failing
          </div>
          <div className="mt-1 metric-number text-xl font-semibold">{stats.failing}</div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="border-b border-border/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          Automation runs
        </div>
        {error ? (
          <div className="px-5 py-12 text-center text-[13px] text-status-failed">Failed to load workflow data</div>
        ) : isLoading ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">Loading…</div>
        ) : automations.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Workflow className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-[13px] text-foreground">No live workflow runs yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Automation execution telemetry will populate here as workflows fire.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50 max-h-[640px] overflow-auto">
            {automations.map((a, i) => {
              const status = a.status ?? a.last_status ?? "unknown";
              const ok = status === "success" || status === "ok";
              return (
                <li key={a.id ?? a.workflow_name ?? i} onClick={() => setDrawer(a)} className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-surface-elevated/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface/40">
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground truncate">{a.workflow_name ?? a.name ?? "Workflow"}</p>
                    <p className="text-[10.5px] text-muted-foreground truncate">
                      {a.node_name ?? a.source ?? "n8n"} · {a.runs ?? "—"} runs · {a.errors ?? 0} errors
                    </p>
                  </div>
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold",
                    ok
                      ? "bg-status-booked/15 text-status-booked border-status-booked/30"
                      : status === "failed"
                      ? "bg-status-failed/15 text-status-failed border-status-failed/30"
                      : "bg-muted/40 text-muted-foreground border-border/50",
                  )}>
                    {status}
                  </span>
                  <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-16 text-right">
                    {timeAgo(a.last_run ?? a.timestamp)}
                  </span>
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
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Workflow</div>
                <h3 className="text-[15px] font-semibold">{drawer.workflow_name ?? drawer.name ?? "Workflow"}</h3>
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
