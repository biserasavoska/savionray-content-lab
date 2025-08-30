'use client'

import React, { useState } from 'react'
import {
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  Radio,
  Switch,
  StatusBadge,
  PageLayout,
  PageHeader,
  PageContent,
  PageSection,
  Breadcrumbs,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  LoadingSpinner,
  ErrorDisplay
} from '@/components/ui/common'

export default function UIShowcasePage() {
  const [activeTab, setActiveTab] = useState('buttons')
  const [formData, setFormData] = useState({
    input: '',
    select: '',
    textarea: '',
    checkbox: false,
    radio: '',
    switch: false
  })

  const breadcrumbItems = [
    { href: '/', children: 'Home' },
    { href: '/ui-showcase', children: 'UI Showcase' }
  ]

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ]

  const radioOptions = [
    { value: 'radio1', label: 'Radio 1' },
    { value: 'radio2', label: 'Radio 2' },
    { value: 'radio3', label: 'Radio 3' }
  ]

  return (
    <PageLayout>
      <PageHeader
        title="UI Component Showcase"
        subtitle="Demonstrating all standardized UI components"
        breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
      />

      <PageContent>
        {/* Navigation to Advanced Components */}
        <PageSection title="Advanced Component Systems" className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Content Card System</h3>
            <p className="text-blue-800 mb-4">
              A comprehensive content management system with cards, grids, bulk actions, and advanced filtering.
            </p>
            <Button asChild>
              <a href="/content-card-showcase">View Content Card Showcase →</a>
            </Button>
          </div>
        </PageSection>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="forms">Form Fields</TabsTrigger>
            <TabsTrigger value="status">Status & Badges</TabsTrigger>
            <TabsTrigger value="layout">Page Layout</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="tabs">Tabs</TabsTrigger>
            <TabsTrigger value="utilities">Utilities</TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="space-y-6">
            <PageSection title="Button Variants">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">🚀</Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </PageSection>
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            <PageSection title="Form Fields">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Text Input"
                  placeholder="Enter text here"
                  helperText="This is helper text"
                />
                
                                 <Select
                   label="Select Option"
                   options={selectOptions}
                 />
                
                <Textarea
                  label="Textarea"
                  placeholder="Enter longer text here"
                  rows={4}
                />
                
                <div className="space-y-4">
                  <Checkbox
                    label="Checkbox option"
                    helperText="This is a checkbox"
                  />
                  
                  <Radio
                    label="Radio Group"
                    options={radioOptions}
                    helperText="Choose one option"
                  />
                  
                  <Switch
                    label="Toggle switch"
                    helperText="This is a switch component"
                  />
                </div>
              </div>
            </PageSection>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <PageSection title="Status Badges">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Status Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="draft" />
                    <StatusBadge status="review" />
                    <StatusBadge status="approved" />
                    <StatusBadge status="published" />
                    <StatusBadge status="rejected" />
                    <StatusBadge status="archived" />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Badge Variants</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </div>
              </div>
            </PageSection>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <PageSection 
              title="Page Layout Components"
              subtitle="These components provide consistent page structure"
            >
              <div className="space-y-4">
                <p className="text-gray-600">
                  This page demonstrates the PageLayout system. The PageLayout component wraps the entire page,
                  PageHeader provides the title and breadcrumbs, PageContent wraps the main content,
                  and PageSection provides consistent section containers.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Layout Structure:</h4>
                  <code className="text-sm text-gray-700">
                    PageLayout → PageHeader → PageContent → PageSection
                  </code>
                </div>
              </div>
            </PageSection>
          </TabsContent>

          <TabsContent value="cards" className="space-y-6">
            <PageSection title="Card Components">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Card Title</h3>
                    <p className="text-gray-600">Card subtitle or description</p>
                  </CardHeader>
                  <CardContent>
                    <p>This is the main content of the card.</p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">Action</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Simple Card</h3>
                    <p className="text-gray-600">A card with just content and no header/footer.</p>
                  </CardContent>
                </Card>
              </div>
            </PageSection>
          </TabsContent>

          <TabsContent value="tabs" className="space-y-6">
            <PageSection title="Tabs Component">
              <div className="space-y-4">
                <p className="text-gray-600">
                  This page itself uses the Tabs component to organize different component showcases.
                </p>
                
                <div className="border rounded-lg p-4">
                  <Tabs value="demo" onValueChange={() => {}}>
                    <TabsList>
                      <TabsTrigger value="demo">Demo Tab</TabsTrigger>
                    </TabsList>
                    <TabsContent value="demo">
                      <p>This is a demo tab content area.</p>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </PageSection>
          </TabsContent>

          <TabsContent value="utilities" className="space-y-6">
            <PageSection title="Utility Components">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Loading Spinner</h4>
                  <div className="flex items-center gap-4">
                    <LoadingSpinner size="sm" />
                    <LoadingSpinner size="md" />
                    <LoadingSpinner size="lg" />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Error Display</h4>
                  <ErrorDisplay
                    title="Sample Error"
                    message="This is a sample error message to demonstrate the ErrorDisplay component."
                    onRetry={() => alert('Retry clicked!')}
                  />
                </div>
              </div>
            </PageSection>
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageLayout>
  )
}
