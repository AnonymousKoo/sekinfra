import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OperatorEngagementIndex } from "@/components/workspace/operator-workspace-views";
import { isPrototypeRouteBlocked } from "@/lib/prototype-route";

export const metadata: Metadata = {
  title: "Synthetic OIA engagement index",
  robots: { index: false, follow: false },
};

export default function WorkspaceEngagementsPage() {
  if (isPrototypeRouteBlocked(process.env.VERCEL_ENV)) notFound();
  return <OperatorEngagementIndex />;
}
