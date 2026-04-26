// app/lib/supabaseAdmin.ts
// Server-side Supabase clients using the service role key.
// Use for JWT callbacks, webhook handlers, and any server-side user data operations.
// NEVER import this in client components or expose the service role key.
//
// Lazy-initialized to prevent build-time crashes when env vars are missing during
// Next.js page data collection. The clients are created on first access at runtime.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Schema-aware client types. Default schema is "public"; the auth-admin client
// uses the next_auth schema and needs its third type parameter pinned to match
// the createClient(..., { db: { schema: "next_auth" } }) return type.
type PublicAdminClient = SupabaseClient;
type AuthAdminClient = SupabaseClient<any, any, "next_auth">;

let _admin: PublicAdminClient | undefined;
let _authAdmin: AuthAdminClient | undefined;

function ensureEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase admin env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return { url, key };
}

function getAdmin(): PublicAdminClient {
  if (_admin) return _admin;
  const { url, key } = ensureEnv();
  _admin = createClient(url, key);
  return _admin;
}

function getAuthAdmin(): AuthAdminClient {
  if (_authAdmin) return _authAdmin;
  const { url, key } = ensureEnv();
  _authAdmin = createClient(url, key, { db: { schema: "next_auth" } });
  return _authAdmin;
}

// Default public schema admin client
export const supabaseAdmin: PublicAdminClient = new Proxy({} as PublicAdminClient, {
  get(_target, prop) {
    const client = getAdmin();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// next_auth schema admin client — for querying NextAuth-managed user table
export const supabaseAuthAdmin: AuthAdminClient = new Proxy({} as AuthAdminClient, {
  get(_target, prop) {
    const client = getAuthAdmin();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
