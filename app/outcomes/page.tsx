import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { OutcomesExperience } from "@/components/outcomes/outcomes-experience";

export const metadata: Metadata = {
  title: "Business outcomes",
  description: "See the business results Sekinfra works toward: faster response, clear ownership, less manual work, better visibility, and more reliable systems.",
  alternates: { canonical: "/outcomes" },
};

export default function Outcomes() {
  return <SiteShell><OutcomesExperience /></SiteShell>;
}
