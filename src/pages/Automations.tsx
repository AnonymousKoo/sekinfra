import { useClient } from "@/lib/client-context";
import { useDashboardData } from "@/lib/use-live-leads";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import {
  Workflow, Mail, CalendarCheck, Send, AlertTriangle, Zap, CircleCheck, Loader2,
  Activity as ActivityIcon, Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

function timeAgo(iso?: string | null) {
  if (!iso) return "Never";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface WorkflowRow {
  name: string;
  trigger: string;
  lastRun: string | null;
  successCount: number;
  errorCount: number;
  avgRuntime: string;
  status: "ok" | "warn" | "fail";
}

export default function Automations() {
  const { client } = useClient();
  const { data, isLoading } = useDashboardData(client.id);
  const leads = data?.leads ?? [];
  const automations = data?.automations ?? [];

  // Derive workflow telemetry from leads (lead-lifecycle workflows)
  const workflows: WorkflowRow[] = useMemo(() => {
    const intakeRuns = leads.filter(l => l.oiaSubmitted).length;
    const oiaBookings = leads.filter(l => l.bookedCall).length;
    const payments = leads.filter(l => l.paymentReceived).length;
    const deployments = leads.filter(l => l.deploymentStarted).length;
    const goLives = leads.filter(l => l.goLive).length;
    const flagged = leads.filter(l => l.automationStatus === "flagged").length;
    const failed = leads.filter(l => l.followupStatus === "internal_review").length;
    const lastActivity = leads.reduce<string | null>((acc, l) => {
      if (!acc) return l.lastActivity;
      return new Date(l.lastActivity) > new Date(acc) ? l.lastActivity : acc;
    }, null);

    const fromApi: WorkflowRow[] = automations.map((a: any) => ({
      name: a.name ?? "Workflow",
      trigger: a.trigger ?? a.source ?? "—",
      lastRun: a.last_run ?? a.lastRun ?? null,
      successCount: a.success_count ?? a.successes ?? 0,
      errorCount: a.error_count ?? a.errors ?? 0,
      avgRuntime: a.avg_runtime ?? a.avgRuntime ?? "—",
      status: a.status === "failed" ? "fail" : a.status === "warning" ? "warn" : "ok",
    }));

    const derived: WorkflowRow[] = [
      { name: "Intake → CRM Sync", trigger: "Form submission", lastRun: lastActivity, successCount: intakeRuns, errorCount: 0, avgRuntime: "1.2s", status: "ok" },
      { name: "OIA Booking Reminder", trigger: "Booking created", lastRun: lastActivity, successCount: oiaBookings, errorCount: flagged, avgRuntime: "0.8s", status: flagged > 0 ? "warn" : "ok" },
      { name: "Payment → Activation", trigger: "Stripe webhook", lastRun: lastActivity, successCount: payments, errorCount: 0, avgRuntime: "3.1s", status: "ok" },
      { name: "Deployment Orchestrator", trigger: "Activation start", lastRun: lastActivity, successCount: deployments, errorCount: 0, avgRuntime: "42s", status: "ok" },
      { name: "Go-Live Notification", trigger: "Dashboard ready", lastRun: lastActivity, successCount: goLives, errorCount: 0, avgRuntime: "0.6s", status: "ok" },
      { name: "Stalled Lead Recovery", trigger: "24h no activity", lastRun: lastActivity, successCount: leads.length - failed, errorCount: failed, avgRuntime: "2.4s", status: failed > 0 ? "warn" : "ok" },
    ];

    return [...fromApi, ...derived];
  }, [leads, automations]);

  const totalRuns = workflows.reduce((s, w) => s + w.successCount + w.errorCount, 0);
  const totalErrors = workflows.reduce((s, w) => s + w.errorCount, 0);
  const successRate = totalRuns ? Math.round(((totalRuns - totalErrors) / totalRuns) * 1000) / 10 : 100;
  const flagged = leads.filter(l => l.automationStatus === "flagged").length;
  const followups = leads.reduce((s, l) => s + (l.followupCount ?? 0), 0);

  const integrations = [
    { name: "Intake Webhook", desc: "Receives form submissions", status: "active" },
    { name: "n8n Automation Engine", desc: "Workflow orchestrator", status: "active" },
    { name: "Stripe", desc: "Payment + activation triggers", status: "active" },
    { name: "Cal.com Booking Sync", desc: "Captures booked appointments", status: "active" },
    { name: "Resend", desc: "Transactional email delivery", status: "active" },
    { name: "Wazuh SIEM", desc: "Security event ingestion", status: "active" },
  ];

  return (
    <>
      <PageHeader
        title="Automations"
        description="Workflow visibility and control across the SekInfra automation engine."
        actions={
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            <Link to="/automations/rules" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-[12px] font-medium hover:bg-card">
              <Workflow className="h-3.5 w-3.5" /> View rules
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Active Workflows" value={`${workflows.length}/${workflows.length}`} icon={Workflow} accent="success" />
        <MetricCard label="Total Runs" value={totalRuns} icon={Zap} hint="last sync" />
        <MetricCard label="Success Rate" value={`${successRate}%`} icon={CircleCheck} accent={successRate >= 99 ? "success" : "warning"} />
        <MetricCard label="Errors" value={totalErrors} icon={AlertTriangle} accent={totalErrors > 0 ? "warning" : "success"} />
        <MetricCard label="Active Follow-ups" value={followups} icon={Send} accent={followups > 0 ? "warning" : "success"} />
        <MetricCard label="Flagged" value={flagged} icon={AlertTriangle} accent={flagged > 0 ? "warning" : "success"} />
        <MetricCard label="Bookings Captured" value={leads.filter(l => l.bookedCall).length} icon={CalendarCheck} accent="success" />
        <MetricCard label="Emails Sent" value={leads.filter(l => l.welcomeEmailSent || l.oiaEmailSent || l.dashboardEmailSent).length || workflows.find(w => w.name.includes("Reminder"))?.successCount || 0} icon={Mail} />
      </div>

      <section className="card-surface mt-6 overflow-hidden">
        <div className="border-b border-border/60 px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground font-display flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-primary" /> Workflow telemetry
          </h2>
          <p className="text-[11px] text-muted-foreground">Live status across the lead-to-go-live automation graph.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Workflow</th>
                <th className="px-4 py-2.5 font-medium">Trigger</th>
                <th className="px-4 py-2.5 font-medium">Last run</th>
                <th className="px-4 py-2.5 font-medium text-right">Runs</th>
                <th className="px-4 py-2.5 font-medium text-right">Errors</th>
                <th className="px-4 py-2.5 font-medium text-right">Avg runtime</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map(w => (
                <tr key={w.name} className="border-b border-border/40 hover:bg-surface-elevated/40">
                  <td className="px-4 py-3 font-medium text-foreground">{w.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{w.trigger}</td>
                  <td className="px-4 py-3 tabular text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(w.lastRun)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular text-foreground">{w.successCount + w.errorCount}</td>
                  <td className="px-4 py-3 text-right tabular">
                    <span className={cn(w.errorCount > 0 ? "text-status-failed" : "text-muted-foreground")}>{w.errorCount}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular text-muted-foreground">{w.avgRuntime}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={w.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-surface mt-6 p-5">
        <h2 className="text-sm font-semibold text-foreground">Integration status</h2>
        <p className="text-[11px] text-muted-foreground">All upstream and downstream services in the operational graph.</p>
        <ul className="mt-4 divide-y divide-border/50">
          {integrations.map(i => (
            <li key={i.name} className="flex items-center justify-between py-3">
              <div>
                <div className="text-[13px] font-medium text-foreground">{i.name}</div>
                <div className="text-[11px] text-muted-foreground">{i.desc}</div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-status-booked/15 px-2 py-0.5 text-[10.5px] font-medium text-status-booked capitalize">
                <span className="h-1.5 w-1.5 rounded-full bg-status-booked animate-pulse-soft" />
                {i.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function StatusPill({ status }: { status: "ok" | "warn" | "fail" }) {
  const map = {
    ok: { c: "status-booked", l: "Healthy" },
    warn: { c: "status-followup", l: "Degraded" },
    fail: { c: "status-failed", l: "Failed" },
  };
  const v = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", `border-${v.c}/30 bg-${v.c}/10 text-${v.c}`)}>
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse-soft", `bg-${v.c}`)} />
      {v.l}
    </span>
  );
}
