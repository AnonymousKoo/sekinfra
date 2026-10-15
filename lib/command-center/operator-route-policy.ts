/**
 * Host- and deployment-owned routing only, never an authentication decision.
 *
 * The same reviewed Next.js repository is deployed to two separate Vercel
 * projects. The private project's role is set only in its Vercel environment;
 * the public website must NOT receive it. Missing/unknown roles leave the
 * normal public routes untouched.
 */
export const PRIVATE_OPERATOR_HOST = "dashboard.sekinfra.com";
export const PRIVATE_OPERATOR_ROLE = "private-operator";

export function isPrivateOperatorDeployment(
  hostname: string,
  role: string | undefined,
): boolean {
  return hostname.toLowerCase() === PRIVATE_OPERATOR_HOST
    || role === PRIVATE_OPERATOR_ROLE;
}

export type PrivateOperatorRouteDecision = "rewrite" | "forward" | "deny";

export function privateOperatorRouteDecision(
  pathname: string,
): PrivateOperatorRouteDecision {
  if (pathname === "/" || pathname === "/command-center/") return "rewrite";
  if (pathname === "/command-center") return "forward";
  // Exact, already-public website asset used by the private sidebar. This
  // permits only the logo file, never an arbitrary public directory or route.
  if (pathname === "/brand/sekinfra-wordmark.webp") return "forward";
  // The API still independently verifies signed Cloudflare owner identity.
  if (pathname === "/api/operator/ai-chat") return "forward";
  // The page itself enforces a separate disabled-by-default opt-in and
  // a signed, exact-owner Cloudflare Access JWT. No public-path bypass.
  if (pathname === "/owner-enrollment") return "forward";
  // Separate private password-recovery route; its page has additional gates.
  if (pathname === "/owner-password-recovery") return "forward";
  return "deny";
}
