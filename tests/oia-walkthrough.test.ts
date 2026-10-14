import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { OIA_AREAS, buildOiaBrief, summarizeOia, type OiaDraft, type OiaResponse } from "../lib/oia-walkthrough.ts";

const allConsistent = (): OiaDraft => ({
  organization: "Fictional Midstate Example",
  objective: "Reduce repeat work",
  answers: Object.fromEntries(OIA_AREAS.map((area) => [area.id, "consistent"])),
  notes: {},
});

test("seven real operating areas have unique, meaningful inspection questions", () => {
  assert.equal(OIA_AREAS.length, 7);
  assert.equal(new Set(OIA_AREAS.map((item) => item.id)).size, 7);
  for (const area of OIA_AREAS) {
    assert.ok(area.question.length > 35);
    assert.ok(area.investigation.length > 35);
    assert.ok(area.outcome.length > 30);
  }
});

test("self-reported consistent answers do not invent a diagnosis or priority", () => {
  const result = summarizeOia(allConsistent());
  assert.equal(result.frequent, 0);
  assert.equal(result.sometimes, 0);
  assert.equal(result.unknown, 0);
  assert.deepEqual(result.priority, []);
  assert.match(result.headline, /no major friction reported/i);
});

test("recurring concerns rank before inconsistent and unknown, without inventing risk scores", () => {
  const draft = allConsistent();
  draft.answers.intake = "unknown";
  draft.answers.ownership = "sometimes";
  draft.answers.systems = "frequent";
  draft.answers.controls = "frequent";
  draft.answers.visibility = "sometimes";
  const result = summarizeOia(draft);
  assert.deepEqual(result.priority.map((item) => item.id), ["systems", "controls", "ownership"]);
  assert.deepEqual([result.frequent, result.sometimes, result.unknown], [2, 2, 1]);
});

test("incomplete or unrecognized responses never produce a brief", () => {
  const draft = allConsistent();
  delete draft.answers.reliability;
  assert.throws(() => summarizeOia(draft), /complete every area/i);
  assert.throws(() => buildOiaBrief(draft), /complete every area/i);
  draft.answers.reliability = "certified-safe" as OiaResponse;
  assert.throws(() => summarizeOia(draft), /complete every area/i);
});

test("brief contains actual self-reported notes, clear evidence limits and manual-only sharing", () => {
  const draft = allConsistent();
  draft.notes.ownership = "Assignment gets missed during an unusual shift change.";
  draft.answers.ownership = "frequent";
  draft.answers.controls = "unknown";
  const brief = buildOiaBrief(draft);
  assert.match(brief, /Fictional Midstate Example/);
  assert.match(brief, /Assignment gets missed/);
  assert.match(brief, /Handoffs|handoff/i);
  assert.match(brief, /preliminary OIA walkthrough/i);
  assert.match(brief, /not a completed/i);
  assert.match(brief, /scope, deliverables, fee and timing/i);
  assert.match(brief, /automatically submitted or saved/i);
  assert.doesNotMatch(brief, /compliance certified|guaranteed/i);
});

test("public UI requires no storage, API submission, access credential or Avuhz backend", () => {
  const component = readFileSync(new URL("../components/oia-walkthrough.tsx", import.meta.url), "utf8");
  const page = readFileSync(new URL("../app/oia/page.tsx", import.meta.url), "utf8");
  const backend = readFileSync(new URL("../app/api/diagnostic-intake/route.ts", import.meta.url), "utf8");
  assert.match(page, /OiaWalkthrough/);
  assert.match(component, /buildOiaBrief/);
  assert.match(component, /navigator\.clipboard/);
  assert.match(component, /window\.print/);
  assert.match(component, /mailto:admin@sekinfra\.com/);
  for (const forbidden of [/\bfetch\s*\(/, /localStorage/, /sessionStorage/, /sendBeacon/, /\baxios\b/, /document\.cookie/]) {
    assert.doesNotMatch(component + page, forbidden);
  }
  assert.match(backend, /INTAKE_NOT_CONNECTED/);
  assert.match(backend, /status: 503/);
});

test("both desktop and mobile visitors can reach OIA from the site navigation and start path", () => {
  const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(sitemap, /"\/oia"/);
  for (const name of [
    "../components/site-header.tsx",
    "../components/mobile-nav.tsx",
    "../components/site-footer.tsx",
    "../app/start/page.tsx",
    "../components/diagnostic-triage.tsx",
  ]) {
    const content = readFileSync(new URL(name, import.meta.url), "utf8");
    assert.match(content, /\/oia/);
  }
});
