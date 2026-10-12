import { NextResponse, type NextRequest } from "next/server";

const PRIVATE_OPERATOR_HOST = "dashboard.sekinfra.com";

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
  if (request.nextUrl.hostname.toLowerCase() !== PRIVATE_OPERATOR_HOST) {
    // Keep the public sekinfra.com website unchanged.
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  if (pathname === "/" || pathname === "/command-center/") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/command-center";
    destination.search = "";
    const response = NextResponse.rewrite(destination);
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("X-Frame-Options", "DENY");
    return response;
  }

  if (pathname === "/command-center") {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("X-Frame-Options", "DENY");
    return response;
  }

  // No sales pages, demo workspaces, form APIs, robots, or other app routes
  // are available on the private operator hostname.
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
