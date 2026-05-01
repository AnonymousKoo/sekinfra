import { useClient } from "@/lib/client-context";
import { leadsByClient, activityByClient } from "@/lib/mock-data";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { Mail, Eye, MousePointerClick, Send, AlertTriangle, Clock, Users, Workflow } from "lucide-react";
import { Link } from "react-router-dom";

export default function Automations() {
  const { client } = useClient();
  const events = activityByClient[client.id];
  const leads = leadsByClient[client.id];

  const sent = events.filter(e => e.type === "email_sent").length + Math.floor(leads.length * 0.6);
  const opens = events.filter(e => e.type === "email_opened").length + Math.floor(sent * 0.42);
  const clicks = events.filter(e => e.type === "link_clicked").length + Math.floor(opens * 0.31);
  const followups = events.filter(e => e.type === "followup_triggered").length + Math.floor(leads.length * 0.18);
  const failed = events.filter(e => e.type === "automation_failed").length + 2;
  const waiting = leads.filter(l => l.status === "needs_followup").length;

  const integrations = [
    { name: "Intake Webhook", desc: "Receives form submissions", status: "Active" },
    { name: "CRM Sync", desc: "Mirrors leads into internal CRM", status: "Active" },
    { name: "Resend Email Delivery", desc: "Transactional booking emails", status: "Active" },
    { name: "Cal.com Booking Sync", desc: "Captures booked appointments", status: "Active" },
    { name: "Follow-up Rules", desc: "Time-based reminder sequences", status: "Active" },
  ];

  return (
    <>
      <PageHeader
        title="Automations"
        description="System performance for the lead-to-booking automation layer."
        actions={
          <Link to="/automations/rules" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-[12px] font-medium hover:bg-card">
            <Workflow className="h-3.5 w-3.5" /> View rules
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Emails Sent" value={sent} icon={Mail} delta={9} />
        <MetricCard label="Email Opens" value={opens} icon={Eye} hint={`${Math.round(opens / sent * 100)}% open rate`} />
        <MetricCard label="Link Clicks" value={clicks} icon={MousePointerClick} hint={`${Math.round(clicks / opens * 100)}% click-through`} />
        <MetricCard label="Follow-ups Triggered" value={followups} icon={Send} accent="warning" />
        <MetricCard label="Failed Actions" value={failed} icon={AlertTriangle} accent="danger" delta={-3} />
        <MetricCard label="Avg. Time to Book" value="14h" icon={Clock} hint="from payment received" />
        <MetricCard label="Leads Waiting on Action" value={waiting} icon={Users} accent="warning" />
        <MetricCard label="Active Automations" value="5/5" icon={Workflow} accent="success" />
      </div>

      <section className="card-surface mt-6 p-5">
        <h2 className="text-sm font-semibold text-foreground">Integration status</h2>
        <p className="text-[11px] text-muted-foreground">All upstream and downstream services in the growth pipeline.</p>
        <ul className="mt-4 divide-y divide-border/50">
          {integrations.map(i => (
            <li key={i.name} className="flex items-center justify-between py-3">
              <div>
                <div className="text-[13px] font-medium text-foreground">{i.name}</div>
                <div className="text-[11px] text-muted-foreground">{i.desc}</div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-status-booked/15 px-2 py-0.5 text-[10.5px] font-medium text-status-booked">
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
