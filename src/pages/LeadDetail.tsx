import { useParams, Link, useNavigate } from "react-router-dom";
import { useClient } from "@/lib/client-context";
import { leadsByClient, activityByClient, timeAgo, statusLabels, ActivityEvent } from "@/lib/mock-data";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Send, CheckCircle2, FileText, ExternalLink, FileCheck, CreditCard, Bell, MousePointerClick, Eye, CalendarCheck, UserPlus } from "lucide-react";

const eventIcon: Record<ActivityEvent["type"], any> = {
  lead_captured: UserPlus,
  payment_received: CreditCard,
  intake_submitted: FileCheck,
  crm_created: FileText,
  internal_notified: Bell,
  email_sent: Mail,
  email_opened: Eye,
  link_clicked: MousePointerClick,
  appointment_booked: CalendarCheck,
  followup_triggered: Send,
  automation_failed: Bell,
};

export default function LeadDetail() {
  const { id } = useParams();
  const { client } = useClient();
  const navigate = useNavigate();
  const lead = leadsByClient[client.id].find(l => l.id === id);

  if (!lead) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Lead not found in {client.name}.</p>
        <button onClick={() => navigate("/leads")} className="mt-4 text-primary hover:underline">Back to leads</button>
      </div>
    );
  }

  // Build a synthetic timeline from the activity feed + lead state
  const events = activityByClient[client.id]
    .filter(e => e.leadId === lead.id)
    .slice(0, 8);

  const fallback: { type: ActivityEvent["type"]; label: string; iso: string }[] = [
    { type: "lead_captured", label: "Lead captured from " + lead.source, iso: lead.createdAt },
    ...(lead.payment === "paid" ? [{ type: "payment_received" as const, label: "Payment received · $" + (lead.value ?? 0), iso: lead.createdAt }] : []),
    ...(lead.intake === "complete" ? [{ type: "intake_submitted" as const, label: "Intake form submitted", iso: lead.createdAt }] : []),
    ...(["emailed","opened","clicked","booked"].includes(lead.stage) ? [{ type: "email_sent" as const, label: "Booking email sent via Resend", iso: lead.lastActivity }] : []),
    ...(["opened","clicked","booked"].includes(lead.stage) ? [{ type: "email_opened" as const, label: "Email opened", iso: lead.lastActivity }] : []),
    ...(["clicked","booked"].includes(lead.stage) ? [{ type: "link_clicked" as const, label: "Booking link clicked", iso: lead.lastActivity }] : []),
    ...(lead.stage === "booked" ? [{ type: "appointment_booked" as const, label: "Appointment scheduled via Cal.com", iso: lead.lastActivity }] : []),
  ];

  const timeline = (events.length > 0 ? events.map(e => ({ type: e.type, label: e.message, iso: e.timestamp })) : fallback).slice().reverse();

  return (
    <>
      <Link to="/leads" className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to leads
      </Link>

      <PageHeader
        title={lead.name}
        description={lead.email}
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-[12px] font-medium hover:bg-card">
              <FileText className="h-3.5 w-3.5" /> Add note
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-[12px] font-medium hover:bg-card">
              <ExternalLink className="h-3.5 w-3.5" /> View booking link
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-[12px] font-medium hover:bg-card">
              <Send className="h-3.5 w-3.5" /> Send follow-up
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90">
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark as booked
            </button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Profile */}
        <section className="card-surface p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          <dl className="mt-4 space-y-3 text-[12.5px]">
            <Field icon={Mail} label="Email" value={<span className="font-mono text-[11.5px]">{lead.email}</span>} />
            <Field icon={Phone} label="Phone" value={<span className="tabular">{lead.phone}</span>} />
            <Field icon={MapPin} label="Location" value={lead.location} />
            <Field icon={Briefcase} label="Business type" value={lead.businessType} />
            <Field icon={ExternalLink} label="Source" value={lead.source} />
          </dl>

          <div className="mt-5 border-t border-border/60 pt-4 space-y-2.5">
            <Row label="Payment" value={lead.payment === "paid" ? "Paid" : "Unpaid"} ok={lead.payment === "paid"} />
            <Row label="Intake" value={lead.intake === "complete" ? "Complete" : "Pending"} ok={lead.intake === "complete"} />
            <Row label="Booking" value={lead.booking === "scheduled" ? "Scheduled" : "Not scheduled"} ok={lead.booking === "scheduled"} />
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-muted-foreground">Current stage</span>
              <StatusBadge status={lead.status} />
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="card-surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Event timeline</h2>
            <span className="text-[11px] text-muted-foreground">{timeline.length} events</span>
          </div>
          <ol className="mt-5 relative space-y-5 border-l border-border/60 pl-6">
            {timeline.map((e, i) => {
              const Icon = eventIcon[e.type] ?? FileText;
              return (
                <li key={i} className="relative">
                  <span className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface">
                    <Icon className="h-3 w-3 text-primary" />
                  </span>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13px] text-foreground">{e.label}</p>
                    <span className="text-[10.5px] tabular text-muted-foreground whitespace-nowrap">{timeAgo(e.iso)}</span>
                  </div>
                  <p className="mt-0.5 text-[10.5px] text-muted-foreground/80 capitalize">{e.type.replace(/_/g, " ")}</p>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </>
  );
}

function Field({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-foreground truncate">{value}</dd>
      </div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1.5 text-foreground">
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-status-booked" : "bg-muted-foreground/40"}`} />
        {value}
      </span>
    </div>
  );
}
