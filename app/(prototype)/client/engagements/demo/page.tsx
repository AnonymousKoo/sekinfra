import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientEngagementView } from "@/components/workspace/client-engagement-view";
import { isPrototypeRouteBlocked } from "@/lib/prototype-route";

export const metadata: Metadata = {
  title: "Synthetic OIA client engagement",
  description: "Read only synthetic SekInfra OIA client experience demonstration.",
  robots: { index: false, follow: false },
};

export default function ClientDemoPage() {
  if (isPrototypeRouteBlocked()) notFound();
  return <ClientEngagementView />;
}
