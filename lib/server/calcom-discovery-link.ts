/**
 * Public Sekinfra Cal.com event link only. This server-side allowlist does NOT
 * authenticate webhooks, accept PII, connect Avuhz, or create a reservation.
 * The user must independently create and approve the real Cal.com event.
 */
const SEGMENT = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/;
const ALLOWED_HOSTS = new Set(["cal.com", "www.cal.com"]);

export function validateCalcomDiscoveryLink(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 256 || value !== value.trim()) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (
    url.protocol !== "https:" ||
    !ALLOWED_HOSTS.has(url.hostname) ||
    url.port !== "" ||
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== "" ||
    value.includes("%") ||
    value.includes("?") ||
    value.includes("#") ||
    /[\u0000-\u0020\u007f]/.test(value) ||
    value.includes("\\")
  ) {
    return null;
  }

  if (url.pathname.endsWith("/") || url.pathname.includes("//")) return null;
  const path = url.pathname.split("/").filter(Boolean);
  const individualEvent =
    path.length === 2 && path[0] !== "team" && path.every((item) => SEGMENT.test(item));
  const teamEvent =
    path.length === 3 && path[0] === "team" && path.slice(1).every((item) => SEGMENT.test(item));
  if (!individualEvent && !teamEvent) {
    return null;
  }
  return url.toString();
}

/** Read at server-render/build time. An unset or invalid link fails closed. */
export function readCalcomDiscoveryLink(): string | null {
  return validateCalcomDiscoveryLink(process.env.SEKINFRA_CALCOM_DISCOVERY_URL);
}
