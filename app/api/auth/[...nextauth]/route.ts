import NextAuth from 'next-auth'
import { nextAuthOptions } from '@/lib/nextAuthOptions'

const handler = NextAuth({
  ...nextAuthOptions,
  debug: true, // Temporary — shows detailed errors in server console
})

export { handler as GET, handler as POST }
