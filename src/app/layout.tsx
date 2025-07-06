import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import RootClientWrapper from '../components/RootClientWrapper'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Savion Ray Content Lab',
    description: 'Content management and collaboration platform',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <RootClientWrapper session={session}>
            {children}
          </RootClientWrapper>
        </ErrorBoundary>
      </body>
    </html>
  )
} 