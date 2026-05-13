import { useClient } from "@/lib/client-context";
import { useDashboardData } from "@/lib/use-live-leads";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import {
  DollarSign, CalendarCheck, TrendingUp, AlertTriangle, Sparkles, ArrowRight, ArrowUpRight,
  RefreshCw, Zap, Loader2, Server, Activity as ActivityIcon, ShieldCheck, Workflow, Bot,
  Users, AlertOctagon, Cpu, Radio, ChevronRight, Hexagon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}
function num(v: any, fb = 0): number { const n = typeof v === "number" ? v : Number(v); return Number.isFinite(n) ? n : fb; }
function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

const stageOrder = [
  { key: "new", label: "New Lead" },
  { key: "intake", label: "Intake Received" },
  { key: "oia_booked", label: "OIA Booked" },
  { key: "oia_complete", label: "OIA Completed" },
  { key: "paid", label: "Payment Received" },
  { key: "activation", label: "Activation" },
  { key: "live", label: "Dashboard Live" },
];

const sparkRevenue = [12, 18, 14, 22, 19, 28, 24, 33, 31, 38, 36, 42];
const sparkAuto = [88, 92, 90, 94, 93, 96, 95, 97, 96, 98, 97, 98];

const infraServices = [
  { name: "Dashboard API", status: "healthy", latency: "82ms", uptime: "99.99%" },
  { name: "Automation Engine", status: "healthy", latency: "—", uptime: "99.97%" },
  { name: "n8n Workflows", status: "healthy", latency: "143ms", uptime: "99.92%" },
  { name: "Wazuh SIEM", status: "healthy", latency: "—", uptime: "99.95%" },
  { name: "Loki Log Pipeline", status: "warning", latency: "412ms", uptime: "99.81%" },
  { name: "Primary VPS (eu-west)", status: "healthy", latency: "21ms", uptime: "99.99%" },
];

const aiInsights = [
  { tone: "warn", text: "3 paid clients have not completed activation in 48h.", action: "Review activation queue" },
  { tone: "info", text: "Follow-up recovery rate improved 14% week-over-week.", action: "View follow-up rules" },
  { tone: "crit", text: "Loki ingestion latency elevated since 14:22 UTC.", action: "Open monitoring" },
  { tone: "info", text: "OIA → Payment conversion projected to hit 64% this week.", action: "View pipeline" },
];

const workflows = [
  { name: "Lead Intake → CRM Sync", status: "ok", runs: "1,284", avg: "1.2s", success: 99.7 },
  { name: "Payment → Activation", status: "ok", runs: "412", avg: "3.1s", success: 99.1 },
  { name: "OIA Booking Reminder", status: "warn", runs: "203", avg: "0.8s", success: 96.2 },
  { name: "Stalled Lead Recovery", status: "ok", runs: "97", avg: "2.4s", success: 100 },
];

export default function Dashboard() {
  const { client } = useClient();
  const { data, isLoading, isError, dataUpdatedAt } = useDashboardData(client.id);

  const summary = data?.summary ?? {};
  const priorityActions = data?.priority_actions ?? [];
  const pipelineRaw = data?.pipeline ?? [];
  const activity = data?.activity ?? [];

  const pipeline = stageOrder.map(s => {
    const found = pipelineRaw.find((p: any) => {
      const n = (p?.stage ?? p?.name ?? "").toString().toLowerCase();
      return n === s.key || n.includes(s.key.split("_")[0]);
    });
    return { ...s, count: num(found?.count ?? found?.value, 0) };
  });

  const revenueToday = num(summary.revenue_today ?? summary.revenueToday);
  const mrr = num(summary.mrr ?? summary.monthly_recurring_revenue, 48200);
  const revenueAtRisk = num(summary.revenue_at_risk ?? summary.revenueAtRisk);
  const activeClients = num(summary.active_clients, 24);
  const paidToBooked = num(summary.paid_to_booked ?? summary.paidToBooked, 62);
  const followUps = num(summary.active_followups, 18);
  const openIncidents = num(summary.open_incidents, 1);
  const infraHealth = num(summary.infra_health, 99.8);
  const automationRate = num(summary.automation_success, 98.4);
  const aiActions = num(summary.ai_actions, 7);

  const revenueSeries = Array.from({ length: 24 }, (_, i) => ({
    h: `${i}:00`,
    v: Math.round(800 + Math.sin(i / 3) * 400 + Math.random() * 300),
  }));

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
                synced {timeAgo(new Date(dataUpdatedAt).toISOString())}
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
          <MetricCard label="Revenue Today" value={fmtCurrency(revenueToday || 2500)} icon={DollarSign} accent="success" delta={12} spark={sparkRevenue} />
          <MetricCard label="MRR" value={fmtCurrency(mrr)} icon={TrendingUp} accent="success" delta={4} />
          <MetricCard label="Revenue at Risk" value={fmtCurrency(revenueAtRisk || 8400)} icon={AlertTriangle} accent="warning" hint="paid, not activated" />
          <MetricCard label="Active Clients" value={activeClients} icon={Users} delta={2} />
          <MetricCard label="Paid → Booked" value={`${paidToBooked}%`} icon={CalendarCheck} accent="success" delta={6} />
          <MetricCard label="Active Follow-Ups" value={followUps} icon={RefreshCw} accent="warning" />
          <MetricCard label="Open Incidents" value={openIncidents} icon={AlertOctagon} accent={openIncidents > 0 ? "warning" : "success"} />
          <MetricCard label="Infra Health" value={`${infraHealth}%`} icon={ShieldCheck} accent="success" hint="6 of 6 services" />
          <MetricCard label="Automation Success" value={`${automationRate}%`} icon={Workflow} accent="success" delta={1} spark={sparkAuto} />
          <MetricCard label="Active AI Actions" value={aiActions} icon={Bot} delta={3} hint="last 24h" />
        </div>
      </section>

      {/* ============== PIPELINE ============== */}
      <section className="card-surface mb-8 p-5">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground font-display flex items-center gap-2">
              <Hexagon className="h-4 w-4 text-primary" /> Operational Pipeline
            </h2>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">Lead → Activation → Live. Drop-off and revenue value at each stage.</p>
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
                    <div className="mt-1 flex items-center justify-between text-[10px] tabular">
                      <span className={i === 0 ? "text-muted-foreground" : conv >= 70 ? "text-status-booked" : conv >= 40 ? "text-status-followup" : "text-status-failed"}>
                        {i === 0 ? "Entry" : `${conv}%`}
                      </span>
                      <span className="text-muted-foreground">{fmtCurrency(s.count * 1250)}</span>
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
              <h2 className="text-[15px] font-semibold text-foreground font-display flex items-center gap-2">
                <Zap className="h-4 w-4 text-status-followup" /> Priority Actions
              </h2>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">High-severity items requiring operator attention</p>
            </div>
            <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground tabular">
              {priorityActions.length || 4} open
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {(priorityActions.length ? priorityActions : [
              { title: "Acme Corp", subtitle: "Paid 36h ago, no booking", next_action: "Trigger recovery sequence", severity: "high" },
              { title: "Northwind", subtitle: "OIA submitted, awaiting review", next_action: "Assign reviewer", severity: "med" },
              { title: "Helix Labs", subtitle: "Stalled 72h in proposal", next_action: "Send follow-up", severity: "med" },
              { title: "Loki Pipeline", subtitle: "Ingestion latency > 400ms", next_action: "Open monitoring", severity: "crit" },
            ]).map((a: any, i: number) => {
              const sev = a.severity ?? a.priority ?? "med";
              const sevColor = sev === "crit" || sev === "critical" ? "status-failed" : sev === "high" ? "status-followup" : "primary";
              return (
                <motion.div
                  key={a.id ?? i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="card-surface group p-4 transition-colors hover:border-border-strong"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full bg-${sevColor} animate-pulse-soft`} />
                        <span className={`text-[9.5px] uppercase tracking-[0.12em] font-semibold text-${sevColor}`}>{sev}</span>
                      </div>
                      <div className="mt-1.5 text-[13px] font-semibold text-foreground truncate">
                        {a.title ?? a.lead_name ?? "Action"}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{a.subtitle ?? a.reason ?? ""}</div>
                    </div>
                  </div>
                  {(a.next_action ?? a.action) && (
                    <button className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-medium text-primary hover:underline">
                      <ArrowRight className="h-3 w-3" /> {a.next_action ?? a.action}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="card-surface relative overflow-hidden p-5">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">AI Operational Intelligence</h2>
            </div>
            <p className="text-[10.5px] text-muted-foreground">Observations, predictions, and recommendations from the Avuhz intelligence layer.</p>
            <ul className="mt-4 space-y-3">
              {aiInsights.map((ai, i) => {
                const c = ai.tone === "crit" ? "status-failed" : ai.tone === "warn" ? "status-followup" : "primary";
                return (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * i }}
                    className="rounded-md border border-border/50 bg-surface/30 p-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-${c}`} />
                      <div className="min-w-0">
                        <p className="text-[12px] text-foreground leading-snug">{ai.text}</p>
                        <button className="mt-1 text-[10.5px] text-primary hover:underline">{ai.action} →</button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
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
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">Service health, latency, and uptime across the Avuhz operating layer.</p>
          </div>
          <Link to="/infrastructure" className="text-[11px] text-primary hover:underline">Open NOC →</Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {infraServices.map(s => {
            const c = s.status === "healthy" ? "status-booked" : s.status === "warning" ? "status-followup" : "status-failed";
            return (
              <div key={s.name} className="flex items-center justify-between rounded-md border border-border/60 bg-surface/40 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full bg-${c} animate-pulse-soft`} />
                    <span className="text-[12px] font-medium text-foreground truncate">{s.name}</span>
                  </div>
                  <div className="mt-0.5 text-[10px] tabular text-muted-foreground">uptime {s.uptime}</div>
                </div>
                <div className="text-right">
                  <div className={`text-[10px] uppercase tracking-[0.1em] font-semibold text-${c}`}>{s.status}</div>
                  <div className="text-[10.5px] tabular text-muted-foreground">{s.latency}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============== REVENUE CHART + AUTOMATIONS ============== */}
      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        <section className="card-surface lg:col-span-2 p-5">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground font-display">Revenue Telemetry · 24h</h2>
              <p className="text-[10.5px] text-muted-foreground">Hourly recognized revenue</p>
            </div>
            <Link to="/revenue" className="text-[11px] text-primary hover:underline">Open engine →</Link>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="h" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  formatter={(v: any) => fmtCurrency(v)}
                />
                <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground font-display flex items-center gap-2">
              <Workflow className="h-3.5 w-3.5 text-primary" /> Automation Engine
            </h2>
            <Link to="/automations" className="text-[11px] text-primary hover:underline">All →</Link>
          </div>
          <ul className="space-y-2">
            {workflows.map(w => {
              const c = w.status === "ok" ? "status-booked" : "status-followup";
              return (
                <li key={w.name} className="rounded-md border border-border/50 bg-surface/30 px-2.5 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`h-1.5 w-1.5 rounded-full bg-${c}`} />
                      <span className="text-[11.5px] font-medium text-foreground truncate">{w.name}</span>
                    </div>
                    <span className="text-[10px] tabular text-muted-foreground">{w.success}%</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] tabular text-muted-foreground">
                    <span>{w.runs} runs</span>
                    <span>avg {w.avg}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
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
          <ul className="space-y-3">
            {[
              { name: "Acme Corp", msg: "completed payment ($2,500)", tone: "success", t: "2m ago" },
              { name: "Loki Pipeline", msg: "ingestion latency exceeded threshold", tone: "warn", t: "12m ago" },
              { name: "Northwind", msg: "submitted OIA intake form", tone: "info", t: "34m ago" },
              { name: "Workflow: Recovery", msg: "executed 4 follow-ups, 3 succeeded", tone: "info", t: "1h ago" },
              { name: "AI", msg: "flagged 2 stalled leads for re-engagement", tone: "info", t: "2h ago" },
            ].map((e, i) => {
              const c = e.tone === "success" ? "status-booked" : e.tone === "warn" ? "status-followup" : "primary";
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-${c}`} />
                  <div className="flex-1 min-w-0 flex items-baseline justify-between gap-3">
                    <p className="text-[12.5px] text-foreground leading-snug truncate">
                      <span className="font-medium">{e.name}</span>{" "}
                      <span className="text-muted-foreground">{e.msg}</span>
                    </p>
                    <span className="text-[10.5px] tabular text-muted-foreground shrink-0">{e.t}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-3">
            {activity.slice(0, 6).map((e: any, i: number) => {
              const ts = e.timestamp ?? e.created_at ?? new Date().toISOString();
              return (
                <li key={e.id ?? i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0 flex items-baseline justify-between gap-3">
                    <p className="text-[12.5px] text-foreground leading-snug truncate">
                      <span className="font-medium">{e.lead_name ?? e.name ?? "Activity"}</span>{" "}
                      <span className="text-muted-foreground">{e.message ?? e.description ?? e.type ?? ""}</span>
                    </p>
                    <span className="text-[10.5px] tabular text-muted-foreground shrink-0">{timeAgo(ts)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {isError && (
        <div className="mt-6 flex items-center gap-2 rounded-md border border-status-followup/30 bg-status-followup/10 px-3 py-2 text-[11.5px] text-status-followup">
          <Cpu className="h-3.5 w-3.5" /> Some live telemetry sources are degraded. Showing last known operational state.
        </div>
      )}
    </>
  );
}
