import { Session , NextAuthOptions } from 'next-auth'
import { Prisma , UserRole } from '@prisma/client'
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import LinkedInProvider from "next-auth/providers/linkedin"
import bcrypt from 'bcryptjs'

import { prisma } from "./prisma"

export function isCreative(session: Session | null): boolean {
  return session?.user?.role === 'CREATIVE' || session?.user?.role === 'ADMIN'
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
  // Ensure proper URL handling for Railway
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL }),
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
        token.isSuperAdmin = (user as any).isSuperAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as UserRole
        session.user.isSuperAdmin = token.isSuperAdmin as boolean
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to the main dashboard after login
      return baseUrl + '/';
    },
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
        if (!credentials?.email) {
          throw new Error('Email is required')
        }
        if (!credentials?.password) {
          throw new Error('Password is required')
        }
        
        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              password: true,
              isSuperAdmin: true
            }
          })

          // If user exists, check password
          if (user) {
            if (user.password) {
              const isValid = await bcrypt.compare(credentials.password, user.password)
              if (!isValid) {
                throw new Error('Invalid email or password')
              }
            } // If user.password is null, allow login (legacy users)
            return {
              id: user.id,
              email: user.email || '',
              name: user.name || '',
              role: user.role,
              isSuperAdmin: user.isSuperAdmin
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

          // Hash the password
          const hashedPassword = await bcrypt.hash(credentials.password, 10)

          // Create new user with appropriate role and password
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              role: role as UserRole,
              password: hashedPassword,
              isSuperAdmin: credentials.email === 'admin@savionray.com'
            }
          })

          return {
            id: newUser.id,
            email: newUser.email || '',
            name: newUser.name || '',
            role: newUser.role,
            isSuperAdmin: newUser.isSuperAdmin
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ]
} 

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      isSuperAdmin?: boolean
    }
  }
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    isSuperAdmin?: boolean
  }
} 