import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingNavigation } from "./landing-navigation";
import { OperationsSchematic } from "./operations-schematic";
import { ServiceCard } from "./service-card";
import styles from "./premium-home.module.css";

const services = [
  {
    label: "IT, NETWORK & CLOUD",
    title: "Make critical systems more dependable.",
    description: "Understand recurring issues in your devices, network and cloud services. Find practical improvements, guided by the evidence.",
    note: "A stronger foundation for everyday work.",
    icon: "M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01M12 10v4",
  },
  {
    label: "WORKFLOWS & HANDOFFS",
    title: "Keep important work from falling between people.",
    description: "Make ownership, next steps and handoffs clearer, so requests, updates and follow-ups can keep moving.",
    note: "Less chasing. Clearer next steps.",
    icon: "M3 4h7v6H3zM14 14h7v6h-7zM10 7h7v7M14 11l3 3 3-3M6 10v7h8",
  },
  {
    label: "PERMITTED AUTOMATION",
    title: "Connect tools where it genuinely helps.",
    description: "Check what your existing tools can safely share. Plan feasible, permitted connections and automation you approve.",
    note: "Useful connections. Purposeful changes.",
    icon: "M9 7H7a5 5 0 0 0 0 10h3M15 7h2a5 5 0 0 1 0 10h-3M8 12h8",
  },
];

const steps = [
  { label: "DISCOVER", title: "Start with your reality.", description: "Tell us what is getting in the way. We listen before proposing a solution." },
  { label: "DIAGNOSE", title: "Find what needs attention.", description: "Agree on a focused review. Understand the evidence, priorities and limits." },
  { label: "IMPROVE", title: "Make purposeful changes.", description: "Keep what works. Agree on scope and approve changes before implementation." },
  { label: "SUPPORT", title: "Plan what comes next.", description: "Review what changed and agree separately on any ongoing support." },
];

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
}

function Wordmark({ priority = false }: { priority?: boolean }) {
  return (
    <Link href="/" aria-label="Sekinfra home" className={styles.wordmark}>
      <Image src="/brand/sekinfra-wordmark.webp" alt="Sekinfra" width={600} height={155} priority={priority} sizes="160px" />
    </Link>
  );
}

export function PremiumHome() {
  return (
    <div className={styles.landing}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Wordmark priority />
          <LandingNavigation />
          <Button asChild size="sm" className={styles.headerContact}><a href="mailto:admin@sekinfra.com">Let&apos;s talk<Arrow /></a></Button>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <p className={styles.eyebrow}><span aria-hidden="true" />TECHNOLOGY &amp; OPERATIONS · WORKING TOGETHER</p>
              <h1 id="hero-title">Make the different parts of your business work better together.</h1>
              <p className={styles.heroCopy}>Reliable IT, clearer workflows, and technology that supports your people instead of slowing them down.</p>
              <p className={styles.commitment}>WE KEEP WHAT WORKS.<br className={styles.mobileBreak} /> WE IMPROVE WHAT&apos;S MISSING.</p>
              <div className={styles.heroActions}>
                <Button asChild size="lg"><a href="mailto:admin@sekinfra.com">Talk through your challenge<Arrow /></a></Button>
                <Button asChild variant="secondary" size="lg"><a href="#approach">See how we work<Arrow /></a></Button>
              </div>
              <p className={styles.contactHint}>Email opens your mail app. Prefer to think it through? <Link href="/start">Start here.</Link></p>
            </div>
            <OperationsSchematic />
          </div>
        </section>

        <div className={styles.credibility}>
          <div className={`${styles.container} ${styles.credibilityInner}`}>
            <div><p className={styles.credibilityTitle}>START WITH THE BUSINESS PROBLEM.</p><p className={styles.credibilityCopy}>We diagnose first, recommend only what is needed, and keep decisions in your hands.</p></div>
            <ul aria-label="Our approach"><li>Understand first</li><li>Keep what works</li><li>Improve with purpose</li></ul>
          </div>
        </div>

        <section id="services" className={styles.services} aria-labelledby="services-title">
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <div><p className={styles.sectionLabel}>WHAT WE CAN HELP YOU IMPROVE</p><h2 id="services-title">Practical improvements.<br />Real operational value.</h2></div>
              <p>When technology and operations work together, your people can focus on the work that matters. Here&apos;s where we can help.</p>
            </div>
            <div className={styles.serviceGrid}>
              {services.map((service, index) => (
                <ServiceCard key={service.label}>
                  <div className={styles.cardTop}>
                    <span className={styles.serviceIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={service.icon} /></svg></span>
                    <span className={styles.cardNumber}>0{index + 1}</span>
                  </div>
                  <p className={styles.cardLabel}>{service.label}</p>
                  <h3>{service.title}</h3>
                  <p className={styles.cardDescription}>{service.description}</p>
                  <p className={styles.cardNote}>{service.note}</p>
                </ServiceCard>
              ))}
            </div>
            <p className={styles.scopeNote}>Services and intended outcomes, not client results. Scope, feasibility and success measures are agreed before work begins. <Link href="/outcomes">Explore example outcomes <span aria-hidden="true">↗</span></Link></p>
          </div>
        </section>

        <section id="approach" className={styles.process} aria-labelledby="process-title">
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <div><p className={styles.sectionLabel}>A CLEAR WAY FORWARD</p><h2 id="process-title">Understand first. Improve with confidence.</h2></div>
              <Link href="/oia" className={styles.textLink}>Explore the OIA walkthrough <span aria-hidden="true">↗</span></Link>
            </div>
            <ol className={styles.steps}>
              {steps.map((step, index) => <li key={step.label}>
                <span className={styles.stepToken}>0{index + 1}</span>
                <div><p className={styles.stepLabel}>{step.label}</p><h3>{step.title}</h3><p className={styles.stepDescription}>{step.description}</p></div>
              </li>)}
            </ol>
          </div>
        </section>

        <section className={styles.closing} aria-labelledby="contact-title">
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><p className={styles.eyebrow}>LET&apos;S FIND A BETTER WAY</p><h2 id="contact-title">Let&apos;s make your operations easier to run.</h2><p>Start with what&apos;s getting in the way. We&apos;ll work out the next step together.</p></div>
            <div className={styles.closingAction}>
              <Button asChild size="lg"><a href="mailto:admin@sekinfra.com">Email Sekinfra<Arrow /></a></Button>
              <a className={styles.emailAddress} href="mailto:admin@sekinfra.com">admin@sekinfra.com</a>
              <p>Website forms are not connected.<br />Email opens your mail app.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerTop}`}>
          <div><Wordmark /><p>Technology &amp; operations,<br />working together.</p></div>
          <nav aria-label="Footer navigation"><Link href="/outcomes">Outcomes</Link><Link href="/how-it-works">How it works</Link><Link href="/oia">OIA walkthrough</Link><Link href="/about">About</Link><Link href="/start">Get started</Link></nav>
          <a href="mailto:admin@sekinfra.com">admin@sekinfra.com <span aria-hidden="true">↗</span></a>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}><p>© {new Date().getFullYear()} Sekinfra</p><p>Keep what works. Improve what&apos;s missing.</p></div>
      </footer>
    </div>
  );
}
