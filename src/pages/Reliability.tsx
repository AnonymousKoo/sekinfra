import { PageHeader } from "@/components/page-header";
import { useDashboardData } from "@/lib/use-live-leads";
import { useClient } from "@/lib/client-context";
import { ShieldCheck, Loader2, Rocket, Users, Percent } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export default function Reliability() {
  const { client } = useClient();
  const { data, isLoading, error } = useDashboardData(client.id);

  const summary = data?.summary ?? {};
  const leads = data?.leads ?? [];

  const metrics = useMemo(() => {
    const booked = Number(summary.booked ?? 0);
    const goLive = leads.filter(l => l.goLive).length;
    const activeClients = leads.filter(l => l.goLive || l.dashboardReady || l.deploymentStarted).length;
    const started = leads.filter(l => l.deploymentStarted || l.dashboardReady || l.goLive).length;
    const successRate = started === 0 ? null : Math.round((goLive / started) * 100);
    const score = successRate === null ? 100 : Math.max(0, Math.min(100, successRate));
    return { booked, goLive, activeClients, successRate, score, started };
  }, [summary, leads]);

  return (
    <>
      <PageHeader
        title="Reliability"
        description="Deployment success, activation, and live client posture."
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reliability score</div>
          <div className={cn("mt-1 metric-number text-3xl font-semibold",
            metrics.score >= 90 ? "text-status-booked" : metrics.score >= 70 ? "text-status-followup" : "text-status-failed")}>
            {metrics.score}
          </div>
          <div className="mt-1 text-[10.5px] text-muted-foreground">{metrics.started} deployments tracked</div>
        </div>
        <Stat icon={Rocket} label="Go-live count" value={metrics.goLive} tone="ok" />
        <Stat icon={Percent} label="Deployment success" value={metrics.successRate === null ? "—" : `${metrics.successRate}%`} tone="info" />
        <Stat icon={Users} label="Active clients" value={metrics.activeClients} tone="info" />
      </div>

      <div className="mb-4 card-surface p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Bookings (from operational summary)</div>
        <div className="metric-number text-2xl font-semibold">{metrics.booked}</div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="border-b border-border/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          Client deployment posture
        </div>
        {error ? (
          <div className="px-5 py-12 text-center text-[13px] text-status-failed">Failed to load reliability data</div>
        ) : isLoading ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">Loading…</div>
        ) : leads.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <ShieldCheck className="mx-auto h-6 w-6 text-status-booked/70" />
            <p className="mt-2 text-[13px] text-foreground">No deployments tracked yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Client activation and go-live state will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50 max-h-[560px] overflow-auto">
            {leads.map(l => {
              const live = l.goLive;
              const ready = l.dashboardReady;
              return (
                <li key={l.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface/40">
                    <Rocket className={cn("h-4 w-4", live ? "text-status-booked" : ready ? "text-status-followup" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground truncate">{l.name}</p>
                    <p className="text-[10.5px] text-muted-foreground truncate">{l.email}</p>
                  </div>
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold",
                    live ? "bg-status-booked/15 text-status-booked border-status-booked/30" :
                    ready ? "bg-status-followup/15 text-status-followup border-status-followup/30" :
                    "bg-muted/40 text-muted-foreground border-border/50")}>
                    {live ? "live" : ready ? "ready" : (l.operationalState ?? "pending")}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number | string; tone: "ok" | "info" | "warn" }) {
  const color = tone === "ok" ? "text-status-booked" : tone === "warn" ? "text-status-followup" : "text-primary";
  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3 w-3", color)} /> {label}
      </div>
      <div className="mt-1 metric-number text-2xl font-semibold">{value}</div>
    </div>
  );
}
