import { PageHero } from "@/components/public-site/page-hero";
import styles from "@/components/public-site/public-premium.module.css";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicPremiumShell } from "@/components/public-site/public-premium-shell";
import { OiaWalkthrough } from "@/components/oia-walkthrough";
import "./print.css";

export const metadata: Metadata = {
  title: "OIA Walkthrough | Operational Infrastructure Assessment",
  description: "Walk through seven operational areas and prepare a preliminary OIA brief you can use with Sekinfra. No account or Avuhz connection required.",
  alternates: { canonical: "/oia" },
};

export default function OiaPage() {
  return (
    <PublicPremiumShell>
      <PageHero className="oia-no-print" eyebrow="Operational Infrastructure Assessment" title="See how your business really runs."
        visual={<div className={styles.reviewPanel}><p className={styles.label}>Your preliminary self-review</p><ul>
          <li>7 operating areas</li><li>About 8 minutes</li><li>No account needed</li><li>Copy or print your brief</li>
        </ul><p>Answers are transient in this page. Nothing is automatically saved or sent. Reloading clears them.</p></div>}>
        <p>Explore where work slows down, ownership gets unclear, and systems stop supporting the people who rely on them. This guided OIA walkthrough gives you a structured starting point for a conversation with Sekinfra.</p>
        <a href="#oia-walkthrough" className={styles.heroAction}>Begin your self-review <span aria-hidden="true">↓</span></a>
        <p className={styles.hint}>No software connection, system access, or payment is required for this preliminary self-review.</p>
      </PageHero>
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
    </PublicPremiumShell>
  );
}
