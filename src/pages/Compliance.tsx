import { PageHeader } from "@/components/page-header";
import { useEventLogs, useIncidentLogs, timeAgo, sevClass } from "@/lib/use-operational";
import { FileCog, Loader2, ShieldAlert, KeyRound } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export default function Compliance() {
  const incidentsQ = useIncidentLogs();
  const eventsQ = useEventLogs();

  const loading = incidentsQ.isLoading || eventsQ.isLoading;
  const error = incidentsQ.error || eventsQ.error;

  const incidents = incidentsQ.data ?? [];
  const events = eventsQ.data ?? [];

  const security = useMemo(
    () => events.filter(e => /security|auth|access|login|policy|breach|permission/i.test(e.event_type ?? "") || /security|auth|access|login/i.test(e.message ?? "")),
    [events],
  );
  const accessEvents = useMemo(
    () => events.filter(e => /access|login|auth/i.test(e.event_type ?? "") || /login|access|sign[-_ ]?in/i.test(e.message ?? "")),
    [events],
  );

  const audit = useMemo(() => {
    const a = [
      ...incidents.map(i => ({
        id: `inc-${i.id}`, kind: "incident", t: i.created_at,
        title: `${i.workflow_name ?? "workflow"} → ${i.node_name ?? "node"}`,
        detail: i.error_message ?? "—", severity: i.severity, status: i.status,
      })),
      ...events.map(e => ({
        id: `evt-${e.id}`, kind: e.event_type, t: e.created_at,
        title: e.message ?? e.event_type, detail: e.source ?? "system",
        severity: e.status ?? "info", status: e.status ?? "—",
      })),
    ];
    return a.sort((x, y) => new Date(y.t).getTime() - new Date(x.t).getTime()).slice(0, 200);
  }, [incidents, events]);

  return (
    <>
      <PageHeader
        title="Compliance"
        description="Audit trail, security telemetry, and access log summary across the operational platform."
        actions={loading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FileCog} label="Audit entries" value={audit.length} tone="info" />
        <Stat icon={ShieldAlert} label="Security events" value={security.length} tone="warn" />
        <Stat icon={KeyRound} label="Access events" value={accessEvents.length} tone="info" />
        <Stat icon={ShieldAlert} label="Open incidents" value={incidents.filter(i => i.status !== "resolved" && !i.resolved_at).length} tone="crit" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Security events">
          {error ? <Empty msg="Failed to load security events" tone="error" /> :
           loading ? <Empty msg="Loading…" /> :
           security.length === 0 ? <Empty icon={ShieldAlert} msg="No security events recorded." /> :
           <ul className="divide-y divide-border/50 max-h-[420px] overflow-auto">
             {security.map(e => (
               <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                 <ShieldAlert className="h-4 w-4 text-status-followup shrink-0" />
                 <div className="flex-1 min-w-0">
                   <p className="text-[12.5px] text-foreground truncate">{e.message ?? e.event_type}</p>
                   <p className="text-[10.5px] text-muted-foreground">{e.event_type} · {e.source ?? "system"}</p>
                 </div>
                 <span className="text-[10.5px] tabular text-muted-foreground whitespace-nowrap">{timeAgo(e.created_at)}</span>
               </li>
             ))}
           </ul>}
        </Panel>

        <Panel title="Access log summary">
          {error ? <Empty msg="Failed to load access log" tone="error" /> :
           loading ? <Empty msg="Loading…" /> :
           accessEvents.length === 0 ? <Empty icon={KeyRound} msg="No access events recorded." /> :
           <ul className="divide-y divide-border/50 max-h-[420px] overflow-auto">
             {accessEvents.map(e => (
               <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                 <KeyRound className="h-4 w-4 text-primary shrink-0" />
                 <div className="flex-1 min-w-0">
                   <p className="text-[12.5px] text-foreground truncate">{e.message ?? e.event_type}</p>
                   <p className="text-[10.5px] text-muted-foreground">{e.source ?? "system"} · {e.status ?? "—"}</p>
                 </div>
                 <span className="text-[10.5px] tabular text-muted-foreground whitespace-nowrap">{timeAgo(e.created_at)}</span>
               </li>
             ))}
           </ul>}
        </Panel>
      </div>

      <div className="mt-4 card-surface overflow-hidden">
        <div className="border-b border-border/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          Audit trail · {audit.length}
        </div>
        {error ? <Empty msg="Failed to load audit trail" tone="error" /> :
         loading ? <Empty msg="Loading…" /> :
         audit.length === 0 ? <Empty icon={FileCog} msg="No audit entries yet." /> :
         <ul className="divide-y divide-border/50 max-h-[560px] overflow-auto">
           {audit.map(row => (
             <li key={row.id} className="flex items-center gap-4 px-5 py-3">
               <span className="rounded-md border border-border/60 bg-surface/40 px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold text-muted-foreground">
                 {row.kind}
               </span>
               <div className="flex-1 min-w-0">
                 <p className="text-[13px] text-foreground truncate">{row.title}</p>
                 <p className="text-[10.5px] text-muted-foreground truncate">{row.detail}</p>
               </div>
               <span className={cn("rounded-md border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold", sevClass(row.severity))}>
                 {row.severity}
               </span>
               <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap w-16 text-right">{timeAgo(row.t)}</span>
             </li>
           ))}
         </ul>}
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: "ok" | "info" | "warn" | "crit" }) {
  const color = tone === "ok" ? "text-status-booked" : tone === "warn" ? "text-status-followup" : tone === "crit" ? "text-status-failed" : "text-primary";
  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3 w-3", color)} /> {label}
      </div>
      <div className="mt-1 metric-number text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b border-border/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function Empty({ msg, icon: Icon, tone }: { msg: string; icon?: any; tone?: "error" }) {
  return (
    <div className={cn("px-5 py-10 text-center text-[13px]", tone === "error" ? "text-status-failed" : "text-muted-foreground")}>
      {Icon ? <Icon className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" /> : null}
      {msg}
    </div>
  );
}
