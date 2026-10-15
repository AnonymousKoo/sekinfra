/** Read-only open PR queue for the PRIVATE operator Command Center.
 * Reuses public GitHub metadata, not tenant data or n8n execution status.
 * Call ONLY after signed Cloudflare operator authentication succeeds.
 */
export type AvuhzReviewStatus = "passing" | "failing" | "running" | "unknown";
export type AvuhzReviewItem = Readonly<{
  number: number;
  title: string;
  updatedAt: string;
  draft: boolean;
  ci: AvuhzReviewStatus;
  url: string;
}>;
export type AvuhzReviewQueue = Readonly<{
  state: "verified" | "unavailable";
  items: readonly AvuhzReviewItem[];
}>;

const REPO = "https://api.github.com/repos/AnonymousKoo/avuhz-infra";
const OPEN_URL = REPO + "/pulls?state=open&sort=updated&direction=desc&per_page=8";
const TITLE = /^[A-Za-z0-9][A-Za-z0-9 .,:;()#/_+!?&-]{0,139}$/;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const SHA = /^[a-f0-9]{40}$/;
const MAX_BODY = 512_000;

function safeDate(value: unknown): value is string {
  return typeof value === "string" && ISO_UTC.test(value) && !Number.isNaN(Date.parse(value));
}

async function publicJSON(url: string, retrieve: typeof fetch): Promise<unknown> {
  const response = await retrieve(url, {
    method: "GET",
    headers: { Accept: "application/vnd.github+json" },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(3500),
  });
  if (response.status !== 200 || !response.ok) throw new Error("source_unavailable");
  const len = Number(response.headers.get("content-length") || "0");
  if (!Number.isSafeInteger(len) || len > MAX_BODY) throw new Error("source_unavailable");
  const body = await response.text();
  if (body.length > MAX_BODY) throw new Error("source_unavailable");
  return JSON.parse(body) as unknown;
}

type SafeCandidate = Omit<AvuhzReviewItem, "ci"> & { head: string };
function candidate(value: unknown): SafeCandidate | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const base = row.base;
  const head = row.head;
  if (!Number.isSafeInteger(row.number) || (row.number as number) < 1
    || (row.number as number) > 999_999
    || row.state !== "open"
    || typeof row.draft !== "boolean"
    || typeof row.title !== "string" || !TITLE.test(row.title)
    || /https?:|www\.|@|\b(?:\d{3}[-.]?){3}\d{4}\b/i.test(row.title)
    || !safeDate(row.updated_at)
    || !base || typeof base !== "object" || (base as Record<string, unknown>).ref !== "main"
    || !head || typeof head !== "object" || typeof (head as Record<string, unknown>).sha !== "string"
    || !SHA.test((head as Record<string, unknown>).sha as string)) {
    return null;
  }
  const number = row.number as number;
  return {
    number, title: row.title, draft: row.draft, updatedAt: row.updated_at,
    url: `https://github.com/AnonymousKoo/avuhz-infra/pull/${number}`,
    head: (head as Record<string, unknown>).sha as string,
  };
}

function checkResult(value: unknown): AvuhzReviewStatus {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "unknown";
  const body = value as Record<string, unknown>;
  if (!Number.isSafeInteger(body.total_count)
    || (body.total_count as number) < 1 || (body.total_count as number) > 20
    || !Array.isArray(body.check_runs)
    || body.check_runs.length !== body.total_count) return "unknown";
  let pending = false;
  for (const item of body.check_runs) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return "unknown";
    const run = item as Record<string, unknown>;
    if (run.status === "queued" || run.status === "in_progress" || run.status === "pending") {
      pending = true;
    } else if (run.status === "completed"
      && ["failure", "timed_out", "action_required", "startup_failure"].includes(String(run.conclusion))) {
      return "failing";
    } else if (run.status !== "completed" || run.conclusion !== "success") {
      return "unknown";
    }
  }
  return pending ? "running" : "passing";
}

export async function fetchAvuhzReviewQueue(retrieve: typeof fetch = fetch): Promise<AvuhzReviewQueue> {
  try {
    const raw = await publicJSON(OPEN_URL, retrieve);
    if (!Array.isArray(raw) || raw.length > 8) throw new Error("source_unavailable");
    const candidates = raw.map(candidate).filter((x): x is SafeCandidate => x !== null).slice(0, 5);
    const items: AvuhzReviewItem[] = await Promise.all(candidates.map(async ({ head, ...item }) => {
      let ci: AvuhzReviewStatus = "unknown";
      try {
        const checks = await publicJSON(`${REPO}/commits/${head}/check-runs?per_page=20`, retrieve);
        ci = checkResult(checks);
      } catch {
        // Never claim a passing check when GitHub is unavailable or rate limited.
      }
      return { ...item, ci };
    }));
    return { state: "verified", items };
  } catch {
    // Unknown is different from an empty queue; no provider response logging.
    return { state: "unavailable", items: [] };
  }
}
