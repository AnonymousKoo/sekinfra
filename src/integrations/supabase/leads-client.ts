// Secondary Supabase client pointing to the leads/CRM project.
// The primary client (src/integrations/supabase/client.ts) is managed by
// Lovable Cloud and points at a different project used for auth.
import { createClient } from "@supabase/supabase-js";

const LEADS_SUPABASE_URL = "https://gnuqaefotwgkwurjpyik.supabase.co";
const LEADS_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudXFhZWZvdHdna3d1cmpweWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2Mzk5NDMsImV4cCI6MjA5MzIxNTk0M30.Z6SHoqWbkOnB318tTStPcT_h6H4AEBxLU8uQT9_KWYw";

export const leadsSupabase = createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
