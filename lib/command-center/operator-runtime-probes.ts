/** PRIVATE READ-ONLY diagnostic of named service HEALTH ENDPOINTS.
 * Not a tenant read model, workflow execution feed, authenticated service
 * connection, authorizing identity, or infrastructure command.
 */
export type RuntimeProbe = Readonly<{
  state: "responding" | "not_ready" | "unavailable";
  detail: string;
  integration_connected: false;
}>;

const AVUHZ = "https://avuhz-command-dev.onrender.com/health/ready";
const N8N = "https://n8n.sekinfra.com/healthz";

async function boundedGet(url: string, retrieve: typeof fetch): Promise<Response> {
  return retrieve(url, {
    method: "GET", cache: "no-store", redirect: "error",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(3500),
  });
}

export async function probeAvuhzDevelopment(retrieve: typeof fetch = fetch): Promise<RuntimeProbe> {
  try {
    const response = await boundedGet(AVUHZ, retrieve);
    if (response.status !== 200 && response.status !== 503)
      return {state:"unavailable",detail:"Development API readiness check was unavailable.",integration_connected:false};
    const len = Number(response.headers.get("content-length")||"0");
    if (!Number.isSafeInteger(len) || len > 8192)
      return {state:"unavailable",detail:"Development API response exceeded safe limits.",integration_connected:false};
    const raw = await response.text();
    if (raw.length > 8192)
      return {state:"unavailable",detail:"Development API response exceeded safe limits.",integration_connected:false};
    const value:unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value))
      return {state:"unavailable",detail:"Development API health shape not verified.",integration_connected:false};
    const payload = value as Record<string,unknown>;
    if (response.status === 200 && payload.status === "ready")
      return {state:"responding",detail:"DEVELOPMENT API reported ready. This is not tenant access or System #001 certification.",integration_connected:false};
    if (response.status === 503 && payload.status === "not_ready") {
      const checks=payload.checks;
      if (checks && typeof checks === "object" && !Array.isArray(checks)
          && (checks as Record<string,unknown>).data === "unavailable") {
        return {state:"not_ready",detail:"DEVELOPMENT API not ready: DATA check unavailable. Identity readiness does not prove tenant access.",integration_connected:false};
      }
      return {state:"not_ready",detail:"DEVELOPMENT API reported not ready; no client operations certified.",integration_connected:false};
    }
    return {state:"unavailable",detail:"DEVELOPMENT API returned an unverified health response.",integration_connected:false};
  } catch {
    return {state:"unavailable",detail:"DEVELOPMENT API readiness check unavailable; no status assumed.",integration_connected:false};
  }
}

export async function probeProductionN8n(retrieve: typeof fetch = fetch): Promise<RuntimeProbe> {
  try {
    const response = await boundedGet(N8N,retrieve);
    if (response.status === 200) {
      return {state:"responding",detail:"Production n8n HTTP health endpoint responded. Execution telemetry and workflow authority are NOT connected.",integration_connected:false};
    }
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      return {state:"not_ready",detail:"Production n8n health endpoint returned a gateway or service error. Workflow execution remains unverified.",integration_connected:false};
    }
    return {state:"unavailable",detail:"Production n8n did not return a confirmed healthy response.",integration_connected:false};
  } catch {
    return {state:"unavailable",detail:"Production n8n health request could not be verified.",integration_connected:false};
  }
}
