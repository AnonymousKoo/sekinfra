import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const routes = ["about", "how-it-works", "outcomes", "start", "oia"];

test("all public interiors use the scoped premium shell and preserve canonical metadata", () => {
  for (const route of routes) {
    const source = read(`app/${route}/page.tsx`);
    assert.match(source, /<PublicPremiumShell>/);
    assert.ok(source.includes(`canonical: "/${route}"`));
    assert.doesNotMatch(source, /<SiteShell>/);
  }
  assert.match(read("app/page.tsx"), /PremiumHome/);
  const shell = read("components/public-site/public-premium-shell.tsx");
  assert.match(shell, /Skip to content/);
  assert.match(shell, /id="main-content" tabIndex=\{-1\}/);
  assert.match(shell, /LandingNavigation/);
  assert.match(shell, /PremiumFooter/);
  assert.match(shell, /sekinfra-wordmark.webp/);
});

test("shared navigation exposes every interior route and valid cross-page service links", () => {
  const nav = read("components/landing/landing-navigation.tsx");
  for (const route of routes) assert.ok(nav.includes(`"/${route}"`));
  assert.match(nav, /"\/#services"/);
  assert.match(read("components/landing/premium-home.tsx"), /id="services"/);
  assert.match(nav, /aria-current=\{pathname === link.href/);
  assert.match(nav, /event.key === "Escape"/);
  assert.match(nav, /querySelector\("summary"\)\?\.focus/);
  assert.match(nav, /focusin/);
});

test("new public presentation keeps manual contact and has no data transport or persistence", () => {
  const files = [
    ...routes.map((route) => `app/${route}/page.tsx`),
    "components/public-site/public-premium-shell.tsx", "components/public-site/page-hero.tsx",
    "components/outcomes/outcomes-experience.tsx", "components/oia-walkthrough.tsx", "components/diagnostic-triage.tsx",
  ];
  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /\bfetch\s*\(|sendBeacon|localStorage|sessionStorage|document\.cookie|process\.env/);
    const links = [...source.matchAll(/href="(mailto:[^"]+)"/g)].map((match) => match[1]);
    assert.ok(links.every((link) => link === "mailto:admin@sekinfra.com"));
  }
  assert.match(read("components/public-site/public-premium-shell.tsx"), /Website forms do not send requests/);
  assert.match(read("components/outcomes/outcomes-experience.tsx"), /Hypothetical examples.*not client results or guaranteed outcomes/);
});

test("OIA retains transient answers, manual export, labels and print isolation", () => {
  const oia = read("components/oia-walkthrough.tsx");
  for (const feature of [/useState/, /navigator.clipboard/, /window.print/, /Edit answers/, /Start over/, /Reloading clears them/, /htmlFor="oia-note"/]) assert.match(oia, feature);
  assert.match(read("app/oia/print.css"), /\.oia-print-report/);
  const css = read("components/public-site/public-premium.module.css");
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media print/);
  assert.match(css, /focus-visible/);
});
