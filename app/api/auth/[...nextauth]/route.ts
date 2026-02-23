import NextAuth from 'next-auth';
import { nextAuthOptions } from '@/lib/nextAuthOptions';

export const GET = NextAuth(nextAuthOptions);
export const POST = NextAuth(nextAuthOptions);
