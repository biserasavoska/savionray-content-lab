'use client'

import React from 'react'
import { useApiData, usePaginatedData } from '@/hooks/useApiData'
import { useFormData } from '@/hooks/useFormData'
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/layout/Card'
import FormField, { Input, Textarea, Select } from '@/components/ui/forms/FormField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorDisplay from '@/components/ui/ErrorDisplay'
import Badge from '@/components/ui/common/Badge'
import Button from '@/components/ui/common/Button'
import { cn } from '@/lib/utils/cn'
import { ErrorType } from '@/lib/utils/error-handling'

// ============================================================================
// REFACTORED IDEA CARD EXAMPLE
// ============================================================================

interface Idea {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
  contentType: string
  mediaType: string
}

interface IdeaFormData {
  title: string
  description: string
  contentType: string
  mediaType: string
}

// ============================================================================
// IDEA CARD COMPONENT (REFACTORED)
// ============================================================================

export default function RefactoredIdeaCard({ ideaId }: { ideaId: string }) {
  // Use the new API data hook instead of manual useState + useEffect
  const [ideaData, { refetch, clearError }] = useApiData<Idea>(
    ideaId ? `/api/ideas/${ideaId}` : null,
    {
      retryCount: 3,
      onError: (error) => {
        console.error('Failed to load idea:', error)
      }
    }
  )

  // Use the new form data hook instead of manual form state management
  const form = useFormData<IdeaFormData>({
    initialValues: {
      title: '',
      description: '',
      contentType: 'NEWSLETTER',
      mediaType: 'PHOTO'
    },
    validation: {
      title: (value) => {
        if (!value.trim()) return 'Title is required'
        if (value.length < 3) return 'Title must be at least 3 characters'
        if (value.length > 100) return 'Title must be less than 100 characters'
        return undefined
      },
      description: (value) => {
        if (!value.trim()) return 'Description is required'
        if (value.length < 10) return 'Description must be at least 10 characters'
        if (value.length > 1000) return 'Description must be less than 1000 characters'
        return undefined
      }
    },
    onSubmit: async (values) => {
      // Handle form submission
      console.log('Submitting idea:', values)
    }
  })

  // ============================================================================
  // RENDER LOADING STATE
  // ============================================================================

  if (ideaData.loading) {
    return (
      <Card variant="elevated" className="animate-pulse">
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" text="Loading idea..." />
          </div>
        </CardContent>
      </Card>
    )
  }

  // ============================================================================
  // RENDER ERROR STATE
  // ============================================================================

  if (ideaData.error) {
    return (
      <Card variant="elevated">
        <CardContent>
          <ErrorDisplay
            error={{
              type: ErrorType.INTERNAL,
              message: ideaData.error,
              code: 'LOAD_ERROR'
            }}
            onRetry={refetch}
            onDismiss={clearError}
          />
        </CardContent>
      </Card>
    )
  }

  // ============================================================================
  // RENDER IDEA DATA
  // ============================================================================

  if (!ideaData.data) {
    return (
      <Card variant="elevated">
        <CardContent>
          <p className="text-gray-500 text-center py-8">No idea data available</p>
        </CardContent>
      </Card>
    )
  }

  const idea = ideaData.data

  return (
    <Card variant="elevated" className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle as="h3">{idea.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="info">{idea.status}</Badge>
            <Badge variant="success">{idea.contentType}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {idea.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Content Type</h4>
              <p className="text-sm text-gray-600">{idea.contentType}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Media Type</h4>
              <p className="text-sm text-gray-600">{idea.mediaType}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Created by {idea.createdBy.name}</span>
              <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          <div className="flex space-x-2">
            <Button variant="primary" size="sm">
              Edit
            </Button>
            <Button variant="danger" size="sm">
              Delete
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

// ============================================================================
// IDEA FORM COMPONENT (REFACTORED)
// ============================================================================

export function RefactoredIdeaForm({ onSubmit }: { onSubmit?: (data: IdeaFormData) => Promise<void> }): JSX.Element {
  const form = useFormData<IdeaFormData>({
    initialValues: {
      title: '',
      description: '',
      contentType: 'NEWSLETTER',
      mediaType: 'PHOTO'
    },
    validation: {
      title: (value) => {
        if (!value.trim()) return 'Title is required'
        if (value.length < 3) return 'Title must be at least 3 characters'
        if (value.length > 100) return 'Title must be less than 100 characters'
        return undefined
      },
      description: (value) => {
        if (!value.trim()) return 'Description is required'
        if (value.length < 10) return 'Description must be at least 10 characters'
        if (value.length > 1000) return 'Description must be less than 1000 characters'
        return undefined
      }
    },
    onSubmit: async (values) => {
      if (onSubmit) {
        await onSubmit(values)
      }
    }
  })

  const contentTypeOptions = [
    { value: 'NEWSLETTER', label: 'Newsletter' },
    { value: 'BLOG_POST', label: 'Blog Post' },
    { value: 'SOCIAL_MEDIA_POST', label: 'Social Media Post' },
    { value: 'WEBSITE_COPY', label: 'Website Copy' },
    { value: 'EMAIL_CAMPAIGN', label: 'Email Campaign' }
  ]

  const mediaTypeOptions = [
    { value: 'PHOTO', label: 'Photo' },
    { value: 'GRAPH_OR_INFOGRAPHIC', label: 'Graph or Infographic' },
    { value: 'VIDEO', label: 'Video' },
    { value: 'SOCIAL_CARD', label: 'Social Card' },
    { value: 'POLL', label: 'Poll' },
    { value: 'CAROUSEL', label: 'Carousel' }
  ]

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Create New Idea</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); form.submit() }} className="space-y-6">
          <FormField
            label="Title"
            required
            error={form.getFieldError('title')}
            helpText="Enter a descriptive title for your idea"
          >
            <Input
              value={form.values.title}
              onChange={(e) => form.setFieldValue('title', e.target.value)}
              onBlur={() => form.setFieldTouched('title', true)}
              placeholder="Enter idea title..."
              variant={form.getFieldError('title') ? 'error' : 'default'}
            />
          </FormField>

          <FormField
            label="Description"
            required
            error={form.getFieldError('description')}
            helpText="Provide a detailed description of your idea"
          >
            <Textarea
              value={form.values.description}
              onChange={(e) => form.setFieldValue('description', e.target.value)}
              onBlur={() => form.setFieldTouched('description', true)}
              placeholder="Describe your idea..."
              rows={4}
              showCharacterCount
              maxLength={1000}
              variant={form.getFieldError('description') ? 'error' : 'default'}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Content Type"
              required
              error={form.getFieldError('contentType')}
            >
              <Select
                options={contentTypeOptions}
                value={form.values.contentType}
                onChange={(e) => form.setFieldValue('contentType', e.target.value)}
                placeholder="Select content type..."
              />
            </FormField>

            <FormField
              label="Media Type"
              required
              error={form.getFieldError('mediaType')}
            >
              <Select
                options={mediaTypeOptions}
                value={form.values.mediaType}
                onChange={(e) => form.setFieldValue('mediaType', e.target.value)}
                placeholder="Select media type..."
              />
            </FormField>
          </div>
        </form>
      </CardContent>

      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            onClick={() => form.reset()}
            disabled={form.isSubmitting}
          >
            Reset
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => form.validate()}
              disabled={form.isSubmitting}
            >
              Validate
            </Button>
            
            <Button
              variant="primary"
              onClick={() => form.submit()}
              disabled={form.isSubmitting || !form.isValid}
            >
              {form.isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" variant="white" className="mr-2" />
                  Submitting...
                </>
              ) : (
                'Create Idea'
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

// ============================================================================
// IDEA LIST COMPONENT (REFACTORED)
// ============================================================================

export function RefactoredIdeaList(): JSX.Element {
  // Use paginated data hook for list management
  const [ideasData, { refetch, loadMore, goToPage, setLimit }] = usePaginatedData<Idea>(
    '/api/ideas',
    {
      retryCount: 2,
      onSuccess: (data) => {
        console.log('Ideas loaded successfully:', data)
      }
    }
  )

  if (ideasData.loading && !ideasData.data) {
    return (
      <Card variant="elevated">
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" text="Loading ideas..." />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (ideasData.error) {
    return (
      <Card variant="elevated">
        <CardContent>
          <ErrorDisplay
            error={{
              type: ErrorType.INTERNAL,
              message: ideasData.error,
              code: 'LOAD_ERROR'
            }}
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    )
  }

  if (!ideasData.data || ideasData.data.length === 0) {
    return (
      <Card variant="elevated">
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No ideas found</p>
            <Button variant="primary">Create Your First Idea</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ideas ({ideasData.data.length})</CardTitle>
            <Button variant="primary">Create New Idea</Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideasData.data.map((idea) => (
          <RefactoredIdeaCard key={idea.id} ideaId={idea.id} />
        ))}
      </div>

      {ideasData.loading && (
        <Card variant="elevated">
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="md" text="Loading more ideas..." />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 