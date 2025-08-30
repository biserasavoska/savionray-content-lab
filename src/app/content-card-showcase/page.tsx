

'use client'

import React, { useState } from 'react'

// Sample content data for demonstration
const sampleContent = [
  {
    id: '1',
    title: 'Getting Started with Next.js 14',
    description: 'A comprehensive guide to building modern web applications with Next.js 14, covering all the new features and best practices.',
    content: 'Next.js 14 introduces several groundbreaking features that make building full-stack applications easier than ever...',
    status: 'published',
    contentType: 'article',
    author: 'John Doe',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    tags: ['Next.js', 'React', 'Web Development', 'Tutorial'],
    priority: 'high',
    estimatedReadTime: 8,
  },
  {
    id: '2',
    title: 'AI-Powered Content Creation',
    description: 'Exploring how artificial intelligence is revolutionizing content creation workflows and improving productivity.',
    content: 'Artificial intelligence has transformed the way we approach content creation...',
    status: 'review',
    contentType: 'blog',
    author: 'Jane Smith',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
    tags: ['AI', 'Content Creation', 'Productivity', 'Innovation'],
    priority: 'urgent',
    estimatedReadTime: 12,
  },
]

export default function ContentCardShowcase() {
  const [currentView, setCurrentView] = useState<'showcase' | 'grid' | 'skeleton'>('showcase')

  const handleEdit = (id: string) => {
    console.log('Edit item:', id)
    alert(`Edit item: ${id}`)
  }

  const handleDelete = (id: string) => {
    console.log('Delete item:', id)
    alert(`Delete item: ${id}`)
  }

  const handleApprove = (id: string) => {
    console.log('Approve item:', id)
    alert(`Approve item: ${id}`)
  }

  const handlePublish = (id: string) => {
    console.log('Publish item:', id)
    alert(`Publish item: ${id}`)
  }

  const handleArchive = (id: string) => {
    console.log('Archive item:', id)
    alert(`Archive item: ${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Content Card System Showcase
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Demonstrating the comprehensive content card system with all features and capabilities
          </p>
          
          {/* Navigation */}
          <div className="mt-4 flex gap-2">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentView === 'showcase' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setCurrentView('showcase')}
            >
              Individual Cards
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentView === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setCurrentView('grid')}
            >
              Grid System
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentView === 'skeleton' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setCurrentView('skeleton')}
            >
              Loading States
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {currentView === 'showcase' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Individual Content Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sampleContent.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'published' ? 'bg-green-100 text-green-800' :
                          item.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {item.contentType}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {item.author}</span>
                        <span>{item.estimatedReadTime} min read</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                          onClick={() => handleEdit(item.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'grid' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Content Grid System</h3>
              <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
                <h4 className="font-medium mb-4">Filters and Controls</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Search content..."
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <select className="px-3 py-2 border border-gray-300 rounded-md">
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="published">Published</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md">
                    <option value="all">All Types</option>
                    <option value="article">Article</option>
                    <option value="blog">Blog</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                    Clear Filters
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sampleContent.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        onClick={() => handleEdit(item.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'skeleton' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Loading States (Skeletons)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg border shadow-sm p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-16 bg-gray-200 rounded"></div>
                      <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
