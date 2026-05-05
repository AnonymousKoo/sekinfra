import { useClient } from "@/lib/client-context";
import { stageLabels, PipelineStage, timeAgo } from "@/lib/mock-data";
import { useLiveLeads } from "@/lib/use-live-leads";
import { PageHeader } from "@/components/page-header";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const stages: PipelineStage[] = ["new", "paid", "intake", "emailed", "opened", "clicked", "booked"];

export default function Pipeline() {
  const { client } = useClient();
  const { data: leads = [] } = useLiveLeads(client.id);
  const [selected, setSelected] = useState<PipelineStage | null>(null);

  const stageData = stages.map((stage, i) => {
    const count = leads.filter(l => stages.indexOf(l.stage) >= i).length;
    const prev = i === 0 ? count : leads.filter(l => stages.indexOf(l.stage) >= i - 1).length;
    const conv = i === 0 ? 100 : Math.round((count / (prev || 1)) * 100);
    const samples = leads.filter(l => l.stage === stage).slice(0, 3);
    return { stage, count, conv, samples };
  });

  const inSelected = selected ? leads.filter(l => l.stage === selected) : [];

  return (
    <>
      <PageHeader
        title="Pipeline"
        description="Lead → Paid → Intake → Emailed → Opened → Clicked → Booked. Click any stage to inspect leads inside it."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {stageData.map((s, i) => (
          <button
            key={s.stage}
            onClick={() => setSelected(s.stage === selected ? null : s.stage)}
            className={cn(
              "card-surface group relative p-4 text-left transition-all hover:border-primary/40",
              selected === s.stage && "border-primary/60 glow-ring"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Stage {i + 1}</span>
              {i > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular",
                  s.conv >= 70 ? "bg-status-booked/15 text-status-booked" :
                  s.conv >= 40 ? "bg-status-followup/15 text-status-followup" :
                  "bg-status-failed/15 text-status-failed"
                )}>
                  {s.conv}%
                </span>
              )}
            </div>
            <div className="mt-2 text-[13px] font-semibold text-foreground">{stageLabels[s.stage]}</div>
            <div className="mt-1 metric-number text-2xl font-semibold text-foreground">{s.count}</div>
            <div className="mt-3 space-y-1">
              {s.samples.map(l => (
                <div key={l.id} className="truncate rounded border border-border/40 bg-surface/40 px-1.5 py-1 text-[10.5px] text-muted-foreground">
                  {l.name}
                </div>
              ))}
              {s.samples.length === 0 && <div className="text-[10.5px] text-muted-foreground/60">No leads</div>}
            </div>
            {i < stages.length - 1 && (
              <ArrowRight className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 h-4 w-4 text-border lg:block" />
            )}
          </button>
        ))}
      </div>

      {selected && (
        <section className="card-surface mt-6 p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Leads in {stageLabels[selected]}</h2>
              <p className="text-[11px] text-muted-foreground">{inSelected.length} leads currently at this stage</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-[11px] text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {inSelected.map(l => (
              <Link
                key={l.id}
                to={`/leads/${l.id}`}
                className="rounded-md border border-border/60 bg-surface/40 p-3 transition-colors hover:border-primary/40 hover:bg-surface"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-foreground">{l.name}</span>
                  <span className="text-[10px] tabular text-muted-foreground">{timeAgo(l.lastActivity)}</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{l.businessType} · {l.source}</div>
              </Link>
            ))}
            {inSelected.length === 0 && <div className="text-[12px] text-muted-foreground col-span-full py-8 text-center">No leads at this stage</div>}
          </div>
        </section>
      )}
    </>
  );
}
