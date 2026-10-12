/**
 * Reusable, browser-memory-only DEVELOPMENT AUTH TOTP enrollment transport.
 *
 * This is a thin caller of the existing shared Supabase AUTH GoTrue endpoints,
 * NOT a Sekinfra login provider, user database, or tenant-authority service.
 * Exactly one AUTH project is pinned. No service-role/secret keys, refresh
 * token persistence, cookies, localStorage, third-party scripts, analytics,
 * logging, callback redirect, or server-side password handling.
 *
 * A signed Cloudflare Access operator gate is required on the route that
 * renders this helper. That outer gate is NOT Avuhz owner/tenant authority.
 * The shared Avuhz backend must separately verify signed recent TOTP,
 * active session, and real business ownership before registration.
 */
export const DEVELOPMENT_OWNER_AUTH_ORIGIN = "https://pwlhruwutoitnieactol.supabase.co";

type Requester = typeof fetch;

export type OwnerSession = Readonly<{
  accessToken: string;
  subject: string;
  factorId: string | null;
}>;

export type TotpEnrollment = Readonly<{
  factorId: string;
  secret: string;
  qrCode: string | null;
}>;

export class OwnerEnrollmentDenied extends Error {
  constructor() {
    super("The private verification request could not be completed.");
    this.name = "OwnerEnrollmentDenied";
  }
}

const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const tokenPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const keyPattern = /^sb_publishable_[a-zA-Z0-9_]{12,480}$/;

export function validDevelopmentPublishableKey(key: unknown): key is string {
  return typeof key === "string" && key.length <= 512 && keyPattern.test(key);
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

async function authRequest(
  path: string,
  key: string,
  options: { method: "POST" | "GET"; body?: Record<string, string>; token?: string },
  retrieve: Requester,
): Promise<Record<string, unknown>> {
  if (!validDevelopmentPublishableKey(key)
    || !/^\/auth\/v1\/(?:token\?grant_type=password|user|factors(?:\/[0-9a-f-]{36}\/(?:challenge|verify))?)$/.test(path)) {
    throw new OwnerEnrollmentDenied();
  }
  if (options.token && (options.token.length > 16384 || !tokenPattern.test(options.token))) {
    throw new OwnerEnrollmentDenied();
  }
  try {
    const response = await retrieve(DEVELOPMENT_OWNER_AUTH_ORIGIN + path, {
      method: options.method,
      headers: {
        apikey: key,
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok || Number(response.headers.get("content-length") || 0) > 65536) {
      throw new OwnerEnrollmentDenied();
    }
    const result: unknown = await response.json();
    const data = record(result);
    if (!data) throw new OwnerEnrollmentDenied();
    return data;
  } catch {
    // Never reflect provider errors, passwords, bearer tokens, MFA codes,
    // secrets, email addresses or response bodies.
    throw new OwnerEnrollmentDenied();
  }
}

function ownerIdentity(user: Record<string, unknown>, expectedEmail: string): string {
  const appMetadata = record(user.app_metadata);
  if (typeof user.id !== "string" || !idPattern.test(user.id)
    || typeof user.email !== "string"
    || user.email.toLowerCase() !== expectedEmail.toLowerCase()
    || !user.email_confirmed_at || user.is_anonymous === true
    || (appMetadata && ("avuhz_tenant_id" in appMetadata || "avuhz_workload" in appMetadata))) {
    throw new OwnerEnrollmentDenied();
  }
  return user.id;
}

export async function authenticateDevelopmentOwner(
  key: string,
  expectedEmail: string,
  password: string,
  retrieve: Requester = fetch,
): Promise<OwnerSession> {
  if (!validDevelopmentPublishableKey(key)
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(expectedEmail)
    || typeof password !== "string" || password.length < 1 || password.length > 1024) {
    throw new OwnerEnrollmentDenied();
  }
  const signIn = await authRequest(
    "/auth/v1/token?grant_type=password", key,
    { method: "POST", body: { email: expectedEmail, password } }, retrieve,
  );
  const accessToken = signIn.access_token;
  if (typeof accessToken !== "string" || accessToken.length > 16384
    || !tokenPattern.test(accessToken)) throw new OwnerEnrollmentDenied();
  const user = await authRequest("/auth/v1/user", key,
    { method: "GET", token: accessToken }, retrieve);
  const subject = ownerIdentity(user, expectedEmail);

  // Do not silently duplicate an existing TOTP factor. A second visit
  // should challenge an existing verified factor, not enroll a new one.
  const factors = Array.isArray(user.factors) ? user.factors : [];
  if (factors.some((item: unknown) => {
    const factor = record(item);
    return factor?.factor_type === "totp" && factor.status === "unverified";
  })) throw new OwnerEnrollmentDenied();
  const verified = factors.find((item: unknown) => {
    const factor = record(item);
    return factor?.factor_type === "totp" && factor.status === "verified"
      && typeof factor.id === "string" && idPattern.test(factor.id);
  });
  const validFactor = record(verified);
  return {
    accessToken,
    subject,
    factorId: validFactor && typeof validFactor.id === "string" ? validFactor.id : null,
  };
}

export async function beginTotpEnrollment(
  key: string,
  session: OwnerSession,
  retrieve: Requester = fetch,
): Promise<TotpEnrollment> {
  if (!idPattern.test(session.subject) || session.factorId !== null) {
    throw new OwnerEnrollmentDenied();
  }
  const data = await authRequest("/auth/v1/factors", key, {
    method: "POST",
    body: { factor_type: "totp", friendly_name: "Development owner authenticator" },
    token: session.accessToken,
  }, retrieve);
  const totp = record(data.totp);
  if (typeof data.id !== "string" || !idPattern.test(data.id)
    || !totp || typeof totp.secret !== "string"
    || !/^[A-Z2-7]{16,128}$/i.test(totp.secret)) {
    throw new OwnerEnrollmentDenied();
  }
  // Supabase SDK's qr_code is a data URI; never render arbitrary SVG markup,
  // external image URLs, or unsanitized HTML returned by an API.
  const qr = typeof totp.qr_code === "string" && totp.qr_code.length < 25000
    && /^data:image\/svg\+xml;(?:base64,|utf8,)/i.test(totp.qr_code)
    ? totp.qr_code : null;
  return { factorId: data.id, secret: totp.secret, qrCode: qr };
}

export async function verifyTotpEnrollment(
  key: string,
  session: OwnerSession,
  factorId: string,
  code: string,
  expectedEmail: string,
  retrieve: Requester = fetch,
): Promise<boolean> {
  if (!idPattern.test(factorId) || !/^\d{6}$/.test(code)
    || !idPattern.test(session.subject)) throw new OwnerEnrollmentDenied();
  const challenge = await authRequest(
    `/auth/v1/factors/${factorId}/challenge`, key,
    { method: "POST", token: session.accessToken }, retrieve,
  );
  const challengeId = challenge.id;
  if (typeof challengeId !== "string" || !idPattern.test(challengeId)) {
    throw new OwnerEnrollmentDenied();
  }
  const verified = await authRequest(
    `/auth/v1/factors/${factorId}/verify`, key,
    { method: "POST", token: session.accessToken,
      body: { challenge_id: challengeId, code } }, retrieve,
  );
  const newToken = verified.access_token;
  if (typeof newToken !== "string" || !tokenPattern.test(newToken)
    || newToken.length > 16384) throw new OwnerEnrollmentDenied();
  const user = await authRequest(
    "/auth/v1/user", key, { method: "GET", token: newToken }, retrieve,
  );
  if (ownerIdentity(user, expectedEmail) !== session.subject) {
    throw new OwnerEnrollmentDenied();
  }
  // This is a UI completion acknowledgement, NOT server-side authorization:
  // Avuhz independently verifies signed AAL2 + recent TOTP + session record.
  const factors = Array.isArray(user.factors) ? user.factors : [];
  return factors.some((f: unknown) => {
    const factor = record(f);
    return factor?.id === factorId && factor.factor_type === "totp"
      && factor.status === "verified";
  });
}
