/**
 * Environment detection utilities
 * Helps ensure consistent behavior across development, staging, and production
 */

export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isStaging = process.env.NODE_ENV === 'staging' || process.env.VERCEL_ENV === 'preview'

/**
 * Check if we're running in a server-side environment
 */
export const isServer = typeof window === 'undefined'

/**
 * Check if we're running in a client-side environment
 */
export const isClient = typeof window !== 'undefined'

/**
 * Get the current environment name
 */
export const getEnvironment = (): string => {
  if (isDevelopment) return 'development'
  if (isStaging) return 'staging'
  if (isProduction) return 'production'
  return 'unknown'
}

/**
 * Check if we should enable development-only features
 */
export const shouldEnableDevFeatures = (): boolean => {
  return isDevelopment && isClient
}

/**
 * Check if we should use production optimizations
 */
export const shouldUseProductionOptimizations = (): boolean => {
  return isProduction || isStaging
}

/**
 * Log environment-specific information (development only)
 */
export const logEnvironmentInfo = (): void => {
  if (isDevelopment && isClient) {
    console.log('🌍 Environment Info:', {
      environment: getEnvironment(),
      isClient,
      isServer,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    })
  }
}
