import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import IdeasList from '@/components/ideas/IdeasList'

export default async function IdeasPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Ideas</h1>
        <p className="mt-2 text-gray-600">
          Review and manage your pending and rejected content ideas. Approved ideas automatically move to Content Status for content creation.
        </p>
      </div>
      
      <IdeasList />
    </div>
  )
}

