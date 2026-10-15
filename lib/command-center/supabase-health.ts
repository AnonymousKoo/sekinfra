/** Project-specific, read-only Supabase AUTH API HTTP health diagnostic.
 *
 * Do NOT conflate availability with owner authentication, tenant access,
 * authenticated Avuhz command authority, DATA Postgres readiness or RLS.
 * No table reads, session data, user records, service-role or credential logs.
 */
export type SupabaseHealth = Readonly<{
  state: "api_responding" | "unavailable" | "not_configured";
  detail: string;
  tenant_data_connected: false;
}>;

export type SupabaseBoundary = "AUTH" | "DATA";

const projects = {
  AUTH: {
    host: "https://pwlhruwutoitnieactol.supabase.co/auth/v1/health",
    name: "DEVELOPMENT AUTH",
    keyName: "SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY",
  },
  DATA: {
    host: "https://gnuqaefotwgkwurjpyik.supabase.co/auth/v1/health",
    name: "DEVELOPMENT DATA",
    keyName: "SEKINFRA_DEV_DATA_PUBLISHABLE_KEY",
  },
} as const;

function isPublishableKey(key: string): boolean {
  if (/^sb_publishable_[A-Za-z0-9_-]{12,}$/.test(key)) return true;
  // Legacy JWT: only the public anon role may be used for this probe.
  // Decode claims locally; never export/log token, claims or exception.
  try {
    const parts = key.split(".");
    if (parts.length !== 3 || parts.some(p => !p || p.length > 2000)) return false;
    const value:unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return !!value && typeof value === "object" && !Array.isArray(value)
      && (value as Record<string,unknown>).role === "anon";
  } catch { return false; }
}

export async function probeSupabaseHealth(
  boundary: SupabaseBoundary,
  config: Readonly<{ SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY?: string; SEKINFRA_DEV_DATA_PUBLISHABLE_KEY?: string }> = {
    SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY: process.env.SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY,
    SEKINFRA_DEV_DATA_PUBLISHABLE_KEY: process.env.SEKINFRA_DEV_DATA_PUBLISHABLE_KEY,
  },
  retrieve: typeof fetch = fetch,
): Promise<SupabaseHealth> {
  const project = projects[boundary];
  if (!project) return {state:"unavailable",detail:"Unrecognized project boundary.",tenant_data_connected:false};
  const key = config[project.keyName];
  if (!key) return {
    state:"not_configured", detail:`${project.name}: no approved publishable API key is configured for this private dashboard.`,
    tenant_data_connected:false,
  };
  // Accept only public publishable-key format or legacy JWT with role=anon.
  // Never send a service-role/secret key even if misconfigured in Vercel.
  if (key.length > 1024 || !isPublishableKey(key)) {
    return {state:"unavailable",detail:`${project.name}: credential type not approved for the health probe.`,tenant_data_connected:false};
  }
  try {
    const result = await retrieve(project.host, {
      method:"GET",
      headers: { apikey: key, Accept:"application/json" },
      cache:"no-store", redirect:"error", signal:AbortSignal.timeout(3500),
    });
    if (result.status === 200) return {
      state:"api_responding",detail:`${project.name} health API responded. This does NOT establish an authorized Avuhz owner session, tenant access or DATA SQL connectivity.`,
      tenant_data_connected:false,
    };
    if (result.status === 401 || result.status === 403) return {
      state:"unavailable",detail:`${project.name} health API rejected the configured publishable key.`,
      tenant_data_connected:false,
    };
    return {state:"unavailable",detail:`${project.name} health API did not report HTTP 200.`,tenant_data_connected:false};
  } catch {
    // Suppress upstream exception including URL and any provider details.
    return {state:"unavailable",detail:`${project.name} health API could not be verified.`,tenant_data_connected:false};
  }
}
