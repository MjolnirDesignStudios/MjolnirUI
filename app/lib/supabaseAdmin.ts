// app/lib/supabaseAdmin.ts
// Server-side Supabase client using service role key.
// Use this for JWT callbacks, webhook handlers, and any server-side user data operations.
// NEVER import this in client components or expose the service role key.
import { createClient } from '@supabase/supabase-js';

// Default public schema client
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// next_auth schema client — for querying NextAuth-managed user table
export const supabaseAuthAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: 'next_auth' } }
);
