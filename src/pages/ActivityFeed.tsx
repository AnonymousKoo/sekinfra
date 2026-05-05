import { useClient } from "@/lib/client-context";
import { ActivityEvent, timeAgo } from "@/lib/mock-data";
import { useLiveLeads } from "@/lib/use-live-leads";
import { PageHeader } from "@/components/page-header";
import { Link } from "react-router-dom";
import { UserPlus, CreditCard, FileCheck, Mail, Eye, MousePointerClick, CalendarCheck, Send, AlertTriangle, FileText, Bell } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const map: Record<ActivityEvent["type"], { icon: any; tone: string }> = {
  lead_captured: { icon: UserPlus, tone: "text-status-new" },
  payment_received: { icon: CreditCard, tone: "text-status-paid" },
  intake_submitted: { icon: FileCheck, tone: "text-status-intake" },
  crm_created: { icon: FileText, tone: "text-status-neutral" },
  internal_notified: { icon: Bell, tone: "text-status-neutral" },
  email_sent: { icon: Mail, tone: "text-status-emailed" },
  email_opened: { icon: Eye, tone: "text-status-opened" },
  link_clicked: { icon: MousePointerClick, tone: "text-status-clicked" },
  appointment_booked: { icon: CalendarCheck, tone: "text-status-booked" },
  followup_triggered: { icon: Send, tone: "text-status-followup" },
  automation_failed: { icon: AlertTriangle, tone: "text-status-failed" },
};

const stageToType: Record<string, ActivityEvent["type"]> = {
  new: "lead_captured", paid: "payment_received", intake: "intake_submitted",
  emailed: "email_sent", opened: "email_opened", clicked: "link_clicked", booked: "appointment_booked",
};

const filters = ["all", "lead_captured", "payment_received", "appointment_booked", "automation_failed"] as const;

export default function ActivityFeed() {
  const { client } = useClient();
  const { data: leads = [] } = useLiveLeads(client.id);
  const events: ActivityEvent[] = useMemo(() =>
    leads
      .map(l => ({
        id: l.id, clientId: l.clientId, leadId: l.id, leadName: l.name,
        type: stageToType[l.stage] ?? "lead_captured",
        message: `is at "${l.stage}" stage`, timestamp: l.lastActivity,
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [leads],
  );
  const [filter, setFilter] = useState<typeof filters[number]>("all");
  const visible = filter === "all" ? events : events.filter(e => e.type === filter);

  return (
    <>
      <PageHeader title="Activity" description="Live event log across all leads and automations." />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
              filter === f ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-card/40 text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "all" ? "All events" : f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <section className="card-surface">
        <ul className="divide-y divide-border/50">
          {visible.map(e => {
            const { icon: Icon, tone } = map[e.type];
            return (
              <li key={e.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-elevated/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-surface/40">
                  <Icon className={cn("h-4 w-4", tone)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground">
                    <Link to={`/leads/${e.leadId}`} className="font-medium hover:text-primary">{e.leadName}</Link>{" "}
                    <span className="text-muted-foreground">{e.message}</span>
                  </p>
                  <p className="text-[10.5px] text-muted-foreground/80 capitalize">{e.type.replace(/_/g, " ")}</p>
                </div>
                <span className="text-[11px] tabular text-muted-foreground whitespace-nowrap">{timeAgo(e.timestamp)}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
