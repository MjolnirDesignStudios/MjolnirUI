import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import { supabase } from './supabaseClient';
import { supabaseAuthAdmin } from './supabaseAdmin';
import NextAuth, { SessionStrategy, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import TwitterProvider from 'next-auth/providers/twitter';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      tier?: string;
      role?: string;
    };
  }
}

export const nextAuthOptions = {
  providers: [
    /* allowDangerousEmailAccountLinking: true
       Necessary for the MDS cross-grant flow: the Stripe webhook
       pre-creates a next_auth.users row by email (from the verified
       Stripe customer record) when an MDS subscriber doesn't yet have
       a MjolnirUI account. When they sign in via Google/GitHub, NextAuth
       needs to link the OAuth identity to the pre-created row instead
       of refusing with "OAuthAccountNotLinked".

       The "dangerous" framing applies to email-takeover attacks where
       an attacker pre-registers with someone else's email; here the
       email source is Stripe's verified customer record, so the attack
       vector doesn't apply. See app/lib/mdsEntitlements.ts. */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      version: '2.0',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  // Only construct the SupabaseAdapter when env vars are actually present.
  // Empty strings would cause SupabaseAdapter -> createClient to throw
  // "supabaseUrl is required" during Next.js page data collection at build time.
  // When undefined, NextAuth falls back to JWT-only mode (graceful, not a crash).
  ...(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? {
        adapter: SupabaseAdapter({
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
        }),
      }
    : {}),
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: any }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.tier = token.tier || 'free';
        session.user.role = token.role || 'user';
      }
      return session;
    },
    async jwt({ token, user, trigger }: { token: any; user?: any; trigger?: string }) {
      // Fetch tier on first login
      if (user) {
        try {
          const { data } = await supabaseAuthAdmin
            .from('users')
            .select('tier, role')
            .eq('id', token.sub)
            .single();
          token.tier = data?.tier || 'free';
          token.role = data?.role || 'user';
        } catch {
          token.tier = 'free';
          token.role = 'user';
        }
      }
      // Allow manual session refresh after checkout (client calls update())
      if (trigger === 'update') {
        try {
          const { data } = await supabaseAuthAdmin
            .from('users')
            .select('tier, role')
            .eq('id', token.sub)
            .single();
          token.tier = data?.tier || 'free';
          token.role = data?.role || 'user';
        } catch {
          // Keep existing token values on error
        }
      }
      return token;
    },
  },
};
