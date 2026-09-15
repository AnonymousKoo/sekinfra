import type { Metadata } from "next";
import { ClientEngagementView } from "@/components/workspace/client-engagement-view";

export const metadata: Metadata = {
  title: "Synthetic OIA client engagement",
  description: "Read only synthetic SekInfra OIA client experience demonstration.",
  robots: { index: false, follow: false },
};

export default function ClientDemoPage() {
  return <ClientEngagementView />;
}
