import Image from"next/image";
import Link from"next/link";

export function SiteFooter(){
  return <footer className="border-t border-[var(--line)]">
    <div className="mx-auto flex max-w-[var(--page-width)] flex-col gap-8 px-5 py-10 text-sm md:flex-row md:items-end md:justify-between lg:px-8">
      <div>
        <Link href="/" className="inline-flex" aria-label="Sekinfra home">
          <Image src="/brand/sekinfra-wordmark.webp" alt="Sekinfra" width={600} height={155} className="h-11 w-auto mix-blend-multiply"/>
        </Link>
        <p className="mt-3 max-w-md text-[var(--ink-muted)]">We build and fix the systems businesses run on—across operations, automation, cloud, network, security, and business systems.</p>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-3 text-[var(--ink-muted)]">
        <Link href="/outcomes">Outcomes</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/about">About</Link>
        <Link href="/start">Tell us what&apos;s happening</Link>
      </div>
    </div>
  </footer>
}
