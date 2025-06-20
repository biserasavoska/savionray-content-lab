import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { isCreative } from '@/lib/auth'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const isCreativeUser = isCreative(session)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/ideas"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Ideas</h2>
            <p className="text-gray-600">Create and manage content ideas</p>
          </Link>

          {isCreativeUser ? (
            <Link
              href="/create-content"
              className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">Create Content</h2>
              <p className="text-gray-600">Create content for approved ideas</p>
            </Link>
          ) : (
            <Link
              href="/ready-content"
              className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">Ready Content</h2>
              <p className="text-gray-600">Review content drafts</p>
            </Link>
          )}

          <Link
            href="/scheduled-posts"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Scheduled Posts</h2>
            <p className="text-gray-600">Manage your scheduled content</p>
          </Link>

          <Link
            href="/approvals"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Approvals</h2>
            <p className="text-gray-600">Review and approve content</p>
          </Link>
        </div>
      </div>
    </main>
  )
} 