'use client'

import { useEffect, useState } from 'react'
import { logEvent, logError } from '@/lib/logrocket'

export default function LogRocketTestPage() {
  const [status, setStatus] = useState('Checking...')
  const [isLogRocketLoaded, setIsLogRocketLoaded] = useState(false)

  useEffect(() => {
    // Check if LogRocket is loaded
    const checkLogRocket = () => {
      if (typeof window !== 'undefined' && (window as any).LogRocket) {
        setIsLogRocketLoaded(true)
        setStatus('✅ LogRocket is loaded and ready!')
        
        // Log a test event
        logEvent('logrocket_test_page_loaded', {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          appId: process.env.NEXT_PUBLIC_LOGROCKET_APP_ID
        })
      } else {
        setStatus('❌ LogRocket not loaded')
      }
    }

    // Check immediately and after a short delay
    checkLogRocket()
    const timeout = setTimeout(checkLogRocket, 2000)
    
    return () => clearTimeout(timeout)
  }, [])

  const testEvent = () => {
    logEvent('logrocket_manual_test', {
      message: 'Manual test from production',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
    setStatus('✅ Test event sent! Check LogRocket dashboard.')
  }

  const testError = () => {
    logError(new Error('Test error from production LogRocket test page'), {
      context: 'production_test',
      timestamp: new Date().toISOString()
    })
    setStatus('✅ Test error sent! Check LogRocket dashboard.')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">LogRocket Production Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-lg mb-4">{status}</p>
          
          <div className="space-y-2">
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>App ID:</strong> {process.env.NEXT_PUBLIC_LOGROCKET_APP_ID}</p>
            <p><strong>LogRocket Loaded:</strong> {isLogRocketLoaded ? 'Yes' : 'No'}</p>
            <p><strong>Window Object:</strong> {typeof window !== 'undefined' ? 'Available' : 'Not Available'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={testEvent}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Send Test Event
            </button>
            <button
              onClick={testError}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Send Test Error
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Next Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Open your browser's Developer Tools (F12)</li>
            <li>Check the Console tab for "LogRocket initialized" message</li>
            <li>Click the test buttons above to send events</li>
            <li>Visit your LogRocket dashboard at <a href="https://app.logrocket.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://app.logrocket.com</a></li>
            <li>Look for sessions from "app.savionray.com"</li>
          </ol>
        </div>

        <div className="mt-6">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
