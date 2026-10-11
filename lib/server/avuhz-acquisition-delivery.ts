/**
 * Offline-certifiable Sekinfra SERVER -> existing shared Avuhz acquisition API.
 *
 * Not imported or called by the public Next.js route. No credential provider,
 * tenant registration, live endpoint activation or customer permission is
 * implemented here. The production website must continue to return 503 until
 * the separate Avuhz identity/owner/DATA gates and public abuse control pass.
 *
 * An eventual authorized *server* caller supplies a short-lived bearer through
 * a separately approved protected secret boundary. Never pass this value from
 * browser data, record it in logs, or turn off TLS/hostname validation.
 */
import {
  toAvuhzAcquisitionIntake,
  type AvuhzAcquisitionIntakeContentV1,
} from "./avuhz-acquisition-adapter.ts";

const DEVELOPMENT_DATA_REF = "gnuqaefotwgkwurjpyik";
const DEVELOPMENT_AUTH_REF = "pwlhruwutoitnieactol";
const DEVELOPMENT_RECEIVER =
  "https://avuhz-command-dev.onrender.com/v1/acquisition/intakes";
const BEARER_VALUE = /^[A-Za-z0-9_.~-]{32,16384}$/;
const RECEIPT_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export type DevelopmentAcquisitionDeliveryContext = Readonly<{
  environment: "DEVELOPMENT";
  dataProjectRef: typeof DEVELOPMENT_DATA_REF;
  authProjectRef: typeof DEVELOPMENT_AUTH_REF;
  /** Provided only by an independently authorized protected server caller. */
  bearer: string;
}>;

export type DevelopmentAcquisitionReceipt = Readonly<{
  intake_id: string;
  duplicate: boolean;
}>;

export type DevelopmentAcquisitionPost = (
  url: string,
  init: RequestInit,
) => Promise<Response>;

function stop(code: string): never {
  // Fixed safe error codes. Never expose PII, secret, transport or API payload.
  throw new Error(code);
}

/**
 * Send at most one already-mapped intake to the exact DEVELOPMENT Avuhz host.
 *
 * No default fetch: every actual network call needs an explicitly supplied
 * server-side transport. This candidate grants no authority and must remain
 * unmounted while Avuhz acquisition intake and public rate limits are inactive.
 * A 202 means a new intake; a 200 means a verified idempotent duplicate.
 */
export async function deliverDevelopmentAcquisitionCandidate(
  untrustedCandidate: unknown,
  context: DevelopmentAcquisitionDeliveryContext,
  post: DevelopmentAcquisitionPost,
): Promise<DevelopmentAcquisitionReceipt> {
  if (
    typeof context !== "object" || context === null ||
    context.environment !== "DEVELOPMENT" ||
    context.dataProjectRef !== DEVELOPMENT_DATA_REF ||
    context.authProjectRef !== DEVELOPMENT_AUTH_REF ||
    typeof context.bearer !== "string" ||
    !BEARER_VALUE.test(context.bearer) ||
    typeof post !== "function"
  ) {
    return stop("acquisition_delivery_not_authorized");
  }

  // Browser data is only content, never a service token, organization or tenant.
  // Validation must finish before any network call.
  const mapped: AvuhzAcquisitionIntakeContentV1 =
    toAvuhzAcquisitionIntake(untrustedCandidate);
  const body = JSON.stringify(mapped);
  if (body.length > 8192) return stop("acquisition_delivery_invalid_content");

  let response: Response;
  try {
    response = await post(DEVELOPMENT_RECEIVER, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + context.bearer,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body,
      redirect: "error",
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return stop("acquisition_delivery_unavailable");
  }

  try {
    if (
      (response.status !== 200 && response.status !== 202) ||
      !response.headers.get("content-type")?.toLowerCase().startsWith("application/json")
    ) {
      return stop("acquisition_delivery_unavailable");
    }

    // Cap the response before JSON parsing to avoid unexpected PII/body
    // propagation and excessive processing, even on a provider error.
    const len = response.headers.get("content-length");
    if (len !== null && (!/^\d+$/.test(len) || Number(len) > 512)) {
      return stop("acquisition_delivery_unavailable");
    }
    const reader = response.body?.getReader();
    if (!reader) return stop("acquisition_delivery_unavailable");
    const bytes: Uint8Array[] = [];
    let total = 0;
    try {
      for (;;) {
        const item = await reader.read();
        if (item.done) break;
        total += item.value.byteLength;
        if (total > 512) return stop("acquisition_delivery_unavailable");
        bytes.push(item.value);
      }
    } finally {
      reader.releaseLock();
    }
    const raw = new Uint8Array(total);
    let at = 0;
    for (const chunk of bytes) {
      raw.set(chunk, at);
      at += chunk.byteLength;
    }
    const value: unknown = JSON.parse(new TextDecoder("utf-8", {fatal:true}).decode(raw));
    if (
      !value || typeof value !== "object" || Array.isArray(value) ||
      Object.keys(value).length !== 2 ||
      !Object.hasOwn(value, "intake_id") ||
      !Object.hasOwn(value, "duplicate")
    ) {
      return stop("acquisition_delivery_unavailable");
    }
    const receipt = value as Record<string, unknown>;
    if (
      typeof receipt.intake_id !== "string" ||
      !RECEIPT_UUID.test(receipt.intake_id) ||
      typeof receipt.duplicate !== "boolean" ||
      (response.status === 202 && receipt.duplicate !== false) ||
      (response.status === 200 && receipt.duplicate !== true)
    ) {
      return stop("acquisition_delivery_unavailable");
    }
    return { intake_id: receipt.intake_id, duplicate: receipt.duplicate };
  } catch {
    return stop("acquisition_delivery_unavailable");
  }
}
