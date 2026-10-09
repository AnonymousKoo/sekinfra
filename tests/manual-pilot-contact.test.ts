import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

test("prospects can contact Sekinfra directly without completing triage", () => {
  const page = read("app/start/page.tsx");
  assert.match(page, /Email Sekinfra to get started/);
  assert.match(page, /href="mailto:admin@sekinfra\.com"/);
  assert.match(page, /do not need to finish this problem check first/);
});

test("prepared diagnostic intake has explicit copy-then-email handoff", () => {
  const intake = read("components/diagnostic-intake.tsx");
  assert.match(intake, /1\. Copy my request/);
  assert.match(intake, /2\. Email Sekinfra/);
  assert.match(intake, /paste the request, and press Send in your email app/);
  assert.match(intake, /This website does not send or save your details/);
});

test("mail links carry no customer PII, request body or URL parameters", () => {
  for (const file of ["app/start/page.tsx", "components/diagnostic-intake.tsx"]) {
    const source = read(file);
    const links = [...source.matchAll(/href="(mailto:[^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(links, ["mailto:admin@sekinfra.com"]);
    assert.ok(!links[0]?.includes("?"));
    assert.doesNotMatch(source, /(?:fetch|navigator\.sendBeacon)\s*\(/);
  }
});
