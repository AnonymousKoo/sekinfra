import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fetchAvuhzReviewQueue } from "../lib/command-center/avuhz-review-queue.ts";

const page = readFileSync(new URL("../app/(prototype)/command-center/page.tsx", import.meta.url), "utf8");
const source = readFileSync(new URL("../lib/command-center/avuhz-review-queue.ts", import.meta.url), "utf8");
const sha = (digit: string) => digit.repeat(40);

function pr(number: number, title: string, commit = sha("a"), extra = {}) {
  return {
    number, title, state: "open", draft: false,
    updated_at: "2026-10-15T02:36:40Z", base: { ref: "main" }, head: { sha: commit }, ...extra,
  };
}

function checks(status: "success" | "failure" | "running" | "none") {
  if (status === "none") return { total_count: 0, check_runs: [] };
  return { total_count: 1, check_runs: [{
    status: status === "running" ? "in_progress" : "completed",
    conclusion: status === "running" ? null : status,
  }] };
}

function fakeGitHub(open: unknown, results: Record<string, unknown>, failure = "") {
  const urls: string[] = [];
  const retrieve: typeof fetch = (async (url: string | URL | Request, options?: RequestInit) => {
    const uri = String(url);
    urls.push(uri);
    assert.equal(options?.method, "GET");
    assert.equal(options?.cache, "no-store");
    assert.equal(options?.redirect, "error");
    assert.ok(!JSON.stringify(options).match(/Authorization|Bearer|cookie|service_role|SUPABASE_/i));
    if (failure && uri.includes(failure)) throw new Error("no body disclosure");
    if (uri.includes("/pulls?")) return new Response(JSON.stringify(open), { status: 200 });
    const key = uri.match(/\/commits\/([a-f0-9]{40})\/check-runs\?/)?.[1];
    assert.ok(key && Object.hasOwn(results, key), "unapproved check URL");
    return new Response(JSON.stringify(results[key]), { status: 200 });
  }) as typeof fetch;
  return { retrieve, urls };
}

test("open PR review queue shows independently checked passing, failing, running and unverified CI", async () => {
  const input = [
    pr(690, "automation: receipt gated revenue template", sha("a")),
    pr(689, "security: check tenant isolation", sha("b")),
    pr(688, "business: operator activity", sha("c"), { draft: true }),
    pr(687, "infra: connection test", sha("d")),
    pr(686, "sensitive-user@example.org", sha("e")),
    pr(685, "invalid host", sha("f"), { base: { ref: "dev" } }),
    pr(684, "merged mistaken status", sha("0"), { state: "closed" }),
  ];
  const { retrieve, urls } = fakeGitHub(input, {
    [sha("a")]: checks("success"), [sha("b")]: checks("failure"),
    [sha("c")]: checks("running"), [sha("d")]: checks("none"),
  });
  const result = await fetchAvuhzReviewQueue(retrieve);
  assert.equal(result.state, "verified");
  assert.deepEqual(result.items.map(x => x.number), [690, 689, 688, 687]);
  assert.deepEqual(result.items.map(x => x.ci), ["passing", "failing", "running", "unknown"]);
  assert.equal(result.items[2].draft, true);
  assert.deepEqual(result.items.map(x => x.url), [690, 689, 688, 687].map(n =>
    `https://github.com/AnonymousKoo/avuhz-infra/pull/${n}`));
  assert.equal(urls.length, 5);
  assert.ok(urls.every(u => u.startsWith("https://api.github.com/repos/AnonymousKoo/avuhz-infra/")));
  assert.doesNotMatch(JSON.stringify(result), /sensitive-user@example/);
});

test("unavailable GitHub open PR response and malformed metadata fail closed", async () => {
  const bad = [null, {}, Array(9).fill(pr(1, "fake"))];
  for (const open of bad) {
    const r = await fetchAvuhzReviewQueue(fakeGitHub(open, {}).retrieve);
    assert.deepEqual(r, { state: "unavailable", items: [] });
  }
  const blocked = await fetchAvuhzReviewQueue(fakeGitHub([], {}, "/pulls?").retrieve);
  assert.deepEqual(blocked, { state: "unavailable", items: [] });
  const none = await fetchAvuhzReviewQueue(fakeGitHub([], {}).retrieve);
  assert.deepEqual(none, { state: "verified", items: [] });
});

test("rate limit or malformed check result cannot be called a passed CI", async () => {
  const item = pr(690, "automation: guarded source", sha("a"));
  for (const broken of [{ total_count: 2, check_runs: [{ status: "completed", conclusion: "success" }] },
    { total_count: 1, check_runs: [{ status: "completed", conclusion: "neutral" }] }, {}]) {
    const r = await fetchAvuhzReviewQueue(fakeGitHub([item], { [sha("a")]: broken }).retrieve);
    assert.deepEqual(r.items.map(x => x.ci), ["unknown"]);
  }
  const r = await fetchAvuhzReviewQueue(fakeGitHub([item], {}, "/check-runs?").retrieve);
  assert.deepEqual(r.items.map(x => x.ci), ["unknown"]);
  assert.equal(r.state, "verified");
});

test("review metadata stays server-side behind existing operator authorization", () => {
  assert.match(page, /fetchAvuhzReviewQueue\(\)/);
  assert.ok(page.indexOf("authorizeOperator(await headers())") <
    page.indexOf("if (!identity) notFound()"));
  assert.ok(page.indexOf("if (!identity) notFound()") <
    page.indexOf("fetchAvuhzReviewQueue()"));
  assert.match(page, /Review queue · GitHub PRs/);
  assert.match(page, /CI unverified/);
  assert.doesNotMatch(source, /NEXT_PUBLIC_|process\.env|service_role|Bearer /);
  assert.doesNotMatch(page, /NEXT_PUBLIC_AVUHZ|SUPABASE_SERVICE|Authorization:\s*Bearer/);
});
