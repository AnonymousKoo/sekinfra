import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { fetchAvuhzActivity } from "../lib/command-center/avuhz-activity.ts";

const source = readFileSync(new URL("../app/(prototype)/command-center/page.tsx", import.meta.url), "utf8");
const moduleSource = readFileSync(new URL("../lib/command-center/avuhz-activity.ts", import.meta.url), "utf8");

function record(
  number: number,
  title: string,
  merged_at: string | null = "2026-10-15T01:23:39Z",
  base: unknown = { ref: "main" },
) {
  return { number, title, merged_at, base };
}

function stub(payload: unknown, status = 200) {
  const calls: Array<[unknown, RequestInit | undefined]> = [];
  const fn: typeof fetch = (async (url: unknown, options: RequestInit | undefined) => {
    calls.push([url, options]);
    return new Response(JSON.stringify(payload), { status });
  }) as typeof fetch;
  return { fn, calls };
}

test("activity source accepts only verified public main-branch merge metadata", async () => {
  const input = [
    record(689, "test: certify shared System 001 due-work journey"),
    record(688, "data: prepare guarded work deadline migration", "2026-10-15T00:59:16Z"),
    record(687, "business: add shared due-work reader", "2026-10-15T00:14:15Z"),
    record(686, "security: verify tenant RLS", "2026-10-14T23:53:32Z"),
    record(685, "automation: shared receiver", "2026-10-14T23:36:51Z"),
    record(684, "unmerged change", null),
    record(683, "wrong base", "2026-10-14T22:00:00Z", { ref: "development" }),
    record(682, "contact sales@customer.example for details"),
    record(681, "https://user.example/api-key"),
    record(680, "bad date", "2026-10-99T00:00:00Z"),
    record(-1, "bad id"),
    record(678, "also invalid: 🧨"),
  ];
  const { fn, calls } = stub(input);
  const result = await fetchAvuhzActivity(fn);
  assert.equal(result.state, "verified");
  assert.deepEqual(result.events.map(x => x.number), [689, 688, 687, 686, 685]);
  assert.deepEqual(result.events.map(x => x.lane),
    ["Infrastructure", "Infrastructure", "Business", "Security", "Automation"]);
  assert.ok(result.events.every(x => x.url.startsWith("https://github.com/AnonymousKoo/avuhz-infra/pull/")));
  assert.equal(calls.length, 1);
  assert.match(String(calls[0][0]), /^https:\/\/api\.github\.com\/repos\/AnonymousKoo\/avuhz-infra\/pulls\?/);
  assert.equal(calls[0][1]?.method, "GET");
  assert.equal(calls[0][1]?.cache, "no-store");
  assert.equal(calls[0][1]?.redirect, "error");
  assert.doesNotMatch(JSON.stringify(calls[0][1]), /Authorization|cookie|token|service_role|SUPABASE_/i);
});

test("GitHub failures, altered shape, overlarge payload and provider exception fail closed", async () => {
  for (const [payload, status] of [[{ error: "not an array" }, 200], [[], 503],
    [Array(13).fill(record(1, "business: sample")), 200]] as const) {
    const result = await fetchAvuhzActivity(stub(payload, status).fn);
    assert.deepEqual(result, { state: "unavailable", events: [] });
  }
  const huge: typeof fetch = (async () => new Response("[]", {
    status: 200, headers: { "content-length": "9999999" },
  })) as typeof fetch;
  assert.deepEqual(await fetchAvuhzActivity(huge), { state: "unavailable", events: [] });
  const failing: typeof fetch = (async () => { throw new Error("do not disclose"); }) as typeof fetch;
  assert.deepEqual(await fetchAvuhzActivity(failing), { state: "unavailable", events: [] });
});

test("private Command Center alone owns Avuhz Activity after verified operator guard", () => {
  const authIndex = source.indexOf("authorizeOperator(await headers())");
  const deniedIndex = source.indexOf("if (!identity) notFound()");
  const fetchIndex = source.indexOf("fetchAvuhzActivity()");
  assert.ok(authIndex >= 0 && deniedIndex > authIndex && fetchIndex > deniedIndex);
  assert.match(source, /id="activity"/);
  assert.match(source, /"Security", "Infrastructure", "Automation", "Business"/);
  assert.match(source, /Supabase tenant activity, Render deployment history and n8n workflow executions are not connected/);
  assert.doesNotMatch(source, /NEXT_PUBLIC_AVUHZ|service_role|SUPABASE_SERVICE|Authorization:\s*Bearer/);
  assert.doesNotMatch(moduleSource, /process\.env|NEXT_PUBLIC_|Bearer |service_role/);
});
