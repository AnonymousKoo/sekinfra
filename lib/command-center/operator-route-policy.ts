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
  return "deny";
}
