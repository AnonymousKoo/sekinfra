import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { OiaWalkthrough } from "@/components/oia-walkthrough";
import "./print.css";

export const metadata: Metadata = {
  title: "OIA Walkthrough | Operational Infrastructure Assessment",
  description: "Walk through seven operational areas and prepare a preliminary OIA brief you can use with Sekinfra. No account or Avuhz connection required.",
  alternates: { canonical: "/oia" },
};

export default function OiaPage() {
  return (
    <SiteShell>
      <section className="oia-no-print relative overflow-hidden bg-[var(--brand-deep)] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(185,239,112,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(185,239,112,.22),transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(135deg,black,transparent_78%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[var(--page-width)] px-5 py-14 sm:py-20 lg:px-8">
          <p className="eyebrow !text-[var(--accent)]">Operational Infrastructure Assessment</p>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-[-.06em] sm:text-6xl">
            See how your business really runs.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">
            Explore where work slows down, ownership gets unclear, and systems stop supporting the people who rely on them.
            This guided OIA walkthrough gives you a structured starting point for a conversation with Sekinfra.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-white/70">
            {["7 operating areas", "About 8 minutes", "No account needed", "Copy or print your brief"].map((label) => (
              <span key={label} className="rounded-full border border-white/20 px-3 py-2">{label}</span>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-white/60">
            No software connection, system access, or payment is required for this preliminary self-review.
          </p>
        </div>
      </section>
      <section className="bg-[var(--background)] py-12 sm:py-16" id="oia-walkthrough">
        <div className="mx-auto max-w-[var(--page-width)] px-5 lg:px-8">
          <div className="oia-no-print mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">A practical first look</p>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-.04em] sm:text-3xl">
                Start with what happens today, not what you think you need to buy.
              </h2>
            </div>
            <Link href="/start" className="text-sm font-semibold text-[var(--brand)] underline-offset-4 hover:underline">
              Need a simpler problem check? →
            </Link>
          </div>
          <OiaWalkthrough />
        </div>
      </section>
    </SiteShell>
  );
}
