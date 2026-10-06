import Image from"next/image";
import Link from"next/link";

export function SiteFooter(){
  return <footer className="tech-footer border-t border-[var(--line)]">
    <div className="mx-auto flex max-w-[var(--page-width)] flex-col gap-8 px-5 py-10 text-sm md:flex-row md:items-end md:justify-between lg:px-8">
      <div>
        <Link href="/" className="inline-flex" aria-label="Sekinfra home">
          <Image src="/brand/sekinfra-wordmark.webp" alt="Sekinfra" width={600} height={155} className="h-11 w-auto mix-blend-multiply" style={{filter:"hue-rotate(13deg) saturate(1.2) brightness(1.35)"}}/>
        </Link>
        <p className="mt-3 max-w-md text-[var(--ink-muted)]">We build and fix the systems your business runs on, from daily work and automation to cloud, network, security, compliance, and business software.</p>
      </div>
      <div className="flex flex-col gap-5 md:items-end">
        <div className="flex flex-col gap-1 text-[var(--ink-muted)] md:items-end">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink)]">Contact</p>
          <a href="mailto:admin@sekinfra.com" className="transition-colors hover:text-[var(--ink)]">admin@sekinfra.com</a>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-[var(--ink-muted)]">
          <Link href="/outcomes">Outcomes</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/about">About</Link>
          <Link href="/start">Show us what&apos;s happening</Link>
        </div>
      </div>
    </div>
  </footer>
}
