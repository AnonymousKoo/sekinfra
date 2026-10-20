import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const publicFiles = [
  "app/page.tsx",
  "components/landing/premium-home.tsx",
  "components/landing/landing-navigation.tsx",
  "components/landing/operations-schematic.tsx",
  "components/landing/service-card.tsx",
];

test("premium homepage keeps contact manual and carries no visitor data in email links", () => {
  const source = publicFiles.map(read).join("\n");
  const mailLinks = [...source.matchAll(/href="(mailto:[^"]+)"/g)].map((match) => match[1]);
  assert.ok(mailLinks.length > 0);
  assert.ok(mailLinks.every((href) => href === "mailto:admin@sekinfra.com"));
  assert.match(source, /Website forms are not connected/);
  assert.match(source, /Email opens your mail app/);
  assert.doesNotMatch(source, /<form\b|\bfetch\s*\(|sendBeacon|localStorage|sessionStorage|document\.cookie|process\.env|\/api\//);
  assert.doesNotMatch(source, /(?:from|import\s*\()\s*["'][^"']*(?:command-center|consulting|supabase|avuhz|auth)/i);
});

test("public navigation retains start and OIA access alongside valid homepage sections", () => {
  const home = read("components/landing/premium-home.tsx");
  const navigation = read("components/landing/landing-navigation.tsx");
  assert.match(home, /href="\/start"/);
  assert.match(home, /href="\/oia"/);
  for (const [, fragment] of [...(home + navigation).matchAll(/(?:href: |href=)"#([^"]+)"/g)]) {
    assert.ok(home.includes(`id="${fragment}"`), `Missing destination for #${fragment}`);
  }
  assert.match(home, /src="\/brand\/sekinfra-wordmark\.webp"/);
  assert.ok(statSync(new URL("public/brand/sekinfra-wordmark.webp", root)).size > 1000);
});
