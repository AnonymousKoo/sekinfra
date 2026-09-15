import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OperatorEngagementView } from "@/components/workspace/operator-engagement-view";
import { isPrototypeRouteBlocked } from "@/lib/prototype-route";

export const metadata: Metadata = {
  title: "Synthetic OIA operator engagement",
  description: "Read only synthetic SekInfra OIA operator experience demonstration.",
  robots: { index: false, follow: false },
};

export default function OperatorDemoPage() {
  if (isPrototypeRouteBlocked()) notFound();
  return <OperatorEngagementView />;
}
