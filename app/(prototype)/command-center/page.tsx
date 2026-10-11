import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CommandCenterExperience } from "@/components/command-center/command-center-experience";
import { orderedWorkspaceEngagements, oiaWorkspaceFixture } from "@/fixtures/oia-workspace";
import { isPrototypeRouteBlocked } from "@/lib/prototype-route";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sekinfra Command Center — preview",
  robots: { index: false, follow: false, nocache: true },
  description: "Private operator command center concept. Synthetic data; no live accounts or control-plane actions.",
};

export default function CommandCenterPreviewPage() {
  // The public production website must NEVER expose an operator UI, even one
  // containing only demonstrations. A separately authenticated private
  // deployment and reviewed read APIs are required for a real command center.
  if (
    isPrototypeRouteBlocked(process.env.VERCEL_ENV) ||
    (process.env.VERCEL_ENV !== "preview" && process.env.NODE_ENV !== "development")
  ) notFound();

  const engagements = orderedWorkspaceEngagements.map((item) => ({
    id: item.identity.engagementId,
    organization: item.identity.organization,
    label: item.identity.label,
    stage: item.stage,
    attention: item.presentationAttentionOwner?.owner === "SEKINFRA" ? "SEKINFRA" as const : item.presentationAttentionOwner?.owner === "CLIENT" ? "CLIENT" as const : "MONITOR" as const,
    nextAction: item.readModel?.nextRequiredAction.code ?? null,
    assessmentState: item.assessmentState ?? null,
  }));

  return <CommandCenterExperience
    engagements={engagements}
    referenceLabel={oiaWorkspaceFixture.referenceTimeLabel}
  />;
}
