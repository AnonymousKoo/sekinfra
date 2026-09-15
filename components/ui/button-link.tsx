import Link from "next/link";
import type { ReactNode } from "react";
type ButtonLinkProps = { href:string; children:ReactNode; variant?:"primary"|"secondary"; className?:string };
export function ButtonLink({ href, children, variant="primary", className="" }:ButtonLinkProps) { const base="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-button)] px-5 text-sm font-semibold transition duration-200"; const style=variant==="primary"?"bg-[var(--brand)] text-white hover:bg-[var(--brand-deep)]":"border border-[var(--line)] bg-white text-[var(--foreground)] hover:border-[var(--brand)] hover:bg-[var(--surface-muted)]"; return <Link href={href} className={`${base} ${style} ${className}`}>{children}<span aria-hidden="true" className="ml-2">→</span></Link>; }
