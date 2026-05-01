import { PageHeader } from "@/components/page-header";
import { Clock, Mail, MousePointerClick, CheckCircle2, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const rules = [
  {
    icon: Clock,
    name: "Reminder if not booked after payment",
    when: "Lead paid AND intake complete AND not booked",
    after: "6 hours",
    then: "Send booking reminder email",
    status: "active",
  },
  {
    icon: Mail,
    name: "Scheduling nudge after open",
    when: "Email opened but link not clicked",
    after: "12 hours",
    then: "Send scheduling nudge email",
    status: "active",
  },
  {
    icon: MousePointerClick,
    name: "Internal alert on click without booking",
    when: "Booking link clicked but no booking",
    after: "24 hours",
    then: "Notify internal team via Slack",
    status: "active",
  },
  {
    icon: CheckCircle2,
    name: "Stop on booking",
    when: "Appointment booked",
    after: "Immediately",
    then: "Stop all follow-ups for lead",
    status: "active",
  },
  {
    icon: Bell,
    name: "Failure escalation",
    when: "Automation step fails",
    after: "Immediately",
    then: "Notify ops + log to incidents",
    status: "active",
  },
];

export default function FollowUpRules() {
  return (
    <>
      <Link to="/automations" className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to automations
      </Link>
      <PageHeader
        title="Follow-up rules"
        description="Time-based logic that drives the lead-to-booking automation. Rules execute server-side."
      />

      <div className="grid gap-3 md:grid-cols-2">
        {rules.map(r => (
          <article key={r.name} className="card-surface p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20">
                  <r.icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-[14px] font-semibold text-foreground">{r.name}</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-status-booked/15 px-2 py-0.5 text-[10px] font-medium text-status-booked">
                <span className="h-1.5 w-1.5 rounded-full bg-status-booked" />
                Active
              </span>
            </div>

            <div className="mt-4 space-y-2.5 text-[12px]">
              <RuleLine label="IF" value={r.when} tone="text-status-new" />
              <RuleLine label="AFTER" value={r.after} tone="text-status-followup" />
              <RuleLine label="THEN" value={r.then} tone="text-status-booked" />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function RuleLine({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border/60 bg-surface/40 px-3 py-2">
      <span className={`font-mono text-[10px] font-semibold tracking-wider ${tone} pt-0.5`}>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
