'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Plan Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="targetMonth" className="block text-sm font-medium text-gray-700">
            Target Month
          </label>
          <input
            type="month"
            name="targetMonth"
            id="targetMonth"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            Select the month this content is intended for
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Content Delivery Start
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Usually 5-10 days before the first item is published
            </p>
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Content Delivery End
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              When all content for the month should be delivered
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Delivery Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Item {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content Type</label>
                  <select
                    value={item.contentType}
                    onChange={(e) => updateItem(index, 'contentType', e.target.value as ContentType)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  >
                    {Object.values(ContentType).map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={item.dueDate}
                    onChange={(e) => updateItem(index, 'dueDate', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <input
                    type="number"
                    min="1"
                    value={item.priority}
                    onChange={(e) => updateItem(index, 'priority', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={item.notes}
                  onChange={(e) => updateItem(index, 'notes', e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                />
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No items yet. Click "Add Item" to create your first delivery item.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Plan'}
        </button>
      </div>
    </form>
  )
} 