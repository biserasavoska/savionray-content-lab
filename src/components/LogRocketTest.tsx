'use client'

import { useState } from 'react'
import { logEvent, logError } from '@/lib/logrocket'

export default function LogRocketTest() {
  const [testMessage, setTestMessage] = useState('')

  const testEvent = () => {
    logEvent('logrocket_test', { 
      message: 'Test event from LogRocket test component',
      timestamp: new Date().toISOString()
    })
    setTestMessage('Event logged! Check LogRocket dashboard.')
  }

  const testError = () => {
    logError(new Error('Test error from LogRocket test component'), {
      context: 'test_component',
      timestamp: new Date().toISOString()
    })
    setTestMessage('Error logged! Check LogRocket dashboard.')
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">LogRocket Test</h3>
      <div className="space-y-2">
        <button
          onClick={testEvent}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          Test Event
        </button>
        <button
          onClick={testError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Error
        </button>
        {testMessage && (
          <p className="text-sm text-gray-600 mt-2">{testMessage}</p>
        )}
      </div>
    </div>
  )
}
