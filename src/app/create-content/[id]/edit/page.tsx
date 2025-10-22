'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Button from '@/components/ui/common/Button'
import { PageContent, PageSection } from '@/components/ui/layout/PageLayout'

export default function EditContentPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [contentItem, setContentItem] = useState<any>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Fetch content item details
    fetchContentItem()
  }, [session, status, router, params.id])

  const fetchContentItem = async () => {
    try {
      const response = await fetch(`/api/content-items/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setContentItem(data)
      }
    } catch (error) {
      console.error('Error fetching content item:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/content-items/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentItem),
      })

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      router.push('/ready-content')
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (!contentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <PageContent>
      <PageSection>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Content</h1>
            <div className="flex space-x-3">
              <Link href="/create-content">
                <Button variant="outline">
                  Back to Create Content
                </Button>
              </Link>
              <Button
                onClick={handleSave}
                disabled={loading}
                variant="default"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={contentItem.title || ''}
                  onChange={(e) => setContentItem((prev: any) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={contentItem.description || ''}
                  onChange={(e) => setContentItem((prev: any) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Body
                </label>
                <textarea
                  value={contentItem.body || ''}
                  onChange={(e) => setContentItem((prev: any) => ({ ...prev, body: e.target.value }))}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={contentItem.contentType || 'BLOG_POST'}
                  onChange={(e) => setContentItem((prev: any) => ({ ...prev, contentType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BLOG_POST">Blog Post</option>
                  <option value="SOCIAL_MEDIA_POST">Social Media Post</option>
                  <option value="NEWSLETTER">Newsletter</option>
                  <option value="WEBSITE_CONTENT">Website Content</option>
                  <option value="EMAIL_CAMPAIGN">Email Campaign</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </PageSection>
    </PageContent>
  )
}