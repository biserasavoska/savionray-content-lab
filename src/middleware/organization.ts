import { NextRequest, NextResponse } from 'next/server'

export function organizationMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for API routes, auth routes, and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if the URL contains an organization slug
  const pathSegments = pathname.split('/').filter(Boolean)
  
  // If the first segment looks like an organization slug (not a known route)
  const knownRoutes = [
    'admin', 'auth', 'api', 'ideas', 'content-review', 'ready-content', 
    'published', 'scheduled-posts', 'delivery-plans', 'billing', 'profile',
    'organization', 'feedback-management', 'approved', 'team', 'analytics'
  ]
  
  if (pathSegments.length > 0 && !knownRoutes.includes(pathSegments[0])) {
    // This might be an organization slug
    const potentialOrgSlug = pathSegments[0]
    
    // For now, we'll let the page handle organization context
    // In the future, we could validate the slug here
    return NextResponse.next()
  }

  return NextResponse.next()
} 