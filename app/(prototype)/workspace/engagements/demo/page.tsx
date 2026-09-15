import type { Metadata } from "next";
import { OperatorEngagementView } from "@/components/workspace/operator-engagement-view";

export const metadata: Metadata = {
  title: "Synthetic OIA operator engagement",
  description: "Read only synthetic SekInfra OIA operator experience demonstration.",
  robots: { index: false, follow: false },
};

export default function OperatorDemoPage() {
  return <OperatorEngagementView />;
}
