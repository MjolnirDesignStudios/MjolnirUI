// app/lib/supabaseClient.ts
// Lazy-initialized public Supabase client.
// Why lazy: Next.js evaluates this module during build's "Collecting page data" phase.
// If env vars are missing then (e.g. on a preview deploy without env config), eager
// createClient() throws "supabaseUrl is required" and breaks the build. Defer until
// first actual access at request time.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY in your environment."
    );
  }
  _client = createClient(url, key);
  return _client;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
