import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OperatorWorkspaceOverview } from "@/components/workspace/operator-workspace-views";
import { isPrototypeRouteBlocked } from "@/lib/prototype-route";

export const metadata: Metadata = {
  title: "Synthetic OIA operator workspace",
  robots: { index: false, follow: false },
};

export default function WorkspacePage() {
  if (isPrototypeRouteBlocked(process.env.VERCEL_ENV)) notFound();
  return <OperatorWorkspaceOverview />;
}
