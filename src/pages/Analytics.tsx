import { useClient } from "@/lib/client-context";
import { useLiveLeads } from "@/lib/use-live-leads";
import { PageHeader } from "@/components/page-header";
import { Sparkles, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
import { useMemo } from "react";

export default function Analytics() {
  const { client } = useClient();
  const { data: leads = [] } = useLiveLeads(client.id);

  const sources = useMemo(() => {
    const groups: Record<string, { total: number; booked: number }> = {};
    leads.forEach(l => {
      groups[l.source] ??= { total: 0, booked: 0 };
      groups[l.source].total++;
      if (l.stage === "booked") groups[l.source].booked++;
    });
    return Object.entries(groups).sort((a, b) => b[1].total - a[1].total);
  }, [leads]);

  const types = useMemo(() => {
    const groups: Record<string, { total: number; booked: number }> = {};
    leads.forEach(l => {
      groups[l.businessType] ??= { total: 0, booked: 0 };
      groups[l.businessType].total++;
      if (l.stage === "booked") groups[l.businessType].booked++;
    });
    return Object.entries(groups).sort((a, b) => (b[1].booked / (b[1].total||1)) - (a[1].booked / (a[1].total||1)));
  }, [leads]);

  const stages = ["new", "paid", "intake", "emailed", "opened", "clicked", "booked"] as const;
  const dropoff = stages.map((s, i) => {
    const at = leads.filter(l => stages.indexOf(l.stage) >= i).length;
    const next = i < stages.length - 1 ? leads.filter(l => stages.indexOf(l.stage) >= i + 1).length : at;
    const drop = at - next;
    return { stage: s, at, drop, dropPct: at ? Math.round((drop / at) * 100) : 0 };
  });

  const worst = [...dropoff].sort((a, b) => b.drop - a.drop)[0];

  return (
    <>
      <PageHeader title="Analytics" description="Where leads come from, where they convert, and where they leak." />

      {/* AI insights */}
      <section className="card-surface relative overflow-hidden p-5 mb-5">
        <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
            <span className="ml-auto text-[10px] text-muted-foreground">Updated 4m ago</span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {[
              `Most leads drop off at the ${worst.stage} stage — ${worst.drop} leads lost (${worst.dropPct}%).`,
              `${types[0]?.[0]} leads have the highest booking rate this week (${Math.round((types[0]?.[1].booked/(types[0]?.[1].total||1))*100)}%).`,
              `2 leads clicked the booking link in the last 24h but did not schedule — flagged for follow-up.`,
              `Consider routing more spend to ${sources[0]?.[0]}: highest volume source.`,
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-md border border-border/40 bg-surface/40 px-3 py-2.5">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-[12.5px] text-foreground">{t}</span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Bars title="Lead sources" subtitle="Volume by acquisition channel" rows={sources.map(([k, v]) => ({ label: k, value: v.total, sub: `${v.booked} booked` }))} />
        <Bars title="Booking conversion by source" subtitle="Booked / total leads" rows={sources.map(([k, v]) => ({ label: k, value: Math.round((v.booked/(v.total||1))*100), sub: `${v.booked}/${v.total}`, suffix: "%" }))} />
        <Bars title="Conversion by business type" subtitle="Booked rate per industry" rows={types.map(([k, v]) => ({ label: k, value: Math.round((v.booked/(v.total||1))*100), sub: `${v.booked}/${v.total}`, suffix: "%" }))} />

        <section className="card-surface p-5">
          <h3 className="text-sm font-semibold text-foreground">Drop-off by pipeline stage</h3>
          <p className="text-[11px] text-muted-foreground">Where leads leave the funnel</p>
          <ul className="mt-4 space-y-2.5">
            {dropoff.slice(0, -1).map(d => (
              <li key={d.stage} className="flex items-center justify-between rounded-md border border-border/40 bg-surface/40 px-3 py-2">
                <span className="text-[12.5px] capitalize text-foreground">{d.stage}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] tabular text-muted-foreground">{d.drop} dropped</span>
                  <span className={`text-[11px] tabular font-medium ${d.dropPct > 30 ? "text-status-failed" : "text-status-followup"}`}>{d.dropPct}%</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-start gap-2 rounded-md border border-status-failed/30 bg-status-failed/5 px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-status-failed" />
            <div className="text-[11.5px] text-foreground">
              <span className="font-medium">Most common failure point:</span>{" "}
              <span className="text-muted-foreground">leads stall at the <span className="capitalize text-foreground">{worst.stage}</span> stage.</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function Bars({ title, subtitle, rows }: { title: string; subtitle: string; rows: { label: string; value: number; sub: string; suffix?: string }[] }) {
  const max = Math.max(...rows.map(r => r.value), 1);
  return (
    <section className="card-surface p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      <ul className="mt-4 space-y-3">
        {rows.map(r => (
          <li key={r.label}>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-foreground">{r.label}</span>
              <span className="tabular text-muted-foreground">
                <span className="text-foreground font-medium">{r.value}{r.suffix ?? ""}</span> · {r.sub}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${(r.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
