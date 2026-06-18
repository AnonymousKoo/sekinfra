import { useClient } from "@/lib/client-context";
import { useDashboardData } from "@/lib/use-live-leads";
import { PageHeader } from "@/components/page-header";
import { Lead } from "@/lib/types";
import { useMemo, useState } from "react";
import { Search, Filter, ArrowUpDown, X, Loader2, Mail, Phone, Calendar, DollarSign, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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

const STAGE_LABELS: Record<string, string> = {
  new_lead: "New Lead",
  intake_received: "Intake",
  oia_booked: "OIA Booked",
  oia_completed: "OIA Done",
  payment_received: "Paid",
  activation: "Activation",
  dashboard_live: "Live",
};

function stageBadge(state?: string) {
  const k = (state ?? "").toLowerCase();
  if (k === "dashboard_live") return "bg-status-booked/15 text-status-booked border-status-booked/30";
  if (k === "activation") return "bg-primary/15 text-primary border-primary/30";
  if (k === "payment_received" || k === "oia_completed") return "bg-status-paid/15 text-status-paid border-status-paid/30";
  if (k === "oia_booked") return "bg-status-clicked/15 text-status-clicked border-status-clicked/30";
  if (k === "intake_received") return "bg-status-intake/15 text-status-intake border-status-intake/30";
  return "bg-status-new/15 text-status-new border-status-new/30";
}

export default function Leads() {
  const { client } = useClient();
  const { data, isLoading } = useDashboardData(client.id);
  const leads = data?.leads ?? [];

  const [q, setQ] = useState("");
  const [stage, setStage] = useState("all");
  const [type, setType] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [drawer, setDrawer] = useState<Lead | null>(null);

  const types = useMemo(() => Array.from(new Set(leads.map(l => l.businessType))), [leads]);
  const stages = useMemo(() => Array.from(new Set(leads.map(l => l.operationalState).filter(Boolean) as string[])), [leads]);

  const filtered = useMemo(
    () =>
      leads
        .filter(l => stage === "all" || l.operationalState === stage)
        .filter(l => type === "all" || l.businessType === type)
        .filter(l => !q || (l.name + l.email + (l.phone ?? "")).toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => {
          const d = new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
          return sortDesc ? d : -d;
        }),
    [leads, q, stage, type, sortDesc],
  );

  const totalRevenue = leads.filter(l => l.paymentReceived === true).reduce((s, l) => s + (l.paymentAmount ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${filtered.length} of ${leads.length} leads · ${fmtCurrency(totalRevenue)} pipeline value · ${client.name}`}
        actions={isLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="card-surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border/60 p-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by name, email, phone…"
              className="w-full rounded-md border border-border bg-background/40 py-1.5 pl-9 pr-3 text-[13px] focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background/40 px-2.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select value={stage} onChange={e => setStage(e.target.value)} className="bg-transparent py-1.5 text-[12px] focus:outline-none">
                <option value="all">All stages</option>
                {stages.map(s => <option key={s} value={s}>{STAGE_LABELS[s] ?? s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background/40 px-2.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select value={type} onChange={e => setType(e.target.value)} className="bg-transparent py-1.5 text-[12px] focus:outline-none">
                <option value="all">All business types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">Business</th>
                <th className="px-4 py-2.5 font-medium">Stage</th>
                <th className="px-4 py-2.5 font-medium">OIA</th>
                <th className="px-4 py-2.5 font-medium">Booking</th>
                <th className="px-4 py-2.5 font-medium">Payment</th>
                <th className="px-4 py-2.5 font-medium">Follow-up</th>
                <th className="px-4 py-2.5 font-medium text-right">Value</th>
                <th className="px-4 py-2.5 font-medium">
                  <button onClick={() => setSortDesc(s => !s)} className="inline-flex items-center gap-1 hover:text-foreground">
                    Last activity <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr
                  key={l.id}
                  onClick={() => setDrawer(l)}
                  className="group cursor-pointer border-b border-border/40 transition-colors hover:bg-surface-elevated/40"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{l.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">{l.email}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{l.businessType}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium", stageBadge(l.operationalState))}>
                      {STAGE_LABELS[l.operationalState ?? ""] ?? l.operationalState ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3"><Dot ok={!!l.oiaCompleted} pending={!!l.oiaSubmitted} okLabel="Complete" pendingLabel="Submitted" emptyLabel="Pending" /></td>
                  <td className="px-4 py-3"><Dot ok={!!l.bookedCall} okLabel="Booked" emptyLabel="—" /></td>
                  <td className="px-4 py-3"><Dot ok={!!l.paymentReceived} okLabel="Paid" emptyLabel="Unpaid" /></td>
                  <td className="px-4 py-3">
                    {(l.followupCount ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 text-status-followup text-[11.5px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-status-followup animate-pulse-soft" />
                        {l.followupCount}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60 text-[11.5px]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular text-foreground">
                    {(l.value ?? l.paymentAmount ?? 0) > 0 ? fmtCurrency(l.value ?? l.paymentAmount ?? 0) : <span className="text-muted-foreground/60">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular">{timeAgo(l.lastActivity)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">No leads match these filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {drawer && <LeadDrawer lead={drawer} onClose={() => setDrawer(null)} />}
    </>
  );
}

function Dot({ ok, pending, okLabel, pendingLabel, emptyLabel }: { ok: boolean; pending?: boolean; okLabel: string; pendingLabel?: string; emptyLabel: string }) {
  if (ok) return <span className="inline-flex items-center gap-1.5 text-[11.5px] text-status-booked"><span className="h-1.5 w-1.5 rounded-full bg-status-booked" />{okLabel}</span>;
  if (pending && pendingLabel) return <span className="inline-flex items-center gap-1.5 text-[11.5px] text-status-followup"><span className="h-1.5 w-1.5 rounded-full bg-status-followup" />{pendingLabel}</span>;
  return <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />{emptyLabel}</span>;
}

function LeadDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const checkpoints = [
    { label: "OIA Submitted", on: lead.oiaSubmitted },
    { label: "OIA Booked", on: lead.bookedCall },
    { label: "Payment Received", on: lead.paymentReceived },
    { label: "OIA Completed", on: lead.oiaCompleted },
    { label: "Deployment Started", on: lead.deploymentStarted },
    { label: "Dashboard Ready", on: lead.dashboardReady },
    { label: "Go Live", on: lead.goLive },
  ];
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-auto border-l border-border bg-background p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{lead.businessType}</div>
            <h3 className="text-[16px] font-semibold text-foreground">{lead.name}</h3>
            <div className="mt-0.5 text-[11.5px] text-muted-foreground font-mono">{lead.email}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          <a href={`mailto:${lead.email}`} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card/60 py-1.5 text-[11.5px] font-medium hover:bg-card">
            <Mail className="h-3 w-3" /> Email
          </a>
          <a href={`tel:${lead.phone}`} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card/60 py-1.5 text-[11.5px] font-medium hover:bg-card">
            <Phone className="h-3 w-3" /> Call
          </a>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 text-[12px]">
          <Field label="Operational state">{STAGE_LABELS[lead.operationalState ?? ""] ?? lead.operationalState ?? "—"}</Field>
          <Field label="Lifecycle">{lead.lifecycleStage ?? "—"}</Field>
          <Field label="Source">{lead.source}</Field>
          <Field label="Risk level"><span className="capitalize">{lead.riskLevel ?? "—"}</span></Field>
          <Field label="Phone"><span className="font-mono text-[11px]">{lead.phone || "—"}</span></Field>
          <Field label="Value">{(lead.value ?? lead.paymentAmount ?? 0) > 0 ? fmtCurrency(lead.value ?? lead.paymentAmount ?? 0) : "—"}</Field>
          <Field label="Booking">
            {lead.bookingDate ? new Date(lead.bookingDate).toLocaleString() : "—"}
          </Field>
          <Field label="Follow-ups">{lead.followupCount ?? 0}</Field>
        </div>

        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Activation checklist</div>
          <ul className="space-y-1.5">
            {checkpoints.map(c => (
              <li key={c.label} className="flex items-center justify-between rounded-md border border-border/50 bg-surface/30 px-2.5 py-1.5">
                <span className="text-[12px] text-foreground">{c.label}</span>
                <span className={cn("h-2 w-2 rounded-full", c.on ? "bg-status-booked" : "bg-muted-foreground/30")} />
              </li>
            ))}
          </ul>
        </div>

        <Link to={`/leads/${lead.id}`} className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline">
          Open full lead profile <ExternalLink className="h-3 w-3" />
        </Link>
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
