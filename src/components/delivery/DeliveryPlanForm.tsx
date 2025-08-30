'use client'

import { useState } from 'react'
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
  contentType: ContentType
  quantity: number
  dueDate: string
  priority: number
  notes?: string
}

interface FormData {
  name: string
  description: string
  startDate: string
  endDate: string
  targetMonth: string
  items: DeliveryItem[]
}

export default function DeliveryPlanForm() {
  const router = useRouter()
  const [items, setItems] = useState<DeliveryItem[]>([])

  // Use the new form hook
  const { formData, updateFormData, errors, loading, handleSubmit } = useFormData({
    initialData: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      targetMonth: '',
      items: [],
    },
    onValidate: (data) => {
      const validationErrors: Record<string, string> = {}
      
      if (!data.name.trim()) {
        validationErrors.name = 'Plan name is required'
      }
      
      if (!data.targetMonth) {
        validationErrors.targetMonth = 'Target month is required'
      }
      
      if (!data.startDate) {
        validationErrors.startDate = 'Start date is required'
      }
      
      if (!data.endDate) {
        validationErrors.endDate = 'End date is required'
      }
      
      if (items.length === 0) {
        validationErrors.items = 'At least one delivery item is required'
      }
      
      return Object.keys(validationErrors).length > 0 ? validationErrors : null
    },
    onSubmit: async (data) => {
      const response = await fetch('/api/delivery-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          items,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create delivery plan')
      }

      const result = await response.json()
      router.push(`/delivery-plans/${result.id}`)
    }
  })

  const addItem = () => {
    setItems([
      ...items,
      {
        contentType: ContentType.BLOG_POST,
        quantity: 1,
        dueDate: '',
        priority: items.length + 1,
      },
    ])
  }

  const updateItem = (index: number, field: keyof DeliveryItem, value: any) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <h2 className="text-xl font-semibold">Create Delivery Plan</h2>
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
            {items.map((item, index) => (
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
                      options={Object.values(ContentType).map((type) => ({ value: type, label: type.replace(/_/g, ' ') }))}
                      value={item.contentType}
                      onChange={(value) => updateItem(index, 'contentType', value as unknown as ContentType)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <Input
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
                    value={item.notes || ''}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                    rows={2}
                  />
                </div>
              </Card>
            ))}
            {items.length === 0 && (
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
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={items.length === 0}
            >
              Create Plan
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
} 