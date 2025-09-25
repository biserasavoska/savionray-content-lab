'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import LogRocket from 'logrocket'

interface LogRocketProviderProps {
  children: React.ReactNode
}

export default function LogRocketProvider({ children }: LogRocketProviderProps) {
  const { data: session } = useSession()

  useEffect(() => {
    // Only initialize LogRocket in the browser
    if (typeof window !== 'undefined') {
      const appId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || 'm4ch7c/savion-ray-content-lab'
      
      try {
        // Initialize LogRocket with error handling
        LogRocket.init(appId, {
          // Add configuration to handle network errors gracefully
          network: {
            requestSanitizer: (request) => {
              // Sanitize sensitive data
              if (request.url?.includes('password') || request.url?.includes('token')) {
                return null
              }
              return request
            },
            responseSanitizer: (response) => {
              // Sanitize sensitive responses
              if (response.url?.includes('password') || response.url?.includes('token')) {
                return null
              }
              return response
            }
          },
          // Add retry configuration to handle network issues
          retry: {
            maxRetries: 3,
            retryDelay: 1000
          },
          // Disable automatic session recording on network errors
          shouldCaptureConsoleLog: () => {
            // Only capture console logs if network is stable
            return navigator.onLine
          }
        })
        
        // Optional: Identify users for better session tracking
        // This will be called when user session is available
        const identifyUser = (user: any) => {
          try {
            if (user?.email) {
              LogRocket.identify(user.email, {
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
              })
            }
          } catch (error) {
            console.warn('LogRocket identify failed:', error)
          }
        }
        
        // Store the identify function globally so it can be called from other components
        ;(window as any).logRocketIdentify = identifyUser
        
        // Add global error handler to suppress LogRocket network errors
        const originalConsoleError = console.error
        console.error = (...args) => {
          // Suppress LogRocket network errors from appearing in console
          const errorMessage = args.join(' ')
          if (errorMessage.includes('net::ERR_NETWORK_CHANGED') || 
              errorMessage.includes('logger-1.min.js') ||
              errorMessage.includes('LogRocket')) {
            // Silently ignore LogRocket network errors
            return
          }
          // Log other errors normally
          originalConsoleError.apply(console, args)
        }

        console.log('LogRocket initialized with app ID:', appId)
      } catch (error) {
        console.warn('LogRocket initialization failed:', error)
        // Continue without LogRocket if it fails
      }
    }
  }, [])

  // Identify user when session is available
  useEffect(() => {
    if (session?.user && typeof window !== 'undefined' && (window as any).logRocketIdentify) {
      try {
        (window as any).logRocketIdentify(session.user)
      } catch (error) {
        console.warn('LogRocket user identification failed:', error)
      }
    }
  }, [session])

  return <>{children}</>
}
