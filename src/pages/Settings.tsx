import { useClient } from "@/lib/client-context";
import { PageHeader } from "@/components/page-header";
import { Building2, Mail, Link as LinkIcon, Webhook, Plug, CheckCircle2 } from "lucide-react";

export default function Settings() {
  const { client } = useClient();

  return (
    <>
      <PageHeader title="Settings" description={`Workspace configuration for ${client.name}.`} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={Building2} title="Business profile" desc="How this workspace is presented to clients">
          <Field label="Business name" value={client.name} />
          <Field label="Industry" value={client.industry} />
          <Field label="Time zone" value="America/New_York" />
        </Section>

        <Section icon={Mail} title="Email sender" desc="Outbound email identity (Resend)">
          <Field label="From name" value="SEKINFRA Bookings" />
          <Field label="From address" value="bookings@sekinfra.com" mono />
          <Field label="Reply-to" value="ops@sekinfra.com" mono />
        </Section>

        <Section icon={LinkIcon} title="Booking link" desc="Cal.com endpoint sent in booking emails">
          <Field label="Booking URL" value="cal.com/sekinfra/intro" mono />
          <Field label="Slot duration" value="30 minutes" />
        </Section>

        <Section icon={Webhook} title="Form / Webhook status">
          <Status label="Intake form webhook" ok detail="Last event 3m ago" />
          <Status label="Payment webhook" ok detail="Last event 14m ago" />
          <Status label="Booking webhook" ok detail="Last event 41m ago" />
        </Section>

        <Section icon={Plug} title="Integrations" desc="Connected services" full>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "Resend (email)",
              "Cal.com (booking)",
              "Stripe (payments)",
              "Internal CRM",
              "Slack alerts",
              "Postgres (Supabase-ready)",
            ].map(s => (
              <div key={s} className="flex items-center justify-between rounded-md border border-border/60 bg-surface/40 px-3 py-2">
                <span className="text-[12.5px] text-foreground">{s}</span>
                <span className="inline-flex items-center gap-1 text-[10.5px] text-status-booked">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}

function Section({ icon: Icon, title, desc, children, full }: any) {
  return (
    <section className={`card-surface p-5 ${full ? "lg:col-span-2" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {desc && <p className="text-[11px] text-muted-foreground">{desc}</p>}
        </div>
      </div>
      <div className="mt-4 space-y-2.5">{children}</div>
    </section>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 bg-surface/40 px-3 py-2">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-[12.5px] text-foreground ${mono ? "font-mono text-[11.5px]" : ""}`}>{value}</span>
    </div>
  );
}

function Status({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 bg-surface/40 px-3 py-2">
      <div>
        <div className="text-[12.5px] text-foreground">{label}</div>
        <div className="text-[10.5px] text-muted-foreground">{detail}</div>
      </div>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${ok ? "bg-status-booked/15 text-status-booked" : "bg-status-failed/15 text-status-failed"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-status-booked" : "bg-status-failed"}`} />
        {ok ? "Active" : "Down"}
      </span>
    </div>
  );
}
