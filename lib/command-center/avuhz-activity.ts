/**
 * Bounded, PUBLIC-SOURCE-ONLY Avuhz engineering activity.
 *
 * This is NOT the tenant-scoped Avuhz activity read model and is not a
 * replacement for shared AUTH/RLS. Call ONLY after authorizeOperator succeeds.
 * No browser API call, GitHub credential, webhook, n8n URL, Supabase access,
 * customer record, or provider mutation.
 */
export type AvuhzActivityLane = "Security" | "Infrastructure" | "Automation" | "Business";
export type AvuhzActivityEvent = Readonly<{
  number: number;
  title: string;
  lane: AvuhzActivityLane;
  mergedAt: string;
  url: string;
}>;

export type AvuhzActivityResult = Readonly<{
  state: "verified" | "unavailable";
  events: readonly AvuhzActivityEvent[];
}>;

const ENDPOINT = "https://api.github.com/repos/AnonymousKoo/avuhz-infra/pulls?state=closed&sort=updated&direction=desc&per_page=12";
const TITLE = /^[A-Za-z0-9][A-Za-z0-9 .,:;()#/_+!?&-]{0,139}$/;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

function laneForTitle(title: string): AvuhzActivityLane {
  if (/^(security|auth|identity):/i.test(title)) return "Security";
  if (/^(automation|n8n|workflow):/i.test(title)) return "Automation";
  if (/^(infra|infrastructure|data|migration|deploy):/i.test(title)) return "Infrastructure";
  if (/^(business|revenue|client|oia):/i.test(title)) return "Business";
  return "Infrastructure";
}

function readEvent(entry: unknown): AvuhzActivityEvent | null {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  const raw = entry as Record<string, unknown>;
  const number = raw.number;
  const title = raw.title;
  const mergedAt = raw.merged_at;
  const base = raw.base;
  if (!Number.isSafeInteger(number) || (number as number) < 1 || (number as number) > 999_999
    || typeof title !== "string" || !TITLE.test(title)
    || /https?:|www\.|@|\b(?:\d{3}[-.]?){3}\d{4}\b/i.test(title)
    || typeof mergedAt !== "string" || !ISO_UTC.test(mergedAt)
    || Number.isNaN(Date.parse(mergedAt))
    || !base || typeof base !== "object" || (base as Record<string, unknown>).ref !== "main") {
    return null;
  }
  return {
    number: number as number,
    title,
    mergedAt,
    lane: laneForTitle(title),
    // Never trust a URL returned by the API. Construct the known public path.
    url: `https://github.com/AnonymousKoo/avuhz-infra/pull/${number}`,
  };
}

export async function fetchAvuhzActivity(
  retrieve: typeof fetch = fetch,
): Promise<AvuhzActivityResult> {
  try {
    const response = await retrieve(ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok || response.status !== 200) {
      return { state: "unavailable", events: [] };
    }
    const advertisedLength = Number(response.headers.get("content-length") || "0");
    if (!Number.isSafeInteger(advertisedLength) || advertisedLength > 512_000) {
      return { state: "unavailable", events: [] };
    }
    const body = await response.text();
    if (body.length > 512_000) return { state: "unavailable", events: [] };
    const payload: unknown = JSON.parse(body);
    if (!Array.isArray(payload) || payload.length > 12) {
      return { state: "unavailable", events: [] };
    }
    const events = payload.map(readEvent).filter((row): row is AvuhzActivityEvent => row !== null);
    events.sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
    return { state: "verified", events: events.slice(0, 8) };
  } catch {
    // Do not log response bodies, provider URLs, headers or diagnostics.
    return { state: "unavailable", events: [] };
  }
}
