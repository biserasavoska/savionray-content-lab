import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function TestAuthPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        <p className="text-red-600">No session found. Please sign in.</p>
      </div>
    )
  }

  // Test the exact query
  const drafts = await prisma.contentDraft.findMany({
    where: {
      createdById: session.user.id,
      Idea: {
        status: 'APPROVED'
      },
      status: {
        in: ['DRAFT', 'AWAITING_FEEDBACK', 'AWAITING_REVISION', 'APPROVED', 'REJECTED']
      }
    },
    include: {
      Idea: {
        select: {
          title: true,
          status: true
        }
      }
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Session Data:</h2>
        <pre className="text-sm bg-white p-2 rounded border">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Database Query Test:</h2>
        <p>User ID: {session.user.id}</p>
        <p>User Email: {session.user.email}</p>
        <p>User Role: {session.user.role}</p>
        <p>Found {drafts.length} drafts for this user</p>
        
        {drafts.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Drafts:</h3>
            <ul className="list-disc list-inside">
              {drafts.map((draft) => (
                <li key={draft.id}>
                  {draft.Idea.title} - {draft.status}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-x-4">
        <a 
          href="/content-review" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Content Review
        </a>
        <a 
          href="/ready-content" 
          className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Test Ready Content
        </a>
      </div>
    </div>
  )
} 