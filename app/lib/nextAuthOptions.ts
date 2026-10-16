import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import { supabase } from './supabaseClient';
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    // Uncomment below to add Twitter/X
    // TwitterProvider({
    //   clientId: process.env.TWITTER_CLIENT_ID || '',
    //   clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    // }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    // Adapter writes users into the `next_auth` schema — this MUST be the
    // service-role key (bypasses RLS), NOT the public anon key, or every
    // OAuth sign-in fails on the callback and bounces back to /auth/signin.
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  }),
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: any }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

