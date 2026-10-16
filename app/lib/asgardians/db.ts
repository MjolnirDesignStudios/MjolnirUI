import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client with the service-role key. RLS is enabled on the
// asgardians_* tables with no policies, so all access flows through here.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin credentials missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export const RESUME_BUCKET = "asgardians-resumes";
