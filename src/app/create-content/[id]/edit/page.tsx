'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import Button from '@/components/ui/common/Button'
import { PageContent, PageSection } from '@/components/ui/layout/PageLayout'

export default function EditContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    body: '',
    contentType: 'BLOG_POST'
  })
  const isAIEnhanced = searchParams.get('ai-enhanced') === 'true'

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Load content if we have an ID
    if (params.id && params.id !== 'undefined') {
      loadContent()
    }
  }, [session, status, router, params.id])

  const loadContent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/content-items/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to load content')
      }
      const data = await response.json()
      setContent(data)
      setFormData({
        title: data.title || '',
        description: data.description || '',
        body: data.body || '',
        contentType: data.contentType || 'BLOG_POST'
      })
    } catch (error) {
      console.error('Error loading content:', error)
      alert('Failed to load content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/content-items/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      alert('Content saved successfully!')
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitForReview = async () => {
    setSaving(true)
    try {
      // First save the content
      await handleSave()
      
      // Then submit for review
      const response = await fetch(`/api/content-items/${params.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CONTENT_REVIEW' }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit for review')
      }

      alert('Content submitted for review successfully!')
      router.push('/ready-content')
    } catch (error) {
      console.error('Error submitting for review:', error)
      alert('Failed to submit for review. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {content ? 'Edit Content' : 'Create Content'}
              {isAIEnhanced && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  AI Enhanced
                </span>
              )}
            </h1>
            <Link href="/create-content">
              <Button variant="secondary">
                Back to Create Content
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter content title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={formData.contentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value }))}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter content description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Body
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Enter your content here..."
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    variant="outline"
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={saving || !formData.title}
                    variant="default"
                  >
                    {saving ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                </div>

                <Link href="/ready-content">
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </PageSection>
    </PageContent>
  )
}
