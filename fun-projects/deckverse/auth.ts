import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user) return null
        const account = await prisma.account.findFirst({
          where: { userId: user.id, provider: 'credentials' },
        })
        if (!account?.access_token) return null
        const valid = await bcrypt.compare(credentials.password as string, account.access_token)
        if (!valid) return null
        return user
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/signin' },
})
