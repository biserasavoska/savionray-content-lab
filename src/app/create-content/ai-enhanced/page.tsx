'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AIEnhancedEditor from '@/components/editor/AIEnhancedEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import { 
  ArrowLeft, 
  Save, 
  Send, 
  FileText,
  MessageSquare,
  Mail,
  Globe
} from 'lucide-react'

export default function AIEnhancedContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState<'blog' | 'social' | 'email' | 'article'>('blog')
  const [isSaving, setIsSaving] = useState(false)

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save to content drafts
      const response = await fetch('/api/content-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: content,
          contentType,
          metadata: {
            aiEnhanced: true,
            contentType,
            createdAt: new Date().toISOString()
          }
        })
      })

      if (response.ok) {
        const savedDraft = await response.json()
        router.push(`/content-review/${savedDraft.id}`)
      }
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const contentTypeOptions = [
    { value: 'blog', label: 'Blog Post', icon: FileText, description: 'Long-form articles and blog posts' },
    { value: 'social', label: 'Social Media', icon: MessageSquare, description: 'Social media posts and updates' },
    { value: 'email', label: 'Email', icon: Mail, description: 'Email newsletters and campaigns' },
    { value: 'article', label: 'Article', icon: Globe, description: 'Professional articles and content' }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.back()}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">AI-Enhanced Content Creation</h1>
            <p className="text-muted-foreground">Create content with AI assistance and real-time optimization</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            icon={<Save className="w-4 h-4" />}
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            icon={<Send className="w-4 h-4" />}
          >
            Submit for Review
          </Button>
        </div>
      </div>

      {/* Content Type Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Content Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contentTypeOptions.map((option) => {
              const Icon = option.icon
              return (
                <div
                  key={option.value}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${contentType === option.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setContentType(option.value as any)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${contentType === option.value ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Enhanced Editor */}
      <AIEnhancedEditor
        content={content}
        contentType={contentType}
        onContentChange={setContent}
        onSave={handleSave}
        placeholder={`Start writing your ${contentType} content... The AI assistant will provide suggestions and optimization tips as you write.`}
      />

      {/* Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>AI Assistant Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">💡 Smart Suggestions</h4>
              <p className="text-muted-foreground">
                Get AI-powered suggestions for titles, hashtags, and content improvements as you write.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Real-time Analysis</h4>
              <p className="text-muted-foreground">
                Monitor SEO scores, readability, and engagement metrics in real-time.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Brand Consistency</h4>
              <p className="text-muted-foreground">
                Ensure your content aligns with your brand voice and messaging guidelines.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 