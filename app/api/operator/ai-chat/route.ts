import { NextRequest, NextResponse } from "next/server";
import { authorizeOperator } from "@/lib/command-center/operator-access";
import { fetchAvuhzActivity } from "@/lib/command-center/avuhz-activity";
import { fetchAvuhzReviewQueue } from "@/lib/command-center/avuhz-review-queue";
import { requestReadOnlyAiAnswer, safePublicReviewContext, validateChatInput } from "@/lib/command-center/ai-operator";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function respond(status: number, data: Record<string, string>) {
  return NextResponse.json(data, { status, headers: {
    "Cache-Control": "private, no-store, max-age=0",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  } });
}

export async function POST(request: NextRequest) {
  // This same repo also deploys the PUBLIC Sekinfra website.
  if (request.nextUrl.hostname !== "dashboard.sekinfra.com"
    || process.env.SEKINFRA_DEPLOYMENT_ROLE !== "private-operator") {
    return respond(404, { code: "not_found" });
  }
  // Verify cryptographic owner authorization on every request.
  const identity = await authorizeOperator(request.headers);
  if (!identity) return respond(404, { code: "not_found" });

  // Disabled until an approved Vault-backed server key and spending controls
  // are configured for this exact private Vercel project.
  const key = process.env.OPENAI_API_KEY;
  if (process.env.SEKINFRA_AI_OPERATOR_ENABLED !== "true" || !key) {
    return respond(503, { code: "ai_not_configured" });
  }
  if (request.headers.get("origin") !== "https://dashboard.sekinfra.com"
    || request.headers.get("x-sekinfra-operator-request") !== "chat-v1"
    || !request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return respond(403, { code: "invalid_request_origin" });
  }
  const n = request.headers.get("content-length");
  if (n !== null && (!/^\d+$/.test(n) || Number(n) > 8192)) {
    return respond(413, { code: "request_too_large" });
  }
  let parsed: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 8192) return respond(413, { code: "request_too_large" });
    parsed = JSON.parse(raw);
  } catch {
    return respond(400, { code: "invalid_request" });
  }
  const messages = validateChatInput(parsed);
  if (!messages) return respond(400, { code: "invalid_request" });

  // Public engineering evidence only: never imply this is Avuhz tenant,
  // customer, n8n runtime or production command authorization.
  const [merges, reviews] = await Promise.all([fetchAvuhzActivity(), fetchAvuhzReviewQueue()]);
  const context = safePublicReviewContext(merges.events, reviews.items);
  const answer = await requestReadOnlyAiAnswer(messages, context, key);
  if (!answer) return respond(502, { code: "ai_unavailable" });
  return respond(200, { answer, data_scope: "public_github_only" });
}
