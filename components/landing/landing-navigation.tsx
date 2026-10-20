"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./premium-home.module.css";

const links = [
  { href: "#services", label: "Services" },
  { href: "#approach", label: "Approach" },
  { href: "/oia", label: "OIA walkthrough" },
  { href: "/about", label: "About" },
];

export function LandingNavigation() {
  const disclosure = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && disclosure.current?.open) {
        disclosure.current.open = false;
        disclosure.current.querySelector("summary")?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      const menu = disclosure.current;
      if (menu && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    };
    const leaveMenu = (event: FocusEvent) => {
      const menu = disclosure.current;
      if (menu && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", leaveMenu);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", leaveMenu);
    };
  }, []);

  return (
    <>
      <nav className={styles.desktopNav} aria-label="Primary navigation">
        {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
      </nav>
      <details className={styles.mobileNav} ref={disclosure}>
        <summary aria-label="Toggle navigation" aria-controls="landing-mobile-navigation">
          <span>Menu</span><span aria-hidden="true">☰</span>
        </summary>
        <nav id="landing-mobile-navigation" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => { if (disclosure.current) disclosure.current.open = false; }}>
              {link.label}<span aria-hidden="true">↗</span>
            </Link>
          ))}
          <Link href="/start">Get started<span aria-hidden="true">↗</span></Link>
          <a href="mailto:admin@sekinfra.com">Email Sekinfra<span aria-hidden="true">↗</span></a>
        </nav>
      </details>
    </>
  );
}
