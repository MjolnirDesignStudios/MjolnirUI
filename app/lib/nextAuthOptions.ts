import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import { supabase } from './supabaseClient';
import { supabaseAdmin } from './supabaseAdmin';
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
    secret: process.env.NEXT_PUBLIC_SUPABASE_KEY || '',
  }),
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
          const { data } = await supabaseAdmin
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
          const { data } = await supabaseAdmin
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
