import type { Metadata } from "next";
import { PublicPremiumShell } from "@/components/public-site/public-premium-shell";
import { OutcomesExperience } from "@/components/outcomes/outcomes-experience";

export const metadata: Metadata = {
  title: "Business outcomes",
  description: "See the business results Sekinfra works toward: faster response, clear ownership, less manual work, better visibility, stronger compliance, and more reliable systems.",
  alternates: { canonical: "/outcomes" },
};

export default function Outcomes() {
  return <PublicPremiumShell><OutcomesExperience /></PublicPremiumShell>;
}
