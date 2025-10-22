'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import Button from '@/components/ui/common/Button'
import { PageContent, PageSection } from '@/components/ui/layout/PageLayout'

export default function AIEnhancedCreateContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: searchParams.get('type') || 'BLOG_POST',
    targetAudience: '',
    keywords: '',
    tone: 'professional'
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  const handleAIGenerate = async () => {
    setAiGenerating(true)
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI-generated content
      setFormData(prev => ({
        ...prev,
        title: `AI-Generated ${prev.contentType.replace('_', ' ')}: ${prev.keywords || 'Engaging Content'}`,
        description: `This ${prev.contentType.toLowerCase().replace('_', ' ')} is optimized for ${prev.targetAudience || 'your target audience'} with a ${prev.tone} tone.`
      }))
    } catch (error) {
      console.error('AI generation error:', error)
      alert('Failed to generate AI content. Please try again.')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleCreateContent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          contentType: formData.contentType,
          contentBody: '',
          metadata: {
            aiGenerated: true,
            targetAudience: formData.targetAudience,
            keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
            tone: formData.tone
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create content item')
      }

      const result = await response.json()
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">AI-Enhanced Content Creation</h1>
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Powered by AI</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <form onSubmit={(e) => { e.preventDefault(); handleCreateContent(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone
                  </label>
                  <select
                    value={formData.tone}
                    onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="authoritative">Authoritative</option>
                    <option value="conversational">Conversational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="e.g., Small business owners, Tech professionals, Students"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="e.g., marketing, strategy, growth, innovation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter content title or let AI generate it"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter content description or let AI generate it"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={aiGenerating}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  {aiGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Generate with AI</span>
                    </>
                  )}
                </Button>

                <div className="flex space-x-3">
                  <Link href="/create-content">
                    <Button type="button" variant="secondary">
                      Back
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading || !formData.title}
                    variant="default"
                  >
                    {loading ? 'Creating...' : 'Create Content'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </PageSection>
    </PageContent>
  )
}
