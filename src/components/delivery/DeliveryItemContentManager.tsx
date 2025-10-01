'use client'

import { useState } from 'react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/common/Button'
import ContentAssignmentModal from './ContentAssignmentModal'

interface Idea {
  id: string
  title: string
  description: string
  status: string
  contentType: string
  publishingDateTime: string | null
  User: {
    id: string
    name: string | null
    email: string | null
  }
}

interface ContentDeliveryItem {
  id: string
  contentType: string
  quantity: number
  dueDate: Date | string
  status: string
  priority: number
  notes?: string | null
  Idea?: Idea[]
}

interface ContentDeliveryPlan {
  id: string
  name: string
  targetMonth: Date | string
  startDate: Date | string
  endDate: Date | string
}

interface DeliveryItemContentManagerProps {
  deliveryItem: ContentDeliveryItem
  plan: ContentDeliveryPlan
  onAssignmentChange?: () => void
}

export default function DeliveryItemContentManager({
  deliveryItem,
  plan,
  onAssignmentChange,
}: DeliveryItemContentManagerProps) {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [unassigning, setUnassigning] = useState<string | null>(null)

  const assignedIdeas = deliveryItem.Idea || []
  const assignedCount = assignedIdeas.length
  const totalQuantity = deliveryItem.quantity

  const handleUnassign = async (ideaId: string) => {
    if (!confirm('Are you sure you want to remove this idea from the delivery plan?')) {
      return
    }

    setUnassigning(ideaId)
    try {
      const response = await fetch(
        `/api/delivery-items/${deliveryItem.id}/unassign/${ideaId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to unassign idea')
      }

      // Call the callback to refresh the parent component
      if (onAssignmentChange) {
        onAssignmentChange()
      }
    } catch (error) {
      console.error('Error unassigning idea:', error)
      alert('Failed to unassign idea. Please try again.')
    } finally {
      setUnassigning(null)
    }
  }

  const handleAssignSuccess = () => {
    setShowAssignModal(false)
    if (onAssignmentChange) {
      onAssignmentChange()
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            {deliveryItem.contentType.replace(/_/g, ' ')}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {assignedCount}/{totalQuantity} assigned
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAssignModal(true)}
          disabled={assignedCount >= totalQuantity}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Assign Content
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(assignedCount / totalQuantity) * 100}%` }}
          />
        </div>
      </div>

      {/* Assigned Ideas List */}
      {assignedIdeas.length > 0 ? (
        <div className="space-y-2">
          {assignedIdeas.map((idea) => (
            <div
              key={idea.id}
              className="flex items-start justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {idea.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {idea.publishingDateTime
                    ? new Date(idea.publishingDateTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'No date set'}
                  {' • '}
                  {idea.User.name || idea.User.email}
                </p>
              </div>
              <button
                onClick={() => handleUnassign(idea.id)}
                disabled={unassigning === idea.id}
                className="ml-2 p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                title="Unassign idea"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-md border border-dashed border-gray-300">
          No content assigned yet
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <ContentAssignmentModal
          deliveryItem={deliveryItem}
          plan={plan}
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onAssignSuccess={handleAssignSuccess}
        />
      )}
    </div>
  )
}

