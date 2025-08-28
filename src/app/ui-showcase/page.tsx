'use client'

import React, { useState } from 'react'
import { 
  PageLayout, 
  PageHeader, 
  PageContent, 
  PageSection,
  Breadcrumbs,
  BreadcrumbItem
} from '@/components/ui/layout/PageLayout'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'
import StatusBadge from '@/components/ui/common/StatusBadge'
import { 
  FormField, 
  Input, 
  Select, 
  Textarea, 
  Checkbox, 
  Radio, 
  Switch 
} from '@/components/ui/common/FormField'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle 
} from '@/components/ui/common/Card'

export default function UIShowcasePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
    newsletter: false,
    notifications: 'email',
    darkMode: false
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'other', label: 'Other' }
  ]

  const breadcrumbItems = [
    { href: '/', children: 'Home' },
    { href: '/ui-showcase', children: 'UI Showcase', isActive: true }
  ]

  return (
    <PageLayout size="large">
      <PageHeader
        title="UI Component Showcase"
        description="Demonstrating all the new standardized UI components for consistent design across the app."
        breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
        actions={
          <div className="flex items-center space-x-3">
            <a 
              href="/ui-comparison" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
            >
              View Before/After Comparison →
            </a>
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </div>
        }
      />

      <PageContent>
        {/* Button Showcase */}
        <PageSection title="Button Components" description="All available button variants and sizes">
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Button Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="info">Info</Button>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Button States</h3>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button fullWidth>Full Width</Button>
              </div>
            </div>
          </div>
        </PageSection>

        {/* Badge Showcase */}
        <PageSection title="Badge Components" description="Status badges and informational badges">
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Status Badges</h3>
              <div className="flex flex-wrap gap-3">
                <StatusBadge status="approved" />
                <StatusBadge status="pending" />
                <StatusBadge status="rejected" />
                <StatusBadge status="in_progress" />
                <StatusBadge status="scheduled" />
                <StatusBadge status="archived" />
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Status Badge Variants</h3>
              <div className="flex flex-wrap gap-3">
                <StatusBadge status="approved" variant="rounded" />
                <StatusBadge status="pending" variant="outlined" />
                <StatusBadge status="rejected" variant="default" />
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Regular Badges</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>
          </div>
        </PageSection>

        {/* Form Components Showcase */}
        <PageSection title="Form Components" description="All form field components with consistent styling">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your name"
                />
              </FormField>

              <FormField label="Email" required>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </FormField>

              <FormField label="Category">
                <Select
                  options={selectOptions}
                  value={formData.category}
                  onChange={(value) => handleInputChange('category', value)}
                />
              </FormField>

              <FormField label="Dark Mode">
                <Switch
                  checked={formData.darkMode}
                  onChange={(e) => handleInputChange('darkMode', e.target.checked)}
                />
              </FormField>
            </div>

            <FormField label="Message" helperText="Tell us more about your inquiry">
              <Textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Enter your message here..."
                rows={4}
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Preferences">
                <div className="space-y-3">
                  <Checkbox
                    label="Subscribe to newsletter"
                    checked={formData.newsletter}
                    onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                  />
                </div>
              </FormField>

              <FormField label="Notification Method">
                <div className="space-y-2">
                  <Radio
                    label="Email"
                    name="notifications"
                    value="email"
                    checked={formData.notifications === 'email'}
                    onChange={(e) => handleInputChange('notifications', e.target.value)}
                  />
                  <Radio
                    label="SMS"
                    name="notifications"
                    value="sms"
                    checked={formData.notifications === 'sms'}
                    onChange={(e) => handleInputChange('notifications', e.target.value)}
                  />
                </div>
              </FormField>
            </div>
          </div>
        </PageSection>

        {/* Card Showcase */}
        <PageSection title="Card Components" description="Different card layouts and configurations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This is a basic card with header, content, and footer.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated" hover>
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This card has elevation and hover effects.</p>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Outlined Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This card has an outlined style.</p>
              </CardContent>
            </Card>
          </div>
        </PageSection>

        {/* Layout Showcase */}
        <PageSection title="Layout Components" description="Page layout and structure components">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-md font-medium text-blue-900 mb-2">Layout Information</h3>
              <p className="text-blue-800 text-sm">
                This page demonstrates the new PageLayout, PageHeader, PageContent, and PageSection components.
                These components provide consistent spacing, typography, and structure across all pages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">PageLayout Sizes</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• small: max-w-3xl</li>
                  <li>• medium: max-w-4xl</li>
                  <li>• large: max-w-6xl</li>
                  <li>• full: max-w-7xl</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Component Benefits</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Consistent spacing</li>
                  <li>• Standardized typography</li>
                  <li>• Reusable patterns</li>
                  <li>• Easy maintenance</li>
                </ul>
              </div>
            </div>
          </div>
        </PageSection>
      </PageContent>
    </PageLayout>
  )
}
