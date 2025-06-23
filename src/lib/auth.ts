import { Session } from 'next-auth'
import { Prisma } from '@prisma/client'
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import { prisma } from "./prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import LinkedInProvider from "next-auth/providers/linkedin"
import { UserRole } from '@prisma/client'

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
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as UserRole
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
          scope: 'openid profile w_member_social email'
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
        if (!credentials?.email) {
          throw new Error('Email is required')
        }
        
        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          // If user exists, return their data
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            }
          }

          // Determine role based on email
          const emailDomain = credentials.email.split('@')[1]
          let role: UserRole = 'CREATIVE'
          if (credentials.email === 'admin@savionray.com') {
            role = 'ADMIN'
          } else if (credentials.email === 'client@savionray.com') {
            role = 'CLIENT'
          } else if (credentials.email === 'creative@savionray.com') {
            role = 'CREATIVE'
          } else if (emailDomain === 'savionray.com') {
            role = 'CLIENT'
          }

          // Create new user with appropriate role
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              role: role as UserRole
            }
          })

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ]
} 