import { PageHeader } from "@/components/page-header";
import { useEventLogs, timeAgo } from "@/lib/use-operational";
import { Activity, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const isOk = (s?: string | null) => {
  const v = (s ?? "").toLowerCase();
  return v === "ok" || v === "healthy" || v === "up" || v === "success" || v === "pass" || v === "passed";
};
const isDown = (s?: string | null) => {
  const v = (s ?? "").toLowerCase();
  return v === "down" || v === "failed" || v === "fail" || v === "critical" || v === "error";
};

export default function Monitoring() {
  const { data, isLoading, error } = useEventLogs({ eventType: "infra_health_check" });
  const checks = data ?? [];

  const stats = useMemo(() => {
    const total = checks.length;
    const ok = checks.filter(c => isOk(c.status)).length;
    const down = checks.filter(c => isDown(c.status)).length;
    const uptime = total === 0 ? null : Math.round((ok / total) * 100);
    const last = checks[0];
    return { total, ok, down, uptime, last };
  }, [checks]);

  return (
    <>
      <PageHeader
        title="Monitoring"
        description="Health check telemetry across the operational infrastructure."
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Uptime</div>
          <div className={cn("mt-1 metric-number text-3xl font-semibold",
            stats.uptime === null ? "text-muted-foreground" :
            stats.uptime >= 99 ? "text-status-booked" :
            stats.uptime >= 95 ? "text-status-followup" : "text-status-failed")}>
            {stats.uptime === null ? "—" : `${stats.uptime}%`}
          </div>
          <div className="mt-1 text-[10.5px] text-muted-foreground">{stats.total} checks</div>
        </div>
        <Stat icon={CheckCircle2} label="Healthy" value={stats.ok} tone="ok" />
        <Stat icon={XCircle} label="Down / failed" value={stats.down} tone="crit" />
        <div className="card-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Last checked</div>
          <div className="mt-1 text-[14px] font-semibold text-foreground">{timeAgo(stats.last?.created_at)}</div>
          <div className="mt-0.5 text-[10.5px] text-muted-foreground truncate">{stats.last?.source ?? stats.last?.message ?? "—"}</div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="border-b border-border/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          Health check history
        </div>
        {error ? (
          <div className="px-5 py-12 text-center text-[13px] text-status-failed">Failed to load health checks</div>
        ) : isLoading ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">Loading…</div>
        ) : checks.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Activity className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-[13px] text-foreground">No health checks yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Infra health pings will populate here as they are emitted.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50 max-h-[640px] overflow-auto">
            {checks.map(c => {
              const ok = isOk(c.status);
              const down = isDown(c.status);
              return (
                <li key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-elevated/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface/40">
                    {ok ? <CheckCircle2 className="h-4 w-4 text-status-booked" /> :
                     down ? <XCircle className="h-4 w-4 text-status-failed" /> :
                     <Activity className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground truncate">{c.message ?? c.source ?? "infra_health_check"}</p>
                    <p className="text-[10.5px] text-muted-foreground">{c.source ?? "system"}</p>
                  </div>
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold",
                    ok ? "bg-status-booked/15 text-status-booked border-status-booked/30" :
                    down ? "bg-status-failed/15 text-status-failed border-status-failed/30" :
                    "bg-muted/40 text-muted-foreground border-border/50")}>
                    {c.status ?? "—"}
                  </span>
                  <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-16 text-right">{timeAgo(c.created_at)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: "ok" | "crit" | "warn" }) {
  const color = tone === "ok" ? "text-status-booked" : tone === "crit" ? "text-status-failed" : "text-status-followup";
  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3 w-3", color)} /> {label}
      </div>
      <div className="mt-1 metric-number text-2xl font-semibold">{value}</div>
    </div>
  );
}
