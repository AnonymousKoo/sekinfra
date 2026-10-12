import { NextResponse, type NextRequest } from "next/server";

import {
  isPrivateOperatorDeployment,
  privateOperatorRouteDecision,
} from "@/lib/command-center/operator-route-policy";

/**
 * Sekinfra's public sales website and private operator deployment currently
 * share a Git repository. The private custom hostname must expose the operator
 * entry point only, never public sales routes or public form APIs.
 *
 * This is only a hostname/route boundary. Real operator authentication is
 * independently enforced by app/(prototype)/command-center/page.tsx using the
 * verified Cloudflare Access JWT.
 */
export function proxy(request: NextRequest) {
  if (!isPrivateOperatorDeployment(
    request.nextUrl.hostname,
    process.env.SEKINFRA_DEPLOYMENT_ROLE,
  )) {
    // The separate public Vercel project and sekinfra.com stay unchanged.
    return NextResponse.next();
  }

  const action = privateOperatorRouteDecision(request.nextUrl.pathname);

  if (action === "rewrite") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/command-center";
    destination.search = "";
    const response = NextResponse.rewrite(destination);
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("X-Frame-Options", "DENY");
    return response;
  }

  if (action === "forward") {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("X-Frame-Options", "DENY");
    return response;
  }

  // No sales pages, demo workspaces, form APIs, robots, or other app routes
  // are available from the private Vercel project or private hostname.
  // The operator page itself still requires an actual signed Cloudflare JWT
  // on dashboard.sekinfra.com (not a Vercel alias).
  return new NextResponse(null, {
    status: 404,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "X-Frame-Options": "DENY",
    },
  });
}

export const config = {
  // Next.js framework assets are not operator pages and must remain reachable
  // after a valid operator request so styling and scripts can load.
  matcher: ["/((?!_next/|favicon.ico|icon.svg|opengraph-image).*)"],
};
