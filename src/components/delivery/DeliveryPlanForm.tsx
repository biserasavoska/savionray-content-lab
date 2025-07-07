'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormField, { Input, Textarea, Select } from '@/components/ui/forms/FormField'
import Button from '@/components/ui/common/Button'
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/layout/Card'

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

export default function DeliveryPlanForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [items, setItems] = useState<DeliveryItem[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      targetMonth: formData.get('targetMonth'),
      items,
    }

    try {
      const response = await fetch('/api/delivery-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create delivery plan')
      }

      const result = await response.json()
      router.push(`/delivery-plans/${result.id}`)
    } catch (error) {
      console.error('Error creating delivery plan:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <CardTitle>Create Delivery Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <FormField label="Plan Name" required>
            <Input
              type="text"
              name="name"
              id="name"
              required
              placeholder="Enter plan name"
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              name="description"
              id="description"
              rows={3}
              placeholder="Describe the plan"
            />
          </FormField>

          <FormField label="Target Month" required>
            <Input
              type="month"
              name="targetMonth"
              id="targetMonth"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Select the month this content is intended for
            </p>
          </FormField>

          <div className="grid grid-cols-2 gap-6">
            <FormField label="Content Delivery Start" required>
              <Input
                type="date"
                name="startDate"
                id="startDate"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Usually 5-10 days before the first item is published
              </p>
            </FormField>
            <FormField label="Content Delivery End" required>
              <Input
                type="date"
                name="endDate"
                id="endDate"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                When all content for the month should be delivered
              </p>
            </FormField>
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

          <div className="space-y-4">
            {items.map((item, index) => (
              <Card key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Item {index + 1}</h4>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Content Type" required>
                    <Select
                      options={Object.values(ContentType).map((type) => ({ value: type, label: type.replace(/_/g, ' ') }))}
                      value={item.contentType}
                      onChange={(e) => updateItem(index, 'contentType', e.target.value as ContentType)}
                    />
                  </FormField>
                  <FormField label="Quantity" required>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    />
                  </FormField>
                  <FormField label="Due Date" required>
                    <Input
                      type="date"
                      value={item.dueDate}
                      onChange={(e) => updateItem(index, 'dueDate', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Priority" required>
                    <Input
                      type="number"
                      min="1"
                      value={item.priority}
                      onChange={(e) => updateItem(index, 'priority', parseInt(e.target.value))}
                    />
                  </FormField>
                </div>
                <FormField label="Notes">
                  <Textarea
                    value={item.notes}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                    rows={2}
                  />
                </FormField>
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
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? 'Creating...' : 'Create Plan'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
} 