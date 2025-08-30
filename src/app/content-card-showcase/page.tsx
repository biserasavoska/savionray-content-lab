'use client'

import React, { useState } from 'react'
import { PageLayout, PageHeader, PageContent, PageSection } from '@/components/ui/common/PageLayout'
import { Button } from '@/components/ui/common/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/common/Tabs'
import { 
  ContentCard, 
  ContentCardGrid, 
  ContentCardSkeleton, 
  ContentCardActions,
  ContentCardProps 
} from '@/components/ui/content'

// Sample content data for demonstration
const sampleContent: ContentCardProps[] = [
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
  {
    id: '3',
    title: 'Social Media Marketing Strategies',
    description: 'Effective strategies for building brand presence and engaging audiences across social media platforms.',
    content: 'Social media marketing requires a strategic approach that goes beyond simply posting content...',
    status: 'draft',
    contentType: 'social',
    author: 'Mike Johnson',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    tags: ['Marketing', 'Social Media', 'Branding', 'Strategy'],
    priority: 'medium',
    estimatedReadTime: 6,
  },
  {
    id: '4',
    title: 'Video Production Best Practices',
    description: 'Essential tips and techniques for creating high-quality video content that engages and converts.',
    content: 'Video content has become the most engaging form of media on the internet...',
    status: 'approved',
    contentType: 'video',
    author: 'Sarah Wilson',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-17'),
    tags: ['Video', 'Production', 'Content Creation', 'Best Practices'],
    priority: 'high',
    estimatedReadTime: 15,
  },
  {
    id: '5',
    title: 'Podcast Content Planning',
    description: 'How to plan, structure, and produce compelling podcast episodes that keep listeners coming back.',
    content: 'Creating a successful podcast requires careful planning and consistent execution...',
    status: 'published',
    contentType: 'podcast',
    author: 'David Brown',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-15'),
    tags: ['Podcast', 'Planning', 'Audio', 'Content Strategy'],
    priority: 'medium',
    estimatedReadTime: 10,
  },
  {
    id: '6',
    title: 'Newsletter Engagement Tactics',
    description: 'Proven strategies for building an engaged email newsletter audience and driving conversions.',
    content: 'Email newsletters remain one of the most effective marketing channels...',
    status: 'archived',
    contentType: 'newsletter',
    author: 'Lisa Chen',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-13'),
    tags: ['Email', 'Newsletter', 'Engagement', 'Marketing'],
    priority: 'low',
    estimatedReadTime: 7,
  },
]

export default function ContentCardShowcase() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [currentView, setCurrentView] = useState<'showcase' | 'grid' | 'skeleton'>('showcase')

  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleBulkAction = (action: string, itemIds: string[]) => {
    console.log(`Bulk action: ${action} on items:`, itemIds)
    // In a real app, this would call an API
    alert(`Bulk action "${action}" applied to ${itemIds.length} items`)
    setSelectedItems([])
  }

  const handleSelectAll = () => {
    setSelectedItems(sampleContent.map(item => item.id))
  }

  const handleClearSelection = () => {
    setSelectedItems([])
  }

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
    <PageLayout>
      <PageHeader
        title="Content Card System Showcase"
        description="Demonstrating the comprehensive content card system with all features and capabilities"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Showcase', href: '/ui-showcase' },
          { label: 'Content Cards', href: '/content-card-showcase' },
        ]}
      >
        <div className="flex gap-2">
          <Button
            variant={currentView === 'showcase' ? 'default' : 'outline'}
            onClick={() => setCurrentView('showcase')}
          >
            Individual Cards
          </Button>
          <Button
            variant={currentView === 'grid' ? 'default' : 'outline'}
            onClick={() => setCurrentView('grid')}
          >
            Grid System
          </Button>
          <Button
            variant={currentView === 'skeleton' ? 'default' : 'outline'}
            onClick={() => setCurrentView('skeleton')}
          >
            Loading States
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PageSection>
              <div className="prose max-w-none">
                <h3>Content Card System Overview</h3>
                <p>
                  The Content Card System provides a comprehensive solution for displaying and managing content items
                  in a user-friendly interface. It includes individual cards, grid layouts, bulk actions, and loading states.
                </p>
                
                <h4>Key Components:</h4>
                <ul>
                  <li><strong>ContentCard:</strong> Individual content item display with status-based actions</li>
                  <li><strong>ContentCardGrid:</strong> Responsive grid layout with filtering and sorting</li>
                  <li><strong>ContentCardActions:</strong> Bulk action toolbar for managing multiple items</li>
                  <li><strong>ContentCardSkeleton:</strong> Loading placeholders for better UX</li>
                </ul>
              </div>
            </PageSection>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <PageSection>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Card Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Status-based action buttons</li>
                    <li>• Priority and content type badges</li>
                    <li>• Tag management with overflow handling</li>
                    <li>• Responsive design for all screen sizes</li>
                    <li>• Hover states and smooth transitions</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Grid Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Advanced filtering by status, type, priority</li>
                    <li>• Multiple sorting options</li>
                    <li>• Search functionality across all fields</li>
                    <li>• Grid and list view modes</li>
                    <li>• Real-time result counting</li>
                  </ul>
                </div>
              </div>
            </PageSection>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <PageSection>
              <div className="prose max-w-none">
                <h3>Usage Examples</h3>
                <p>Here are some common usage patterns for the Content Card System:</p>
                
                <h4>Basic Card Usage:</h4>
                <pre className="bg-gray-100 p-4 rounded text-sm">
{`<ContentCard
  id="1"
  title="Sample Content"
  status="draft"
  contentType="article"
  createdAt={new Date()}
  updatedAt={new Date()}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>`}
                </pre>
                
                <h4>Grid with Actions:</h4>
                <pre className="bg-gray-100 p-4 rounded text-sm">
{`<ContentCardGrid
  content={contentItems}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onApprove={handleApprove}
  onPublish={handlePublish}
/>`}
                </pre>
              </div>
            </PageSection>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            {currentView === 'showcase' && (
              <PageSection>
                <h3 className="text-xl font-semibold mb-6">Individual Content Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sampleContent.map((item) => (
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
              </PageSection>
            )}

            {currentView === 'grid' && (
              <PageSection>
                <h3 className="text-xl font-semibold mb-6">Content Grid System</h3>
                
                {/* Bulk Actions Toolbar */}
                {selectedItems.length > 0 && (
                  <ContentCardActions
                    selectedItems={selectedItems}
                    onBulkAction={handleBulkAction}
                    onSelectAll={handleSelectAll}
                    onClearSelection={handleClearSelection}
                    totalItems={sampleContent.length}
                    className="mb-6"
                  />
                )}
                
                {/* Grid with Selection */}
                <ContentCardGrid
                  content={sampleContent}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onApprove={handleApprove}
                  onPublish={handlePublish}
                  onArchive={handleArchive}
                />
              </PageSection>
            )}

            {currentView === 'skeleton' && (
              <PageSection>
                <h3 className="text-xl font-semibold mb-6">Loading States (Skeletons)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ContentCardSkeleton key={index} />
                  ))}
                </div>
              </PageSection>
            )}
          </PageSection>
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
