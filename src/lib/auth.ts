import { Session } from 'next-auth'
import { Prisma } from '@prisma/client'
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import { prisma } from "./prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import LinkedInProvider from "next-auth/providers/linkedin"

export function isCreative(session: Session | null): boolean {
  return session?.user?.role === 'CREATIVE'
}

export function isClient(session: Session | null): boolean {
  return session?.user?.role === 'CLIENT'
}

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === 'ADMIN'
}

export function hasRole(session: Session | null, roles: string[]): boolean {
  if (!session?.user?.role) return false
  return roles.includes(session.user.role)
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub as string
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        })
        session.user.role = dbUser?.role
      }
      return session
    }
  },
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email w_member_social'
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        // For testing purposes, we'll allow any of our seeded users to login with any password
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }

        // If email doesn't exist, create a new user
        const newUser = await prisma.user.create({
          data: {
            email: credentials.email,
            name: credentials.email.split('@')[0],
            role: 'CREATIVE'
          }
        })

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      }
    })
  ]
} 