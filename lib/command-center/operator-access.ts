import { createPublicKey, verify as verifySignature } from "node:crypto";

type HeaderReader = { get(name: string): string | null };
type Environment = Record<string, string | undefined>;

export type OperatorIdentity = Readonly<{ subject: string; email: string }>;

type JwtHeader = { alg?: unknown; kid?: unknown; typ?: unknown };
type JwtClaims = {
  iss?: unknown;
  aud?: unknown;
  exp?: unknown;
  iat?: unknown;
  nbf?: unknown;
  sub?: unknown;
  email?: unknown;
};

function jsonPart(encoded: string): Record<string, unknown> | null {
  if (!encoded || encoded.length > 8192 || !/^[a-zA-Z0-9_-]+$/.test(encoded)) return null;
  try {
    const value: unknown = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function accessIssuer(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(url.hostname)
      || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Cloudflare Access is only an operator network perimeter. It is NOT Avuhz
 * tenant identity, RBAC, or authorization to read or mutate customer records.
 * Never trust an unverified CF-Access-Authenticated-User-Email header.
 */
export async function authorizeOperator(
  request: HeaderReader,
  env: Environment = process.env,
  retrieve: typeof fetch = fetch,
  now = Math.floor(Date.now() / 1000),
): Promise<OperatorIdentity | null> {
  const hostname = env.SEKINFRA_OPERATOR_HOST?.toLowerCase();
  const issuer = accessIssuer(env.SEKINFRA_ACCESS_TEAM_DOMAIN);
  const audience = env.SEKINFRA_ACCESS_AUD;
  const owner = env.SEKINFRA_OPERATOR_EMAIL?.toLowerCase();
  const incomingHost = request.get("host")?.toLowerCase();

  // Fail closed on the public website, Vercel aliases and all unconfigured hosts.
  if (env.SEKINFRA_COMMAND_CENTER_ENABLED !== "true" || !hostname
    || hostname !== "dashboard.sekinfra.com" || incomingHost !== hostname
    || !issuer || !audience || !/^[a-zA-Z0-9_-]{20,128}$/.test(audience)
    || !owner || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner)) return null;

  const token = request.get("cf-access-jwt-assertion");
  if (!token || token.length > 16384) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || !parts.every((part) => /^[a-zA-Z0-9_-]+$/.test(part))) return null;

  const header = jsonPart(parts[0]) as JwtHeader | null;
  const claims = jsonPart(parts[1]) as JwtClaims | null;
  if (!header || !claims || header.alg !== "RS256" || typeof header.kid !== "string"
    || !header.kid || (header.typ !== undefined && header.typ !== "JWT")
    || claims.iss !== issuer
    || !(claims.aud === audience || (Array.isArray(claims.aud) && claims.aud.includes(audience)))
    || !Number.isSafeInteger(claims.exp) || (claims.exp as number) <= now
    || !Number.isSafeInteger(claims.iat) || (claims.iat as number) > now + 60
    || (claims.nbf !== undefined && (!Number.isSafeInteger(claims.nbf) || (claims.nbf as number) > now + 60))
    || typeof claims.sub !== "string" || !claims.sub
    || typeof claims.email !== "string" || claims.email.toLowerCase() !== owner) return null;

  try {
    const response = await retrieve(`${issuer}/cdn-cgi/access/certs`, {
      method: "GET",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;
    const certificateBody: unknown = await response.json();
    if (!certificateBody || typeof certificateBody !== "object" || !("keys" in certificateBody)
      || !Array.isArray(certificateBody.keys)) return null;

    const matching = certificateBody.keys.find((key: unknown) =>
      key && typeof key === "object" && "kid" in key && key.kid === header.kid
      && "kty" in key && key.kty === "RSA" && "n" in key && typeof key.n === "string"
      && "e" in key && typeof key.e === "string"
      && (!("alg" in key) || key.alg === "RS256")
      && (!("use" in key) || key.use === "sig")
    );
    if (!matching) return null;

    const publicKey = createPublicKey({ key: matching as JsonWebKey, format: "jwk" });
    const verified = verifySignature(
      "RSA-SHA256",
      Buffer.from(`${parts[0]}.${parts[1]}`, "utf8"),
      publicKey,
      Buffer.from(parts[2], "base64url"),
    );
    return verified ? { subject: claims.sub, email: owner } : null;
  } catch {
    // Never log token, identity, provider response, or cryptographic errors.
    return null;
  }
}
