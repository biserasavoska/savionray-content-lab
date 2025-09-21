'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Input, Textarea, Select } from '@/components/ui/common/FormField'
import Button from '@/components/ui/common/Button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/common/Card'
import { useFormData } from '@/components/ui/common/hooks'

const ContentType = {
  NEWSLETTER: 'NEWSLETTER',
  BLOG_POST: 'BLOG_POST',
  SOCIAL_MEDIA_POST: 'SOCIAL_MEDIA_POST',
  WEBSITE_COPY: 'WEBSITE_COPY',
  EMAIL_CAMPAIGN: 'EMAIL_CAMPAIGN',
} as const

type ContentType = typeof ContentType[keyof typeof ContentType]

interface DeliveryItem {
  id?: string
  contentType: ContentType
  quantity: number
  dueDate: string
  priority: number
  notes?: string
}

interface DeliveryPlan {
  id: string
  name: string
  description?: string | null
  startDate: string
  endDate: string
  status: string
  createdAt: string
  updatedAt: string
  clientId: string
  targetMonth: string
  isArchived: boolean
  organizationId: string
  client: {
    name?: string | null
    email?: string | null
  }
  items: DeliveryItem[]
  organization: {
    name: string
    primaryColor: string | null
  }
}

interface FormData {
  name: string
  description: string
  startDate: string
  endDate: string
  targetMonth: string
  organizationId: string
  items: DeliveryItem[]
}

interface DeliveryPlanEditFormProps {
  plan: DeliveryPlan
}

export default function DeliveryPlanEditForm({ plan }: DeliveryPlanEditFormProps) {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([])

  const { formData, updateFormData, errors, loading, handleSubmit } = useFormData({
    initialData: {
      name: plan.name,
      description: plan.description || '',
      startDate: new Date(plan.startDate).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
      endDate: new Date(plan.endDate).toISOString().split('T')[0],
      targetMonth: new Date(plan.targetMonth).toISOString().substring(0, 7), // Convert to YYYY-MM format
      organizationId: plan.organizationId,
      items: plan.items.map(item => ({
        id: item.id,
        contentType: item.contentType,
        quantity: item.quantity,
        dueDate: new Date(item.dueDate).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        priority: item.priority,
        notes: item.notes || ''
      })),
    },
    onValidate: (data) => {
      const validationErrors: Record<string, string> = {}
      
      if (!data.name.trim()) {
        validationErrors.name = 'Plan name is required'
      }
      
      if (!data.targetMonth) {
        validationErrors.targetMonth = 'Target month is required'
      }
      
      if (!data.organizationId) {
        validationErrors.organizationId = 'Organization is required'
      }
      
      if (!data.startDate) {
        validationErrors.startDate = 'Start date is required'
      }
      
      if (!data.endDate) {
        validationErrors.endDate = 'End date is required'
      }
      
      if (data.items.length === 0) {
        validationErrors.items = 'At least one delivery item is required'
      }
      
      return Object.keys(validationErrors).length > 0 ? validationErrors : null
    },
    onSubmit: async (data) => {
      // Clean the data to remove any circular references
      const cleanData = {
        ...data,
        items: data.items.map(item => ({
          id: item.id,
          contentType: item.contentType,
          quantity: item.quantity,
          dueDate: item.dueDate,
          priority: item.priority,
          notes: item.notes
        }))
      }
      
      const response = await fetch(`/api/delivery-plans/${plan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update delivery plan: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      router.push(`/delivery-plans/${plan.id}`)
    }
  })

  const addItem = () => {
    const newItems = [
      ...formData.items,
      {
        contentType: ContentType.BLOG_POST,
        quantity: 1,
        dueDate: '',
        priority: formData.items.length + 1,
      },
    ]
    updateFormData('items', newItems)
  }

  const updateItem = (index: number, field: keyof DeliveryItem, value: any) => {
    // Ensure we only store primitive values
    let cleanValue = value
    if (value && typeof value === 'object' && value.value) {
      cleanValue = value.value
    }
    
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      [field]: cleanValue,
    }
    updateFormData('items', newItems)
  }

  const handleSelectChange = (index: number, field: keyof DeliveryItem, event: React.ChangeEvent<HTMLSelectElement>) => {
    updateItem(index, field, event.target.value)
  }

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    updateFormData('items', newItems)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e)
  }

  // Fetch organizations on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/admin/organizations/options')
        if (response.ok) {
          const data = await response.json()
          setOrganizations(data.organizations || [])
        }
      } catch (error) {
        console.error('Error fetching organizations:', error)
      }
    }
    
    fetchOrganizations()
  }, [])

  return (
    <Card>
      <form onSubmit={handleFormSubmit}>
        <CardHeader>
          <h2 className="text-xl font-semibold">Edit Delivery Plan</h2>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Plan Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="Enter plan name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              rows={3}
              placeholder="Describe the plan"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 mb-2">
              Organization <span className="text-red-500">*</span>
            </label>
            <Select
              id="organizationId"
              options={organizations.map(org => ({ value: org.id, label: org.name }))}
              value={formData.organizationId}
              onChange={(e) => updateFormData('organizationId', e.target.value)}
            />
            {errors.organizationId && (
              <p className="mt-1 text-sm text-red-600">{errors.organizationId}</p>
            )}
          </div>

          <div>
            <label htmlFor="targetMonth" className="block text-sm font-medium text-gray-700 mb-2">
              Target Month <span className="text-red-500">*</span>
            </label>
            <Input
              id="targetMonth"
              type="month"
              value={formData.targetMonth}
              onChange={(e) => updateFormData('targetMonth', e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">
              Select the month this content is intended for
            </p>
            {errors.targetMonth && (
              <p className="mt-1 text-sm text-red-600">{errors.targetMonth}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Content Delivery Start <span className="text-red-500">*</span>
              </label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData('startDate', e.target.value)}
              />
              <p className="mt-1 text-sm text-gray-500">
                Usually 5-10 days before the first item is published
              </p>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Content Delivery End <span className="text-red-500">*</span>
              </label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData('endDate', e.target.value)}
              />
              <p className="mt-1 text-sm text-gray-500">
                When all content for the month should be delivered
              </p>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Delivery Items</h3>
            <Button
              type="button"
              size="sm"
              onClick={addItem}
            >
              Add Item
            </Button>
          </div>

          {errors.items && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{errors.items}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <Card key={index} className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Item {index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id={`contentType-${index}`}
                      options={Object.values(ContentType).map((type) => ({ value: type, label: type.replace(/_/g, ' ') }))}
                      value={item.contentType}
                      onChange={(event) => handleSelectChange(index, 'contentType', event)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id={`dueDate-${index}`}
                      type="date"
                      value={item.dueDate}
                      onChange={(e) => updateItem(index, 'dueDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id={`priority-${index}`}
                      type="number"
                      min="1"
                      value={item.priority}
                      onChange={(e) => updateItem(index, 'priority', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <Textarea
                    id={`notes-${index}`}
                    value={item.notes || ''}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                    rows={2}
                  />
                </div>
              </Card>
            ))}
            {formData.items.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No items yet. Click "Add Item" to create your first delivery item.
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex justify-end space-x-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/delivery-plans/${plan.id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={formData.items.length === 0}
            >
              Update Plan
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
