'use client'

import { useSession } from 'next-auth/react'

export default function TestPage() {
  const { data: session, status } = useSession()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Session Status:</strong> {status}
        </div>
        
        <div>
          <strong>Session Data:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-2">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>User Info:</strong>
          {session?.user ? (
            <div className="mt-2">
              <p>Name: {session.user.name}</p>
              <p>Email: {session.user.email}</p>
              <p>Role: {session.user.role}</p>
            </div>
          ) : (
            <p className="text-red-500">No user session</p>
          )}
        </div>
        
        <div className="mt-4">
          <a 
            href="/auth/signin" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    </div>
  )
} 