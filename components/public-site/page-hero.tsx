import type { ReactNode } from "react";
import styles from "./public-premium.module.css";

export function PageHero({ eyebrow, title, children, visual, className = "" }: {
  eyebrow: string; title: string; children: ReactNode; visual?: ReactNode; className?: string;
}) {
  return <section className={`${styles.hero} ${className}`} aria-labelledby="page-title">
    <div className={`${styles.container} ${styles.heroGrid} ${visual ? "" : styles.heroSingle}`}>
      <div><p className={styles.label}>{eyebrow}</p><h1 id="page-title">{title}</h1><div className={styles.heroCopy}>{children}</div></div>
      {visual && <div className={styles.heroVisual}>{visual}</div>}
    </div>
  </section>;
}

export function PremiumSection({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <section className={`${styles.section} ${dark ? styles.dark : ""}`}><div className={styles.container}>{children}</div></section>;
}

export function PremiumCard({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return <article className={styles.card}><span className={styles.number}>0{number}</span><h3>{title}</h3><p>{children}</p></article>;
}
