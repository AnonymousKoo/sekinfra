import { useClient } from "@/lib/client-context";
import { statusLabels, timeAgo, PipelineStage, stageLabels } from "@/lib/mock-data";
import { useLiveLeads } from "@/lib/use-live-leads";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useMemo, useState } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";

export default function Leads() {
  const { client } = useClient();
  const { data: leads = [] } = useLiveLeads(client.id);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<PipelineStage | "all">("all");
  const [type, setType] = useState<string>("all");
  const [sortDesc, setSortDesc] = useState(true);

  const types = useMemo(() => Array.from(new Set(leads.map(l => l.businessType))), [leads]);

  const filtered = useMemo(() => {
    return leads
      .filter(l => stage === "all" || l.stage === stage)
      .filter(l => type === "all" || l.businessType === type)
      .filter(l => !q || l.name.toLowerCase().includes(q.toLowerCase()) || l.email.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        const d = new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        return sortDesc ? d : -d;
      });
  }, [leads, q, stage, type, sortDesc]);

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${filtered.length} of ${leads.length} leads · ${client.name}`}
      />

      <div className="card-surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border/60 p-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full rounded-md border border-border bg-background/40 py-1.5 pl-9 pr-3 text-[13px] focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-background/40 px-2.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select value={stage} onChange={e => setStage(e.target.value as any)} className="bg-transparent py-1.5 text-[12px] focus:outline-none">
                <option value="all">All stages</option>
                {(Object.keys(stageLabels) as PipelineStage[]).map(s => (
                  <option key={s} value={s}>{stageLabels[s]}</option>
                ))}
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
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Phone</th>
                <th className="px-4 py-2.5 font-medium">Business</th>
                <th className="px-4 py-2.5 font-medium">Source</th>
                <th className="px-4 py-2.5 font-medium">Payment</th>
                <th className="px-4 py-2.5 font-medium">Intake</th>
                <th className="px-4 py-2.5 font-medium">Booking</th>
                <th className="px-4 py-2.5 font-medium">Stage</th>
                <th className="px-4 py-2.5 font-medium">
                  <button onClick={() => setSortDesc(s => !s)} className="inline-flex items-center gap-1 hover:text-foreground">
                    Last activity <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="group border-b border-border/40 transition-colors hover:bg-surface-elevated/40">
                  <td className="px-4 py-3">
                    <Link to={`/leads/${l.id}`} className="font-medium text-foreground hover:text-primary">{l.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-[11.5px]">{l.email}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular">{l.phone}</td>
                  <td className="px-4 py-3 text-foreground">{l.businessType}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                  <td className="px-4 py-3"><StatusDot ok={l.payment === "paid"} label={l.payment === "paid" ? "Paid" : "Unpaid"} /></td>
                  <td className="px-4 py-3"><StatusDot ok={l.intake === "complete"} label={l.intake === "complete" ? "Complete" : "Pending"} /></td>
                  <td className="px-4 py-3"><StatusDot ok={l.booking === "scheduled"} label={l.booking === "scheduled" ? "Scheduled" : "—"} /></td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground tabular">{timeAgo(l.lastActivity)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">No leads match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-status-booked" : "bg-muted-foreground/40"}`} />
      {label}
    </span>
  );
}
