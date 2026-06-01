import { useClient } from "@/lib/client-context";
import { useDashboardData } from "@/lib/use-live-leads";
import { Lead } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { useMemo, useState } from "react";
import { Search, Building2, Loader2, X, ExternalLink, Activity as ActivityIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientRow {
  id: string;
  company: string;
  email: string;
  businessType: string;
  deploymentStatus: "live" | "activating" | "assessment" | "lead";
  operationalState: string;
  dashboardStatus: "ready" | "pending" | "not_started";
  activeAutomations: number;
  mrr: number;
  totalValue: number;
  lastActivity: string;
  riskLevel: string;
  uptime: number;
  alerts: number;
  leads: Lead[];
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}
function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function deriveDeployment(leads: Lead[]): ClientRow["deploymentStatus"] {
  if (leads.some(l => l.goLive)) return "live";
  if (leads.some(l => l.deploymentStarted || l.dashboardReady)) return "activating";
  if (leads.some(l => l.bookedCall || l.oiaSubmitted)) return "assessment";
  return "lead";
}

function deriveDashboard(leads: Lead[]): ClientRow["dashboardStatus"] {
  if (leads.some(l => l.dashboardReady || l.goLive)) return "ready";
  if (leads.some(l => l.deploymentStarted)) return "pending";
  return "not_started";
}

const DEPLOY_BADGE: Record<ClientRow["deploymentStatus"], string> = {
  live: "bg-status-booked/15 text-status-booked border-status-booked/30",
  activating: "bg-primary/15 text-primary border-primary/30",
  assessment: "bg-status-clicked/15 text-status-clicked border-status-clicked/30",
  lead: "bg-status-new/15 text-status-new border-status-new/30",
};

const DASHBOARD_BADGE: Record<ClientRow["dashboardStatus"], string> = {
  ready: "bg-status-booked/15 text-status-booked border-status-booked/30",
  pending: "bg-status-followup/15 text-status-followup border-status-followup/30",
  not_started: "bg-muted/40 text-muted-foreground border-border",
};

export default function Clients() {
  const { client } = useClient();
  const { data, isLoading } = useDashboardData(client.id);
  const leads = data?.leads ?? [];

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | ClientRow["deploymentStatus"]>("all");
  const [drawer, setDrawer] = useState<ClientRow | null>(null);

  const clientRows: ClientRow[] = useMemo(() => {
    const groups = new Map<string, Lead[]>();
    for (const l of leads) {
      const key = (l.email || l.businessName || l.name || l.id).toLowerCase();
      const arr = groups.get(key) ?? [];
      arr.push(l);
      groups.set(key, arr);
    }
    return Array.from(groups.entries())
      .map(([key, group]) => {
        const head = group[0];
        const sorted = [...group].sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
        const totalValue = group.reduce((s, l) => s + (l.value ?? l.paymentAmount ?? 0), 0);
        const mrr = group.filter(l => l.goLive).reduce((s, l) => s + (l.paymentAmount ?? 0), 0);
        return {
          id: key,
          company: head.businessName ?? head.name,
          email: head.email,
          businessType: head.businessType,
          deploymentStatus: deriveDeployment(group),
          operationalState: sorted[0].operationalState ?? "—",
          dashboardStatus: deriveDashboard(group),
          activeAutomations: group.filter(l => l.automationStatus === "active").length,
          mrr,
          totalValue,
          lastActivity: sorted[0].lastActivity,
          riskLevel: sorted[0].riskLevel ?? "low",
          uptime: sorted[0].uptimePercentage ?? 100,
          alerts: group.reduce((s, l) => s + (l.activeAlerts ?? 0), 0),
          leads: sorted,
        };
      })
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }, [leads]);

  const filtered = useMemo(
    () =>
      clientRows
        .filter(c => filter === "all" || c.deploymentStatus === filter)
        .filter(c => !q || (c.company + c.email + c.businessType).toLowerCase().includes(q.toLowerCase())),
    [clientRows, filter, q],
  );

  const totalMrr = clientRows.reduce((s, c) => s + c.mrr, 0);
  const live = clientRows.filter(c => c.deploymentStatus === "live").length;
  const activating = clientRows.filter(c => c.deploymentStatus === "activating").length;

  return (
    <>
      <PageHeader
        title="Clients"
        description={`${clientRows.length} client organizations · ${fmtCurrency(totalMrr)} MRR · ${live} live`}
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total clients" value={clientRows.length} />
        <Stat label="Live deployments" value={live} accent="text-status-booked" />
        <Stat label="Activating" value={activating} accent="text-primary" />
        <Stat label="MRR" value={fmtCurrency(totalMrr)} />
      </div>

      <div className="card-surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border/60 p-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search clients…"
              className="w-full rounded-md border border-border bg-background/40 py-1.5 pl-9 pr-3 text-[13px] focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "live", "activating", "assessment", "lead"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                  filter === f ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Company</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Deployment</th>
                <th className="px-4 py-2.5 font-medium">Dashboard</th>
                <th className="px-4 py-2.5 font-medium text-right">Automations</th>
                <th className="px-4 py-2.5 font-medium text-right">MRR / Value</th>
                <th className="px-4 py-2.5 font-medium">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} onClick={() => setDrawer(c)} className="cursor-pointer border-b border-border/40 hover:bg-surface-elevated/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/30 text-[11px] font-semibold text-primary">
                        {c.company.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{c.company}</div>
                        <div className="text-[10.5px] text-muted-foreground font-mono truncate max-w-[200px]">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{c.businessType}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize", DEPLOY_BADGE[c.deploymentStatus])}>
                      {c.deploymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize", DASHBOARD_BADGE[c.dashboardStatus])}>
                      {c.dashboardStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular text-foreground">{c.activeAutomations}</td>
                  <td className="px-4 py-3 text-right tabular">
                    {c.mrr > 0 ? <span className="text-status-booked">{fmtCurrency(c.mrr)}</span> : <span className="text-muted-foreground">{fmtCurrency(c.totalValue)}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular">{timeAgo(c.lastActivity)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No clients match these filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {drawer && <ClientDrawer row={drawer} onClose={() => setDrawer(null)} />}
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="card-surface p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 metric-number text-2xl font-semibold", accent ?? "text-foreground")}>{value}</div>
    </div>
  );
}

function ClientDrawer({ row, onClose }: { row: ClientRow; onClose: () => void }) {
  const timeline = row.leads
    .flatMap(l => [
      l.oiaSubmitted && { label: "OIA submitted", at: l.createdAt },
      l.bookedCall && { label: "OIA booked", at: l.bookingDate ?? l.lastActivity },
      l.paymentReceived && { label: "Payment received", at: l.lastActivity },
      l.oiaCompleted && { label: "OIA completed", at: l.lastActivity },
      l.deploymentStarted && { label: "Deployment started", at: l.lastActivity },
      l.dashboardReady && { label: "Dashboard ready", at: l.lastActivity },
      l.goLive && { label: "Go live", at: l.lastActivity },
    ])
    .filter(Boolean) as { label: string; at: string }[];
  timeline.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-auto border-l border-border bg-background p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/30 text-[14px] font-semibold text-primary">
              {row.company.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{row.businessType}</div>
              <h3 className="text-[16px] font-semibold text-foreground">{row.company}</h3>
              <div className="text-[11.5px] text-muted-foreground font-mono">{row.email}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 text-[12px]">
          <Field label="Deployment"><span className={cn("inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize", DEPLOY_BADGE[row.deploymentStatus])}>{row.deploymentStatus}</span></Field>
          <Field label="Dashboard"><span className={cn("inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize", DASHBOARD_BADGE[row.dashboardStatus])}>{row.dashboardStatus.replace("_", " ")}</span></Field>
          <Field label="MRR">{fmtCurrency(row.mrr)}</Field>
          <Field label="Pipeline value">{fmtCurrency(row.totalValue)}</Field>
          <Field label="Active automations">{row.activeAutomations}</Field>
          <Field label="Risk level"><span className="capitalize">{row.riskLevel}</span></Field>
          <Field label="Uptime">{row.uptime}%</Field>
          <Field label="Active alerts">{row.alerts}</Field>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <ActivityIcon className="h-3 w-3" /> Operational timeline
          </div>
          <ul className="space-y-1.5">
            {timeline.length === 0 && <li className="text-[12px] text-muted-foreground">No operational milestones yet.</li>}
            {timeline.map((t, i) => (
              <li key={i} className="flex items-center justify-between rounded-md border border-border/50 bg-surface/30 px-2.5 py-1.5">
                <span className="text-[12px] text-foreground">{t.label}</span>
                <span className="text-[10.5px] tabular text-muted-foreground">{timeAgo(t.at)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-3 w-3" /> Leads ({row.leads.length})
          </div>
          <ul className="space-y-1.5">
            {row.leads.map(l => (
              <li key={l.id} className="flex items-center justify-between rounded-md border border-border/50 bg-surface/30 px-2.5 py-1.5 text-[12px]">
                <span className="truncate text-foreground">{l.businessType}</span>
                <span className="text-muted-foreground capitalize">{l.operationalState?.replace(/_/g, " ") ?? "—"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/50 bg-surface/30 p-2.5">
      <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-foreground">{children}</div>
    </div>
  );
}
