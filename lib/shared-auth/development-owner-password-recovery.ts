/**
 * Browser-only password recovery for the existing, confirmed DEVELOPMENT AUTH
 * owner. No new identity provider, service-role token, DB mutation, or callback
 * API. Recovery links are intentionally consumed from URL fragments, not query
 * parameters, cookies, persistent storage or server logs.
 */
import {
  DEVELOPMENT_OWNER_AUTH_ORIGIN,
  OwnerEnrollmentDenied,
  ownerIdentity,
  validDevelopmentPublishableKey,
} from "./development-owner-mfa.ts";

export const DEVELOPMENT_RECOVERY_CALLBACK =
  "https://dashboard.sekinfra.com/owner-password-recovery";

const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const ownerEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Requester = typeof fetch;

function check(key: string, email: string) {
  if (!validDevelopmentPublishableKey(key) || !ownerEmailPattern.test(email)) {
    throw new OwnerEnrollmentDenied();
  }
}

async function authRequest(
  path: string,
  key: string,
  method: "GET" | "POST" | "PUT",
  data: Record<string, string> | null,
  accessToken: string | null,
  retrieve: Requester,
): Promise<Record<string, unknown>> {
  if (!validDevelopmentPublishableKey(key)
    || ![
      "/auth/v1/recover?redirect_to=" + encodeURIComponent(DEVELOPMENT_RECOVERY_CALLBACK),
      "/auth/v1/user",
    ].includes(path)
    || (accessToken !== null && (accessToken.length > 16384 || !jwtPattern.test(accessToken)))) {
    throw new OwnerEnrollmentDenied();
  }
  try {
    const response = await retrieve(DEVELOPMENT_OWNER_AUTH_ORIGIN + path, {
      method,
      headers: {
        apikey: key,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(data ? { "Content-Type": "application/json" } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok || Number(response.headers.get("content-length") || 0) > 65536) {
      throw new OwnerEnrollmentDenied();
    }
    // GoTrue may return a blank body for an accepted email-recovery request.
    if (method === "POST") return {};
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new OwnerEnrollmentDenied();
    }
    return payload as Record<string, unknown>;
  } catch {
    throw new OwnerEnrollmentDenied();
  }
}

/** Do not accept URL-query recovery tokens or PKCE codes without a review. */
export function recoveryAccessTokenFromFragment(fragment: string): string | null {
  if (!fragment.startsWith("#") || fragment.length > 32768) return null;
  const params = new URLSearchParams(fragment.slice(1));
  if (params.getAll("type").length !== 1 || params.get("type") !== "recovery"
    || params.getAll("access_token").length !== 1) return null;
  const token = params.get("access_token");
  return token && token.length <= 16384 && jwtPattern.test(token) ? token : null;
}

/**
 * Explicit redirect_to means the Supabase Site URL can remain localhost for
 * local testing. The exact callback MUST be allowlisted separately before use.
 */
export async function sendDevelopmentOwnerRecoveryEmail(
  key: string,
  expectedEmail: string,
  retrieve: Requester = fetch,
): Promise<void> {
  check(key, expectedEmail);
  await authRequest(
    "/auth/v1/recover?redirect_to=" + encodeURIComponent(DEVELOPMENT_RECOVERY_CALLBACK),
    key, "POST", { email: expectedEmail }, null, retrieve,
  );
}

export async function verifyDevelopmentRecoverySession(
  key: string,
  expectedEmail: string,
  token: string,
  retrieve: Requester = fetch,
): Promise<string> {
  check(key, expectedEmail);
  if (!jwtPattern.test(token) || token.length > 16384) throw new OwnerEnrollmentDenied();
  const account = await authRequest("/auth/v1/user", key, "GET", null, token, retrieve);
  return ownerIdentity(account, expectedEmail);
}

/**
 * Revalidate the owner before mutation and the returned identity afterward.
 * Passwords are never returned or logged. A failed logout is reported as
 * unverified; it is NOT mistaken for failure to change an accepted password.
 */
export async function setDevelopmentOwnerPassword(
  key: string,
  expectedEmail: string,
  token: string,
  password: string,
  retrieve: Requester = fetch,
): Promise<{ temporarySessionRevoked: boolean }> {
  check(key, expectedEmail);
  if (typeof password !== "string" || password.length < 14 || password.length > 128
    || !jwtPattern.test(token) || token.length > 16384) throw new OwnerEnrollmentDenied();

  const subject = await verifyDevelopmentRecoverySession(key, expectedEmail, token, retrieve);
  const updated = await authRequest(
    "/auth/v1/user", key, "PUT", { password }, token, retrieve,
  );
  if (ownerIdentity(updated, expectedEmail) !== subject) throw new OwnerEnrollmentDenied();

  // A local logout targets only the temporary password-recovery session.
  let temporarySessionRevoked = false;
  try {
    const response = await retrieve(
      DEVELOPMENT_OWNER_AUTH_ORIGIN + "/auth/v1/logout?scope=local", {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${token}` },
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        referrerPolicy: "no-referrer",
        signal: AbortSignal.timeout(12000),
      },
    );
    temporarySessionRevoked = response.ok;
  } catch {
    temporarySessionRevoked = false;
  }
  return { temporarySessionRevoked };
}
