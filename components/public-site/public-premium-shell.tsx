import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ContextFocus } from "@/components/context-focus";
import { LandingNavigation } from "@/components/landing/landing-navigation";
import brand from "@/components/landing/premium-home.module.css";
import styles from "./public-premium.module.css";

export function PublicWordmark() {
  return <Link href="/" aria-label="Sekinfra home" className={brand.wordmark}>
    <Image src="/brand/sekinfra-wordmark.webp" alt="Sekinfra" width={600} height={155} sizes="160px" />
  </Link>;
}

export function PremiumFooter() {
  return <footer className={`${brand.footer} ${styles.footer}`}>
    <div className={`${brand.container} ${brand.footerTop}`}>
      <div><PublicWordmark /><p>Technology &amp; operations,<br />working together.</p></div>
      <nav aria-label="Footer navigation">
        <Link href="/outcomes">Outcomes</Link><Link href="/how-it-works">How it works</Link>
        <Link href="/oia">OIA walkthrough</Link><Link href="/about">About</Link><Link href="/start">Get started</Link>
      </nav>
      <div><a href="mailto:admin@sekinfra.com">admin@sekinfra.com ↗</a><p>Email opens your mail app.<br />Website forms do not send requests.</p></div>
    </div>
    <div className={`${brand.container} ${brand.footerBottom}`}>
      <p>© {new Date().getFullYear()} Sekinfra</p>
      <p>Scope and access agreed first. Implementation and support approved separately.</p>
    </div>
  </footer>;
}

export function PublicPremiumShell({ children }: { children: ReactNode }) {
  return <div className={`${brand.landing} ${styles.site}`}>
    <a className={brand.skipLink} href="#main-content">Skip to content</a>
    <header className={brand.header}>
      <div className={`${brand.container} ${brand.headerInner}`}>
        <PublicWordmark /><LandingNavigation />
        <a href="mailto:admin@sekinfra.com" className={styles.contact}>Let’s talk <span aria-hidden="true">↗</span></a>
      </div>
    </header>
    <div className="oia-no-print"><ContextFocus /></div>
    <main id="main-content" tabIndex={-1}>{children}</main>
    <PremiumFooter />
  </div>;
}
