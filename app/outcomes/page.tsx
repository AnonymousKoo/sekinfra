import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { OutcomesExperience } from "@/components/outcomes/outcomes-experience";

export const metadata: Metadata = {
  title: "Operational outcomes",
  description: "See the operating states SekInfra is designed to help create through clearer ownership, visibility, coordination, and response.",
  alternates: { canonical: "/outcomes" },
};

export default function Outcomes() {
  return <SiteShell><OutcomesExperience /></SiteShell>;
}
