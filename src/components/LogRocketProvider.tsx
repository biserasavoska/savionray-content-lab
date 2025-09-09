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
      
      // Initialize LogRocket
      LogRocket.init(appId)
      
      // Optional: Identify users for better session tracking
      // This will be called when user session is available
      const identifyUser = (user: any) => {
        if (user?.email) {
          LogRocket.identify(user.email, {
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
          })
        }
      }
      
      // Store the identify function globally so it can be called from other components
      ;(window as any).logRocketIdentify = identifyUser
      
      console.log('LogRocket initialized with app ID:', appId)
    }
  }, [])

  // Identify user when session is available
  useEffect(() => {
    if (session?.user && typeof window !== 'undefined' && (window as any).logRocketIdentify) {
      (window as any).logRocketIdentify(session.user)
    }
  }, [session])

  return <>{children}</>
}
