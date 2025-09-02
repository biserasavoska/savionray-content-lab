'use client'

import React, { useState } from 'react'
import { 
  ContentCard, 
  EnhancedContentCard, 
  ContentCardGrid,
  ContentTypeBadge,
  ContentCardHeader,
  ContentCardBody
} from '@/components/ui/content'
import { Card, CardContent, CardHeader } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/common/Tabs'
import Badge from '@/components/ui/common/Badge'

export default function ContentCardShowcase() {
  const [currentView, setCurrentView] = useState('enhanced')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Sample content data
  const sampleContent = [
    {
      id: '1',
      title: 'The Future of AI in Content Creation',
      description: 'Exploring how artificial intelligence is revolutionizing the way we create and consume content.',
      content: 'Artificial intelligence is transforming the content creation landscape at an unprecedented pace. From automated writing tools to intelligent content optimization, AI is enabling creators to produce higher quality content more efficiently than ever before. This comprehensive guide explores the latest developments in AI-powered content creation, including natural language processing, computer vision, and machine learning applications that are reshaping the industry.',
      status: 'published' as const,
      contentType: 'article' as const,
      author: 'Sarah Johnson',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      tags: ['AI', 'Content Creation', 'Technology', 'Future Trends'],
      priority: 'high' as const,
      estimatedReadTime: 8,
    },
    {
      id: '2',
      title: 'Social Media Marketing Best Practices',
      description: 'A comprehensive guide to effective social media marketing strategies for modern businesses.',
      content: 'Social media marketing has become an essential component of any successful business strategy. With billions of users across various platforms, understanding how to effectively engage your audience and drive meaningful results is crucial for business growth.',
      status: 'review' as const,
      contentType: 'blog' as const,
      author: 'Mike Chen',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-22'),
      tags: ['Social Media', 'Marketing', 'Strategy'],
      priority: 'medium' as const,
      estimatedReadTime: 5,
    },
    {
      id: '3',
      title: 'Weekly Newsletter - Industry Updates',
      description: 'Stay informed with the latest industry news and insights delivered to your inbox.',
      content: 'This week we cover the latest developments in content marketing, including new platform features, algorithm updates, and emerging trends that are shaping the future of digital marketing.',
      status: 'draft' as const,
      contentType: 'newsletter' as const,
      author: 'Emily Rodriguez',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      tags: ['Newsletter', 'Industry News', 'Updates'],
      priority: 'low' as const,
      estimatedReadTime: 3,
    },
    {
      id: '4',
      title: 'Podcast Episode: Content Strategy Deep Dive',
      description: 'An in-depth discussion about developing effective content strategies for different industries.',
      content: 'In this episode, we sit down with industry experts to discuss the key components of a successful content strategy, including audience research, content planning, and performance measurement.',
      status: 'approved' as const,
      contentType: 'podcast' as const,
      author: 'David Kim',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-19'),
      tags: ['Podcast', 'Strategy', 'Content Planning'],
      priority: 'high' as const,
      estimatedReadTime: 45,
    },
    {
      id: '5',
      title: 'Video Tutorial: Content Creation Tools',
      description: 'Learn how to use the latest content creation tools to enhance your workflow.',
      content: 'This comprehensive video tutorial covers the most popular content creation tools available today, including design software, video editing platforms, and collaboration tools that can help streamline your content production process.',
      status: 'archived' as const,
      contentType: 'video' as const,
      author: 'Lisa Wang',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15'),
      tags: ['Video', 'Tutorial', 'Tools', 'Workflow'],
      priority: 'medium' as const,
      estimatedReadTime: 15,
    },
  ]

  const handleEdit = (id: string) => {
    console.log('Edit content:', id)
  }

  const handleDelete = (id: string) => {
    console.log('Delete content:', id)
  }

  const handleApprove = (id: string) => {
    console.log('Approve content:', id)
  }

  const handlePublish = (id: string) => {
    console.log('Publish content:', id)
  }

  const handleArchive = (id: string) => {
    console.log('Archive content:', id)
  }

  const handleView = (id: string) => {
    console.log('View content:', id)
  }

  const handleDuplicate = (id: string) => {
    console.log('Duplicate content:', id)
  }

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, id])
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id))
    }
  }

  const contentTypes = ['article', 'blog', 'social', 'video', 'podcast', 'newsletter', 'image', 'document', 'audio', 'rss'] as const

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Content Card System Showcase</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore the comprehensive Content Card System with enhanced components, advanced features, and flexible customization options.
        </p>
      </div>

      <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enhanced">Enhanced Cards</TabsTrigger>
          <TabsTrigger value="original">Original Cards</TabsTrigger>
          <TabsTrigger value="components">Individual Components</TabsTrigger>
          <TabsTrigger value="grid">Grid System</TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Enhanced Content Cards</h2>
            <p className="text-gray-600 mb-6">
              Advanced content cards with selection, expandable content, and enhanced actions.
            </p>
            {selectedItems.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  {selectedItems.length} item(s) selected: {selectedItems.join(', ')}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedItems([])}
                  className="mt-2"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleContent.map((item) => (
              <EnhancedContentCard
                key={item.id}
                {...item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onApprove={handleApprove}
                onPublish={handlePublish}
                onArchive={handleArchive}
                onView={handleView}
                onDuplicate={handleDuplicate}
                isSelected={selectedItems.includes(item.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="original" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Original Content Cards</h2>
            <p className="text-gray-600 mb-6">
              The original content card implementation with standard features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleContent.slice(0, 3).map((item) => (
              <ContentCard
                key={item.id}
                {...item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onApprove={handleApprove}
                onPublish={handlePublish}
                onArchive={handleArchive}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Individual Components</h2>
            <p className="text-gray-600 mb-6">
              Explore the individual components that make up the Content Card System.
            </p>
          </div>

          {/* Content Type Badges */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Content Type Badges</h3>
              <p className="text-gray-600">Color-coded badges for different content types</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {contentTypes.map((type) => (
                  <ContentTypeBadge key={type} contentType={type} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Card Header */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Content Card Header</h3>
              <p className="text-gray-600">Header component with metadata and status indicators</p>
            </CardHeader>
            <CardContent>
              <ContentCardHeader
                title="Sample Article Title"
                description="This is a sample description for the content card header component."
                status="published"
                contentType="article"
                author="John Doe"
                createdAt={new Date()}
                updatedAt={new Date()}
                estimatedReadTime={5}
              />
            </CardContent>
          </Card>

          {/* Content Card Body */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Content Card Body</h3>
              <p className="text-gray-600">Body component with expandable content and tags</p>
            </CardHeader>
            <CardContent>
              <ContentCardBody
                content="This is a sample content that demonstrates the expandable functionality of the ContentCardBody component. It can handle long text content and provides a 'Show More' button when the content exceeds a certain length."
                tags={['Sample', 'Component', 'Demo', 'Content']}
                priority="high"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grid" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Content Card Grid System</h2>
            <p className="text-gray-600 mb-6">
              Advanced grid system with filtering, sorting, and bulk operations.
            </p>
          </div>

          <ContentCardGrid
            content={sampleContent}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onPublish={handlePublish}
            onArchive={handleArchive}
          />
        </TabsContent>
      </Tabs>

      {/* Features Overview */}
      <Card className="mt-12">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Content Card System Features</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">🎨 Enhanced Design</h3>
              <p className="text-sm text-gray-600">
                Modern, responsive design with hover effects, smooth transitions, and consistent styling.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🔧 Flexible Components</h3>
              <p className="text-sm text-gray-600">
                Modular components that can be used independently or combined for custom layouts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📱 Responsive Layout</h3>
              <p className="text-sm text-gray-600">
                Adapts seamlessly to different screen sizes with proper breakpoints and spacing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">⚡ Performance Optimized</h3>
              <p className="text-sm text-gray-600">
                Efficient rendering with proper memoization and optimized re-renders.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">♿ Accessibility</h3>
              <p className="text-sm text-gray-600">
                WCAG compliant with proper ARIA labels, keyboard navigation, and screen reader support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🎯 Type Safe</h3>
              <p className="text-sm text-gray-600">
                Full TypeScript support with comprehensive type definitions and interfaces.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}