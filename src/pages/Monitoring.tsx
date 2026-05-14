import { PageHeader } from "@/components/page-header";
import { useAlerts, timeAgo } from "@/lib/use-operational";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Radio, Loader2, X, BellRing, AlertTriangle, CircleCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const SEV_BADGE: Record<string, string> = {
  critical: "bg-status-failed/15 text-status-failed border-status-failed/40",
  high: "bg-status-clicked/15 text-status-clicked border-status-clicked/40",
  medium: "bg-status-followup/15 text-status-followup border-status-followup/40",
  low: "bg-status-new/15 text-status-new border-status-new/40",
};
const sevBadge = (s?: string) => SEV_BADGE[(s ?? "").toLowerCase()] ?? "bg-muted/40 text-muted-foreground border-border/50";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unresolved", label: "Unresolved" },
  { key: "resolved", label: "Resolved" },
];

export default function Monitoring() {
  const { data, isLoading, error } = useAlerts();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [drawer, setDrawer] = useState<any>(null);

  // Realtime subscription — invalidate on any change to alerts
  useEffect(() => {
    const channel = supabase
      .channel("alerts-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => {
        qc.invalidateQueries({ queryKey: ["ops", "alerts"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const alerts = data ?? [];

  const stats = useMemo(() => ({
    active: alerts.filter(a => !a.resolved).length,
    unresolved: alerts.filter(a => !a.resolved).length,
    critical: alerts.filter(a => a.severity?.toLowerCase() === "critical" && !a.resolved).length,
    resolved: alerts.filter(a => a.resolved).length,
  }), [alerts]);

  const visible = useMemo(() => {
    const list = filter === "unresolved"
      ? alerts.filter(a => !a.resolved)
      : filter === "resolved"
      ? alerts.filter(a => a.resolved)
      : alerts;
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [alerts, filter]);

  return (
    <>
      <PageHeader
        title="Monitoring"
        description="Live alert stream from the operational telemetry pipeline."
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={BellRing} label="Active alerts" value={stats.active} tone="primary" />
        <Stat icon={AlertTriangle} label="Unresolved" value={stats.unresolved} tone="warn" />
        <Stat icon={AlertTriangle} label="Critical open" value={stats.critical} tone="crit" />
        <Stat icon={CircleCheck} label="Resolved" value={stats.resolved} tone="ok" />
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
          <div className="px-5 py-12 text-center text-[13px] text-status-failed">
            Failed to load alerts: {(error as Error).message}
          </div>
        ) : isLoading ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">Loading alerts…</div>
        ) : visible.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Radio className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-[13px] text-foreground">No alerts yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Live alerts from the monitoring pipeline will appear here in real time.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50 max-h-[640px] overflow-auto">
            {visible.map(a => (
              <li
                key={a.id}
                onClick={() => setDrawer(a)}
                className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-surface-elevated/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface/40">
                  <BellRing className={cn("h-4 w-4", a.resolved ? "text-muted-foreground" : "text-primary")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground truncate">
                    {a.type ?? a.message ?? "Alert"}
                  </p>
                  <p className="text-[10.5px] text-muted-foreground truncate">
                    {a.lead_id ? `lead ${a.lead_id.slice(0, 8)}` : (a.source ?? a.service ?? "system")}
                    {a.message && a.type ? ` · ${a.message}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold",
                    sevBadge(a.severity),
                  )}
                >
                  {a.severity ?? "—"}
                </span>
                <span
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold",
                    a.resolved
                      ? "bg-status-booked/15 text-status-booked border-status-booked/30"
                      : "bg-status-failed/15 text-status-failed border-status-failed/30",
                  )}
                >
                  {a.resolved ? "resolved" : "open"}
                </span>
                <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-16 text-right">
                  {timeAgo(a.created_at)}
                </span>
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
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Alert · {drawer.type ?? "—"}</div>
                <h3 className="text-[15px] font-semibold">{drawer.message ?? drawer.type ?? "Alert"}</h3>
              </div>
              <button onClick={() => setDrawer(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <Field label="Severity">
                <span className={cn("inline-block rounded border px-1.5 py-0.5 text-[10px] uppercase font-semibold", sevBadge(drawer.severity))}>
                  {drawer.severity ?? "—"}
                </span>
              </Field>
              <Field label="Status">{drawer.resolved ? "resolved" : "open"}</Field>
              <Field label="Type">{drawer.type ?? "—"}</Field>
              <Field label="Lead ID">{drawer.lead_id ?? "—"}</Field>
              <Field label="Created">{new Date(drawer.created_at).toLocaleString()}</Field>
              <Field label="Resolved">{drawer.resolved_at ? new Date(drawer.resolved_at).toLocaleString() : "—"}</Field>
            </div>
            <div className="mt-5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Raw row</div>
              <pre className="rounded-md border border-border/60 bg-surface/40 p-3 text-[10.5px] text-muted-foreground overflow-auto max-h-80">
                {JSON.stringify(drawer, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: "primary" | "crit" | "warn" | "ok" }) {
  const color =
    tone === "crit" ? "text-status-failed" :
    tone === "warn" ? "text-status-followup" :
    tone === "ok" ? "text-status-booked" : "text-primary";
  return (
    <div className="card-surface p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3 w-3", color)} /> {label}
      </div>
      <div className="mt-1 metric-number text-xl font-semibold">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/50 bg-surface/30 p-2.5">
      <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-foreground break-all">{children}</div>
    </div>
  );
}
