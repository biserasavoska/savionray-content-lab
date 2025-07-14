import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedApiSecurity } from '@/lib/middleware/enhanced-api-security';
import { SecurityContext } from '@/lib/types/security';

async function testSecurityHandler(
  request: NextRequest, 
  context: SecurityContext
): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Enhanced security test successful',
    user: {
      id: context.userId,
      email: context.userEmail,
      role: context.userRole
    },
    organization: {
      id: context.organizationId,
      name: context.organizationId // Using ID as name for now
    },
    timestamp: new Date().toISOString()
  });
}

// Export the handler wrapped with enhanced security
export const GET = withEnhancedApiSecurity(testSecurityHandler, {
  requireOrgContext: true,
  validateInput: true,
  logSecurityEvents: true,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10 // 10 requests per window
  }
});

export const POST = withEnhancedApiSecurity(testSecurityHandler, {
  requireOrgContext: true,
  validateInput: true,
  logSecurityEvents: true,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 requests per window
  }
}); 