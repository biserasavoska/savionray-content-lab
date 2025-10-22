'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Button from '@/components/ui/common/Button'
import { PageContent, PageSection } from '@/components/ui/layout/PageLayout'

export default function CreateContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  const handleCreateContent = async (contentType: string) => {
    setLoading(true)
    try {
      // Create a new content item
      const response = await fetch('/api/content-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `New ${contentType.replace('_', ' ')}`,
          description: '',
          contentType: contentType,
          contentBody: '',
          metadata: {}
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create content item')
      }

      const result = await response.json()
      // Navigate to edit the newly created content
      router.push(`/ready-content/${result.id}/edit`)
    } catch (error) {
      console.error('Error creating content:', error)
      alert('Failed to create content. Please try again.')
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

  return (
    <PageContent>
      <PageSection>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Content</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Blog Post</h3>
              <p className="text-gray-600 mb-4">Create a comprehensive blog post for your website.</p>
              <Button
                onClick={() => handleCreateContent('BLOG_POST')}
                disabled={loading}
                variant="default"
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Blog Post'}
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Media Post</h3>
              <p className="text-gray-600 mb-4">Create engaging social media content.</p>
              <Button
                onClick={() => handleCreateContent('SOCIAL_MEDIA_POST')}
                disabled={loading}
                variant="default"
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Social Post'}
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Newsletter</h3>
              <p className="text-gray-600 mb-4">Create an email newsletter for your subscribers.</p>
              <Button
                onClick={() => handleCreateContent('NEWSLETTER')}
                disabled={loading}
                variant="default"
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Newsletter'}
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Website Content</h3>
              <p className="text-gray-600 mb-4">Create content for your website pages.</p>
              <Button
                onClick={() => handleCreateContent('WEBSITE_CONTENT')}
                disabled={loading}
                variant="default"
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Website Content'}
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Campaign</h3>
              <p className="text-gray-600 mb-4">Create targeted email marketing content.</p>
              <Button
                onClick={() => handleCreateContent('EMAIL_CAMPAIGN')}
                disabled={loading}
                variant="default"
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Email Campaign'}
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI-Enhanced Creation</h3>
              <p className="text-gray-600 mb-4">Use AI to help create optimized content.</p>
              <Link href="/create-content/ai-enhanced">
                <Button
                  variant="outline"
                  className="w-full"
                >
                  AI-Enhanced Creation
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/ready-content">
              <Button variant="secondary">
                Back to Drafts
              </Button>
            </Link>
          </div>
        </div>
      </PageSection>
    </PageContent>
  )
}
