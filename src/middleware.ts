import { NextRequest, NextResponse } from 'next/server'
import { organizationMiddleware } from './middleware/organization'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply organization middleware for non-API routes
  const orgResponse = organizationMiddleware(request)
  if (orgResponse) {
    return orgResponse
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 