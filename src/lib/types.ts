// Shared types + presentation helpers for the operational dashboard.
// All data is live — see use-live-leads.ts, use-operational.ts, use-monitoring.ts.

export type PipelineStage = "new" | "paid" | "intake" | "emailed" | "opened" | "clicked" | "booked";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type IntakeStatus = "pending" | "complete";
export type BookingStatus = "none" | "scheduled" | "completed" | "no_show";
export type LeadStatus =
  | "new" | "paid" | "intake_complete" | "email_sent" | "opened"
  | "clicked" | "booked" | "needs_followup" | "failed";

export interface Client {
  id: string;
  name: string;
  industry: string;
  initial: string;
}

export interface Lead {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  businessType: string;
  source: string;
  payment: PaymentStatus;
  intake: IntakeStatus;
  booking: BookingStatus;
  stage: PipelineStage;
  status: LeadStatus;
  lastActivity: string;
  createdAt: string;
  value?: number;

  // Operational lifecycle (from n8n API)
  operationalState?: string;
  lifecycleStage?: string;
  infrastructureStatus?: string;
  securityStatus?: string;
  automationStatus?: string;
  oiaSubmitted?: boolean;
  oiaCompleted?: boolean;
  deploymentStarted?: boolean;
  dashboardReady?: boolean;
  goLive?: boolean;
  paymentReceived?: boolean;
  bookedCall?: boolean;
  bookingDate?: string | null;
  followupCount?: number;
  followupStatus?: string;
  nextFollowup?: string | null;
  riskLevel?: string;
  uptimePercentage?: number;
  activeAlerts?: number;
  totalIncidents?: number;
  businessName?: string | null;
  paymentAmount?: number;
}

export interface ActivityEvent {
  id: string;
  clientId: string;
  leadId?: string;
  leadName?: string;
  type:
    | "lead_captured" | "payment_received" | "intake_submitted" | "crm_created"
    | "internal_notified" | "email_sent" | "email_opened" | "link_clicked"
    | "appointment_booked" | "followup_triggered" | "automation_failed";
  message: string;
  timestamp: string;
}

export const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  paid: "Paid",
  intake_complete: "Intake Complete",
  email_sent: "Email Sent",
  opened: "Opened",
  clicked: "Clicked",
  booked: "Booked",
  needs_followup: "Needs Follow-up",
  failed: "Failed",
};

export const statusColor: Record<LeadStatus, string> = {
  new: "bg-status-new/15 text-status-new border-status-new/30",
  paid: "bg-status-paid/15 text-status-paid border-status-paid/30",
  intake_complete: "bg-status-intake/15 text-status-intake border-status-intake/30",
  email_sent: "bg-status-emailed/15 text-status-emailed border-status-emailed/30",
  opened: "bg-status-opened/15 text-status-opened border-status-opened/30",
  clicked: "bg-status-clicked/15 text-status-clicked border-status-clicked/30",
  booked: "bg-status-booked/15 text-status-booked border-status-booked/30",
  needs_followup: "bg-status-followup/15 text-status-followup border-status-followup/30",
  failed: "bg-status-failed/15 text-status-failed border-status-failed/30",
};

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
