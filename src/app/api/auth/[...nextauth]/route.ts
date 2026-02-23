import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // For demo purposes, accept any email/password
        // In production, validate against your database
        if (credentials?.email && credentials?.password) {
          return {
            id: '1',
            email: credentials.email,
            name: 'Demo User'
          }
        }
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin'
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }