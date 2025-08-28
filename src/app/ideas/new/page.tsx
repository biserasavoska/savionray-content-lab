'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function NewIdeaPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'social-media',
    mediaType: 'text',
    publishingDateTime: '',
    savedForLater: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create idea')
      }

      const idea = await response.json()
      router.push(`/ideas/${idea.id}`)
    } catch (error) {
      console.error('Error creating idea:', error)
      alert('Failed to create idea. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p>Please sign in to create ideas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/ideas" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Ideas
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Create New Content Idea</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your content idea title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your content idea in detail"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  id="contentType"
                  name="contentType"
                  value={formData.contentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="social-media">Social Media</option>
                  <option value="blog">Blog Post</option>
                  <option value="email">Email Newsletter</option>
                  <option value="video">Video Content</option>
                  <option value="infographic">Infographic</option>
                  <option value="whitepaper">Whitepaper</option>
                </select>
              </div>

              <div>
                <label htmlFor="mediaType" className="block text-sm font-medium text-gray-700 mb-2">
                  Media Type
                </label>
                <select
                  id="mediaType"
                  name="mediaType"
                  value={formData.mediaType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="mixed">Mixed Media</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="publishingDateTime" className="block text-sm font-medium text-gray-700 mb-2">
                Publishing Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                id="publishingDateTime"
                name="publishingDateTime"
                value={formData.publishingDateTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="savedForLater"
                name="savedForLater"
                checked={formData.savedForLater}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="savedForLater" className="ml-2 block text-sm text-gray-900">
                Save for later (don't publish immediately)
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/ideas">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Idea'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

