'use client'

import React from 'react'

import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/layout/Card'
import FormField, { Input, Textarea, Select, Checkbox, RadioGroup } from '@/components/ui/forms/FormField'
import Badge from '@/components/ui/common/Badge'
import Button from '@/components/ui/common/Button'
import { useFormData } from '@/hooks/useFormData'
import { useApiData } from '@/hooks/useApiData'
import { cn } from '@/lib/utils/cn'

export default function TestComponentsPage() {
  // Test form data hook
  const form = useFormData({
    initialValues: {
      name: '',
      email: '',
      message: '',
      category: 'general',
      notifications: false,
      priority: 'medium'
    },
    validation: {
      name: (value) => !value.trim() ? 'Name is required' : undefined,
      email: (value) => !value.includes('@') ? 'Valid email required' : undefined,
      message: (value) => value.length < 10 ? 'Message must be at least 10 characters' : undefined
    },
    onSubmit: async (values) => {
      console.log('Form submitted:', values)
      alert('Form submitted successfully!')
    }
  })

  // Test API data hook
  const [healthData] = useApiData<{status: string; service: string; timestamp: string}>('/api/health', {
    retryCount: 2,
    onSuccess: (data) => console.log('Health check successful:', data)
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Component Test Page</h1>
        
        {/* Card Components Test */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Card Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This is a default card with some content.</p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This card has elevated styling.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Secondary</Button>
              </CardFooter>
            </Card>

            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Bordered Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This card has a border.</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">Ghost</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Badge Components Test */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Badge Components</h2>
          <div className="flex flex-wrap gap-4">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </section>

        {/* Button Components Test */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Button Components</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
        </section>

        {/* Form Components Test */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Form Components</h2>
          <Card variant="default" className="max-w-2xl">
            <CardHeader>
              <CardTitle>Test Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); form.submit(); }} className="space-y-4">
                <FormField
                  label="Name"
                  error={form.errors.name}
                  required
                >
                  <Input
                    value={form.values.name}
                    onChange={(e) => form.setFieldValue('name', e.target.value)}
                    onBlur={() => form.setFieldTouched('name', true)}
                    placeholder="Enter your name"
                  />
                </FormField>

                <FormField
                  label="Email"
                  error={form.errors.email}
                  required
                >
                  <Input
                    type="email"
                    value={form.values.email}
                    onChange={(e) => form.setFieldValue('email', e.target.value)}
                    onBlur={() => form.setFieldTouched('email', true)}
                    placeholder="Enter your email"
                  />
                </FormField>

                <FormField
                  label="Category"
                  error={form.errors.category}
                >
                  <Select
                    options={[
                      { value: 'general', label: 'General' },
                      { value: 'support', label: 'Support' },
                      { value: 'feedback', label: 'Feedback' }
                    ]}
                    value={form.values.category}
                    onChange={(e) => form.setFieldValue('category', e.target.value)}
                    onBlur={() => form.setFieldTouched('category', true)}
                  />
                </FormField>

                <FormField
                  label="Message"
                  error={form.errors.message}
                  required
                >
                  <Textarea
                    value={form.values.message}
                    onChange={(e) => form.setFieldValue('message', e.target.value)}
                    onBlur={() => form.setFieldTouched('message', true)}
                    placeholder="Enter your message"
                    rows={4}
                  />
                </FormField>

                <FormField
                  label="Priority"
                  error={form.errors.priority}
                >
                  <RadioGroup
                    name="priority"
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' }
                    ]}
                    value={form.values.priority}
                    onChange={(value) => form.setFieldValue('priority', value)}
                  />
                </FormField>

                <FormField>
                  <Checkbox
                    checked={form.values.notifications}
                    onChange={(e) => form.setFieldValue('notifications', e.target.checked)}
                    label="Receive notifications"
                  />
                </FormField>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={form.isSubmitting}
                  >
                    {form.isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* API Data Hook Test */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">API Data Hook Test</h2>
          <Card variant="default">
            <CardHeader>
              <CardTitle>Health Check API</CardTitle>
            </CardHeader>
            <CardContent>
              {healthData.loading && (
                <p className="text-gray-600">Loading health data...</p>
              )}
              {healthData.error && (
                <p className="text-red-600">Error: {healthData.error}</p>
              )}
              {healthData.data && (
                <div className="space-y-2">
                  <p><strong>Status:</strong> {healthData.data.status}</p>
                  <p><strong>Service:</strong> {healthData.data.service}</p>
                  <p><strong>Timestamp:</strong> {healthData.data.timestamp}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Utility Functions Test */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Utility Functions</h2>
          <Card variant="default">
            <CardContent>
              <p className="text-gray-600">
                Class name merging test: 
                <span className={cn(
                  "ml-2 px-2 py-1 rounded",
                  "bg-blue-100 text-blue-800",
                  "hover:bg-blue-200"
                )}>
                  Merged Classes
                </span>
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
} 