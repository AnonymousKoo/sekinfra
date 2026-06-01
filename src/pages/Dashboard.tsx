import { useClient } from "@/lib/client-context";
import { useDashboardData } from "@/lib/use-live-leads";
import { useAlerts, useIncidentLogs, timeAgo as opsTimeAgo } from "@/lib/use-operational";
import { useMonitoring, fmtPct } from "@/lib/use-monitoring";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import {
  DollarSign, CalendarCheck, TrendingUp, AlertTriangle, Sparkles, ArrowRight, ArrowUpRight,
  RefreshCw, Loader2, Server, Activity as ActivityIcon, ShieldCheck, Workflow, Bot,
  Users, AlertOctagon, ChevronRight, Hexagon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo } from "react";

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}
function num(v: any, fb = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fb;
}
function pct(v: any): string {
  const n = num(v, NaN);
  return Number.isFinite(n) ? `${n}%` : "—";
}
function intOrDash(v: any): string {
  const n = num(v, NaN);
  return Number.isFinite(n) ? String(n) : "—";
}
function moneyOrDash(v: any): string {
  const n = num(v, NaN);
  return Number.isFinite(n) ? fmtCurrency(n) : "—";
}

const stageOrder = [
  { key: "new", label: "New Lead" },
  { key: "intake", label: "Intake Received" },
  { key: "oia_booked", label: "OIA Booked" },
  { key: "paid", label: "Payment Received" },
  { key: "oia_complete", label: "OIA Completed" },
  { key: "activation", label: "Activation" },
  { key: "live", label: "Dashboard Live" },
];

export default function Dashboard() {
  const { client } = useClient();
  const { data, isLoading, dataUpdatedAt } = useDashboardData(client.id);
  const alertsQ = useAlerts();
  const monitoringQ = useMonitoring();
  const incidentsQ = useIncidentLogs();

  const summary = data?.summary ?? {};
  const priorityActions = data?.priority_actions ?? [];
  const pipelineRaw = data?.pipeline ?? [];
  const activity = data?.activity ?? [];
  const automations = data?.automations ?? [];
  const leads = data?.leads ?? [];

  const pipeline = stageOrder.map(s => {
    const found = pipelineRaw.find((p: any) => {
      const n = (p?.stage ?? p?.name ?? "").toString().toLowerCase();
      return n === s.key || n.includes(s.key.split("_")[0]);
    });
    return { ...s, count: num(found?.count ?? found?.value, 0) };
  });

  // Live metrics from real sources only — no synthetic fallbacks.
  const revenueToday = summary.revenue_today ?? summary.revenueToday;
  const mrr = summary.mrr ?? summary.monthly_recurring_revenue;
  const revenueAtRisk = summary.revenue_at_risk ?? summary.revenueAtRisk;
  const activeClients = summary.active_clients;
  const paidToBooked = summary.paid_to_booked ?? summary.paidToBooked;
  const followUps = summary.active_followups;
  const openIncidents = useMemo(
    () => (incidentsQ.data ?? []).filter(i => i.status !== "resolved" && !i.resolved_at).length,
    [incidentsQ.data],
  );
  const aiActions = summary.ai_actions;

  // Infra services: derive from monitoring-proxy (Prometheus + Uptime Kuma).
  const infraServices = useMemo(() => {
    const monitors = monitoringQ.data?.uptime?.monitors ?? [];
    const norm = (s: string) => {
      const v = (s ?? "").toString().toLowerCase();
      if (v === "1" || v === "up") return "up";
      if (v === "0" || v === "down") return "down";
      if (v === "2" || v === "pending") return "pending";
      if (v === "3" || v === "maintenance") return "maintenance";
      return v || "unknown";
    };
    return monitors.slice(0, 6).map(m => ({
      name: m.id,
      status: norm(m.status),
      at: m.time ?? new Date().toISOString(),
      ping: m.ping,
    }));
  }, [monitoringQ.data]);

  const infraHealth = useMemo(() => {
    const u = monitoringQ.data?.uptime;
    if (!u || !u.total) {
      // Fallback to Prometheus cluster signals
      const c = monitoringQ.data?.cluster;
      if (c?.pods_total && c.pods_ready != null) {
        return Math.round((c.pods_ready / c.pods_total) * 100);
      }
      return null;
    }
    return Math.round((u.up / u.total) * 100);
  }, [monitoringQ.data]);

  // Automation success: from real automations payload.
  const automationRate = useMemo(() => {
    if (!automations.length) return null;
    const totals = automations.reduce<{ runs: number; ok: number }>((acc, a: any) => {
      const runs = num(a.runs ?? a.executions ?? 0, 0);
      const ok = num(a.success ?? a.successful ?? Math.round(runs * (num(a.success_rate, 0) / 100)), 0);
      return { runs: acc.runs + runs, ok: acc.ok + ok };
    }, { runs: 0, ok: 0 });
    return totals.runs ? Math.round((totals.ok / totals.runs) * 100) : null;
  }, [automations]);

  return (
    <>
      <PageHeader
        title="Operational Command"
        description={`Real-time control over revenue, infrastructure, and automation — ${client.name}.`}
        actions={
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
            {dataUpdatedAt > 0 && (
              <span className="hidden sm:inline-flex text-[10.5px] tabular text-muted-foreground">
                synced {opsTimeAgo(new Date(dataUpdatedAt).toISOString())}
              </span>
            )}
            <Link to="/leads" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-[12px] font-medium hover:bg-card">
              View all leads <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        }
      />

      {/* ============== EXECUTIVE METRICS ============== */}
      <section className="mb-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <MetricCard label="Revenue Today" value={moneyOrDash(revenueToday)} icon={DollarSign} accent="success" />
          <MetricCard label="MRR" value={moneyOrDash(mrr)} icon={TrendingUp} accent="success" />
          <MetricCard label="Revenue at Risk" value={moneyOrDash(revenueAtRisk)} icon={AlertTriangle} accent="warning" hint="paid, not activated" />
          <MetricCard label="Active Clients" value={intOrDash(activeClients ?? (leads.filter(l => l.goLive || l.dashboardReady).length || undefined))} icon={Users} />
          <MetricCard label="Paid → Booked" value={pct(paidToBooked)} icon={CalendarCheck} accent="success" />
          <MetricCard label="Active Follow-Ups" value={intOrDash(followUps)} icon={RefreshCw} accent="warning" />
          <MetricCard label="Open Incidents" value={openIncidents} icon={AlertOctagon} accent={openIncidents > 0 ? "warning" : "success"} />
          <MetricCard label="Infra Health" value={pct(infraHealth)} icon={ShieldCheck} accent="success" hint={infraServices.length ? `${infraServices.length} services tracked` : "no telemetry"} />
          <MetricCard label="Automation Success" value={pct(automationRate)} icon={Workflow} accent="success" />
          <MetricCard label="AI Actions" value={intOrDash(aiActions)} icon={Bot} hint="last 24h" />
        </div>
      </section>

      {/* ============== PIPELINE ============== */}
      <section className="card-surface mb-8 p-5">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground font-display flex items-center gap-2">
              <Hexagon className="h-4 w-4 text-primary" /> Operational Pipeline
            </h2>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">Lead → Activation → Live. Drop-off across every operational stage.</p>
          </div>
          <Link to="/pipeline" className="text-[11px] text-primary hover:underline">Drill down →</Link>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-7 md:gap-0">
          {pipeline.map((s, i) => {
            const prev = i === 0 ? s.count : pipeline[i - 1].count;
            const conv = i === 0 ? 100 : prev ? Math.round((s.count / prev) * 100) : 0;
            const max = pipeline[0]?.count || 1;
            return (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="relative flex items-center md:contents"
              >
                <div className="flex-1 md:flex-none md:w-full px-1.5">
                  <div className="rounded-md border border-border/60 bg-surface/40 p-3 transition-colors hover:border-primary/40 hover:bg-surface/60">
                    <div className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground font-medium truncate">{s.label}</div>
                    <div className="mt-1.5 metric-number text-xl font-semibold text-foreground">{s.count}</div>
                    <div className="mt-1 text-[10px] tabular">
                      <span className={i === 0 ? "text-muted-foreground" : conv >= 70 ? "text-status-booked" : conv >= 40 ? "text-status-followup" : "text-status-failed"}>
                        {i === 0 ? "Entry" : `${conv}%`}
                      </span>
                    </div>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted/40">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.count / max) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
                      />
                    </div>
                  </div>
                </div>
                {i < pipeline.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-border-strong z-10" />
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============== PRIORITY ACTIONS + AI INSIGHTS ============== */}
      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground font-display">Priority Actions</h2>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">High-severity items requiring operator attention</p>
            </div>
            <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground tabular">
              {priorityActions.length} open
            </span>
          </div>

          {priorityActions.length === 0 ? (
            <div className="card-surface px-5 py-10 text-center">
              <ShieldCheck className="mx-auto h-6 w-6 text-status-booked/70" />
              <p className="mt-2 text-[13px] text-foreground">No priority actions</p>
              <p className="mt-1 text-[11px] text-muted-foreground">All clear from the operational backend.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {priorityActions.map((a: any, i: number) => {
                const sev = (a.severity ?? a.priority ?? "med").toString();
                const sevColor = sev === "crit" || sev === "critical" ? "status-failed" : sev === "high" ? "status-followup" : "primary";
                return (
                  <motion.div
                    key={a.id ?? i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className="card-surface group p-4 transition-colors hover:border-border-strong"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full bg-${sevColor} animate-pulse-soft`} />
                      <span className={`text-[9.5px] uppercase tracking-[0.12em] font-semibold text-${sevColor}`}>{sev}</span>
                    </div>
                    <div className="mt-1.5 text-[13px] font-semibold text-foreground truncate">
                      {a.title ?? a.lead_name ?? "Action"}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{a.subtitle ?? a.reason ?? ""}</div>
                    {(a.next_action ?? a.action) && (
                      <button className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-medium text-primary hover:underline">
                        <ArrowRight className="h-3 w-3" /> {a.next_action ?? a.action}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        <section className="card-surface relative overflow-hidden p-5">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">AI Operational Intelligence</h2>
            </div>
            <p className="text-[10.5px] text-muted-foreground">Observations, predictions, and recommendations from the SekInfra intelligence layer.</p>
            <div className="mt-6 rounded-md border border-dashed border-border/60 bg-surface/30 px-4 py-8 text-center">
              <p className="text-[12px] text-muted-foreground">No AI insights wired yet.</p>
              <p className="mt-1 text-[10.5px] text-muted-foreground/70">Connect the intelligence layer to stream observations here.</p>
            </div>
          </div>
        </section>
      </div>

      {/* ============== INFRASTRUCTURE ============== */}
      <section className="card-surface mb-8 p-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground font-display flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" /> Infrastructure Command
            </h2>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">Latest service health from infrastructure telemetry.</p>
          </div>
          <Link to="/infrastructure" className="text-[11px] text-primary hover:underline">Open NOC →</Link>
        </div>
        {infraServices.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 bg-surface/30 px-4 py-8 text-center">
            <p className="text-[12px] text-muted-foreground">No infrastructure events recorded.</p>
            <p className="mt-1 text-[10.5px] text-muted-foreground/70">Service status will appear as agents emit telemetry.</p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {infraServices.map(s => {
              const ok = /^(ok|healthy|up|running)$/i.test(s.status);
              const warn = /^(degraded|warning|pending|starting)$/i.test(s.status);
              const c = ok ? "status-booked" : warn ? "status-followup" : "status-failed";
              return (
                <div key={s.name} className="flex items-center justify-between rounded-md border border-border/60 bg-surface/40 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full bg-${c} animate-pulse-soft`} />
                      <span className="text-[12px] font-medium text-foreground truncate">{s.name}</span>
                    </div>
                    <div className="mt-0.5 text-[10px] tabular text-muted-foreground">updated {opsTimeAgo(s.at)}</div>
                  </div>
                  <div className={`text-[10px] uppercase tracking-[0.1em] font-semibold text-${c}`}>{s.status}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============== AUTOMATIONS ============== */}
      <div className="mb-8 card-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground font-display flex items-center gap-2">
            <Workflow className="h-3.5 w-3.5 text-primary" /> Automation Engine
          </h2>
          <Link to="/automations" className="text-[11px] text-primary hover:underline">All →</Link>
        </div>
        {automations.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 bg-surface/30 px-4 py-8 text-center">
            <p className="text-[12px] text-muted-foreground">No automations reported by n8n.</p>
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {automations.slice(0, 6).map((w: any, i: number) => {
              const status = (w.status ?? (num(w.success_rate, 100) >= 98 ? "ok" : "warn")).toString();
              const c = /^(ok|active|healthy)$/i.test(status) ? "status-booked" : "status-followup";
              return (
                <li key={w.id ?? w.name ?? i} className="rounded-md border border-border/50 bg-surface/30 px-2.5 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`h-1.5 w-1.5 rounded-full bg-${c}`} />
                      <span className="text-[11.5px] font-medium text-foreground truncate">{w.name ?? "workflow"}</span>
                    </div>
                    {w.success_rate !== undefined && (
                      <span className="text-[10px] tabular text-muted-foreground">{num(w.success_rate, 0)}%</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] tabular text-muted-foreground">
                    <span>{num(w.runs ?? w.executions, 0)} runs</span>
                    {w.avg_duration && <span>avg {w.avg_duration}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ============== ACTIVITY ============== */}
      <section className="card-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground font-display flex items-center gap-2">
              <ActivityIcon className="h-3.5 w-3.5 text-primary" /> Live Activity Feed
            </h2>
            <p className="text-[10.5px] text-muted-foreground">Operational events across leads, infra, and automations</p>
          </div>
          <Link to="/activity" className="text-[11px] text-primary hover:underline">Full log →</Link>
        </div>
        {activity.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 bg-surface/30 px-4 py-8 text-center">
            <p className="text-[12px] text-muted-foreground">No recent activity.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {activity.slice(0, 6).map((e: any, i: number) => {
              const ts = e.timestamp ?? e.created_at ?? new Date().toISOString();
              return (
                <li key={e.id ?? i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0 flex items-baseline justify-between gap-3">
                    <p className="text-[12.5px] text-foreground leading-snug truncate">
                      <span className="font-medium">{e.lead_name ?? e.title ?? e.source ?? "event"}</span>{" "}
                      <span className="text-muted-foreground">{e.message ?? e.event_type ?? ""}</span>
                    </p>
                    <span className="text-[10.5px] tabular text-muted-foreground shrink-0">{opsTimeAgo(ts)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
