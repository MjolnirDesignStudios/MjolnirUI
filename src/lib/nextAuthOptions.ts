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
    secret: process.env.NEXT_PUBLIC_SUPABASE_KEY || '',
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
