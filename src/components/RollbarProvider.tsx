'use client';

import { useEffect } from 'react';
import { clientRollbarConfig } from '@/lib/rollbar';

declare global {
  interface Window {
    Rollbar: any;
  }
}

interface RollbarProviderProps {
  children: React.ReactNode;
}

export default function RollbarProvider({ children }: RollbarProviderProps) {
  useEffect(() => {
    // Load Rollbar script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.rollbar.com/rollbarjs/refs/tags/latest/rollbar.min.js';
    script.async = true;
    
    script.onload = () => {
      // Initialize Rollbar after script loads
      if (window.Rollbar) {
        window.Rollbar.init(clientRollbarConfig);
        
        // Test the integration (optional - remove in production)
        if (process.env.NODE_ENV === 'development') {
          console.log('Rollbar initialized successfully');
        }
      }
    };

    script.onerror = () => {
      console.error('Failed to load Rollbar script');
    };

    document.head.appendChild(script);

    // Cleanup function to remove script if component unmounts
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return <>{children}</>;
}
