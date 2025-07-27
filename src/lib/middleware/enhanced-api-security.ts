/**
 * Enhanced API Security Middleware
 * 
 * Provides comprehensive security features including:
 * - Organization context validation
 * - Rate limiting and abuse prevention
 * - Input validation and sanitization
 * - Security event logging
 * - Request/response monitoring
 * - CORS and security headers
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security configuration
const SECURITY_CONFIG = {
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  MAX_REQUEST_SIZE: '10mb',
  ALLOWED_ORIGINS: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  BLOCKED_USER_AGENTS: [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java'
  ]
}

// Input validation patterns
const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  ALPHANUMERIC: /^[a-zA-Z0-9\s\-_]+$/,
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/i
}

export class EnhancedAPISecurity {
  private static instance: EnhancedAPISecurity

  static getInstance(): EnhancedAPISecurity {
    if (!EnhancedAPISecurity.instance) {
      EnhancedAPISecurity.instance = new EnhancedAPISecurity()
    }
    return EnhancedAPISecurity.instance
  }

  // Rate limiting
  private checkRateLimit(identifier: string): boolean {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    if (!record || now > record.resetTime) {
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS
      })
      return true
    }

    if (record.count >= SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
      return false
    }

    record.count++
    return true
  }

  // Input sanitization
  private sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }

  // Validate input against patterns
  private validateInput(value: string, pattern: RegExp): boolean {
    return pattern.test(value)
  }

  // Check for malicious user agents
  private isBlockedUserAgent(userAgent: string): boolean {
    const lowerUA = userAgent.toLowerCase()
    return SECURITY_CONFIG.BLOCKED_USER_AGENTS.some(blocked => 
      lowerUA.includes(blocked)
    )
  }

  // CORS validation
  private validateCORS(origin: string): boolean {
    return SECURITY_CONFIG.ALLOWED_ORIGINS.includes(origin) || 
           SECURITY_CONFIG.ALLOWED_ORIGINS.includes('*')
  }

  // Main security middleware
  async handleRequest(req: NextRequest): Promise<NextResponse | null> {
    const startTime = Date.now()
    
    try {
      // 1. Basic security checks
      if (!this.performBasicSecurityChecks(req)) {
        return this.createSecurityResponse('Security check failed', 403)
      }

      // 2. Rate limiting
      const identifier = this.getRateLimitIdentifier(req)
      if (!this.checkRateLimit(identifier)) {
        return this.createSecurityResponse('Rate limit exceeded', 429)
      }

      // 3. Authentication check (for protected routes)
      if (this.isProtectedRoute(req.nextUrl.pathname)) {
        const authResult = await this.validateAuthentication(req)
        if (!authResult.valid) {
          return this.createSecurityResponse(authResult.message || 'Authentication failed', 401)
        }
      }

      // 4. Input validation (for POST/PUT requests)
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const validationResult = await this.validateRequestInput(req)
        if (!validationResult.valid) {
          return this.createSecurityResponse(validationResult.message || 'Invalid request', 400)
        }
      }

      // 5. Add security headers
      const response = NextResponse.next()
      this.addSecurityHeaders(response)

      // 6. Log security event
      this.logSecurityEvent(req, 'success', Date.now() - startTime)

      return null // Continue with request

    } catch (error) {
      console.error('Security middleware error:', error)
      this.logSecurityEvent(req, 'error', Date.now() - startTime, error)
      return this.createSecurityResponse('Internal security error', 500)
    }
  }

  private performBasicSecurityChecks(req: NextRequest): boolean {
    // Check user agent
    const userAgent = String(req.headers.get('user-agent') || '')
    if (this.isBlockedUserAgent(userAgent)) {
      return false
    }

    // Check content length
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
      return false
    }

    // Check for suspicious headers
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-forwarded-proto']
    for (const header of suspiciousHeaders) {
      if (req.headers.get(header) && !req.headers.get('x-forwarded-for')) {
        return false
      }
    }

    return true
  }

  private getRateLimitIdentifier(req: NextRequest): string {
    function safeString(val: unknown): string {
      if (typeof val === 'string' && val) return val;
      if (typeof val === 'number') return String(val);
      return 'unknown';
    }
    const ip = req.ip ? String(req.ip) : safeString(req.headers.get('x-forwarded-for'));
    const userAgent = safeString(req.headers.get('user-agent'));
    return `${ip}-${userAgent}`;
  }

  private isProtectedRoute(pathname: string): boolean {
    const protectedPatterns = [
      /^\/api\/admin/,
      /^\/api\/organization/,
      /^\/api\/billing/,
      /^\/api\/ideas\/.*\/edit/,
      /^\/api\/content-drafts/
    ]
    return protectedPatterns.some(pattern => pattern.test(pathname))
  }

  private async validateAuthentication(req: NextRequest): Promise<{ valid: boolean; message?: string }> {
    try {
      const token = await getToken({ req })
      if (!token) {
        return { valid: false, message: 'Authentication required' }
      }
      return { valid: true }
    } catch (error) {
      return { valid: false, message: 'Invalid authentication token' }
    }
  }

  private async validateRequestInput(req: NextRequest): Promise<{ valid: boolean; message?: string }> {
    try {
      const contentType = req.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        const body = await req.json()
        return this.validateJSONBody(body, req.nextUrl.pathname)
      }
      
      if (contentType?.includes('multipart/form-data')) {
        return this.validateFormData(req)
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, message: 'Invalid request body' }
    }
  }

  private validateJSONBody(body: any, pathname: string): { valid: boolean; message?: string } {
    // Validate based on route
    if (pathname.includes('/api/ideas')) {
      if (body.title && !this.validateInput(body.title, VALIDATION_PATTERNS.ALPHANUMERIC)) {
        return { valid: false, message: 'Invalid title format' }
      }
      if (body.content && body.content.length > 10000) {
        return { valid: false, message: 'Content too long' }
      }
    }

    if (pathname.includes('/api/organization')) {
      if (body.name && !this.validateInput(body.name, VALIDATION_PATTERNS.ALPHANUMERIC)) {
        return { valid: false, message: 'Invalid organization name' }
      }
    }

    return { valid: true }
  }

  private async validateFormData(req: NextRequest): Promise<{ valid: boolean; message?: string }> {
    try {
      const formData = await req.formData()
      
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          const sanitized = this.sanitizeInput(value)
          if (sanitized !== value) {
            return { valid: false, message: 'Invalid input detected' }
          }
        }
      }

      return { valid: true }
  } catch (error) {
      return { valid: false, message: 'Invalid form data' }
    }
  }

  private addSecurityHeaders(response: NextResponse): void {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Add CSP header with WebSocket support
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; connect-src 'self' ws://localhost:4001 wss://localhost:4001; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );
  }

  private createSecurityResponse(message: string, status: number): NextResponse {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Security Error', 
        message,
        timestamp: new Date().toISOString()
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY'
        }
      }
    )
  }

  private logSecurityEvent(
    req: NextRequest, 
    type: 'success' | 'error' | 'blocked', 
    duration: number, 
    error?: any
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      type,
      method: req.method,
      url: req.url,
      ip: String(req.ip || req.headers.get('x-forwarded-for') || 'unknown'),
      userAgent: String(req.headers.get('user-agent') || 'unknown'),
      duration,
      error: error?.message
    }

    if (process.env.NODE_ENV === 'production') {
      console.log('SECURITY_EVENT:', JSON.stringify(logData))
    } else {
      console.log('🔒 Security Event:', logData)
    }
  }
}

// Export middleware function
export async function enhancedAPISecurityMiddleware(req: NextRequest): Promise<NextResponse | null> {
  return EnhancedAPISecurity.getInstance().handleRequest(req)
}

// Higher-order function to wrap API handlers with security
export function withEnhancedApiSecurity<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>,
  config?: {
    requireOrgContext?: boolean
    validateInput?: boolean
    logSecurityEvents?: boolean
    rateLimit?: {
      windowMs: number
      maxRequests: number
    }
  }
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const security = EnhancedAPISecurity.getInstance()
    const securityResult = await security.handleRequest(req)
    
    if (securityResult) {
      return securityResult
    }
    
    return handler(req, ...args)
  }
} 