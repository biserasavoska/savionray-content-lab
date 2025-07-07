'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { useState } from 'react'
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/layout/Card'
import Badge from '@/components/ui/common/Badge'
import Button from '@/components/ui/common/Button'

interface DeliveryPlansListProps {
  plans: Array<{
    id: string
    name: string
    description?: string | null
    startDate: string | Date
    endDate: string | Date
    status: string
    createdAt: string | Date
    updatedAt: string | Date
    clientId: string
    targetMonth: string | Date
    isArchived: boolean
    items: Array<{
      id: string
      contentType: string
      quantity: number
      dueDate: string | Date
      status: string
      priority: number
      notes?: string | null
      createdAt: string | Date
      updatedAt: string | Date
      planId: string
      ideas: Array<{
        contentDrafts: Array<{
          status: string
        }>
      }>
    }>
    client: {
      name: string | null
      email: string | null
    }
  }>
}

const STATUS_BADGE_VARIANT = {
  DRAFT: 'default',
  ACTIVE: 'success',
  COMPLETED: 'info',
  CANCELLED: 'error',
  ARCHIVED: 'warning',
} as const

const ITEM_STATUS_BADGE_VARIANT = {
  PENDING: 'default',
  IN_PROGRESS: 'warning',
  REVIEW: 'info',
  APPROVED: 'success',
  DELIVERED: 'info',
} as const

export default function DeliveryPlansList({ plans }: DeliveryPlansListProps) {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const months = Array.from(
    new Set(
      plans.map((plan) => format(new Date(plan.targetMonth), 'MMMM yyyy'))
    )
  ).sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateB.getTime() - dateA.getTime()
  })

  const handleMonthChange = (month: string) => {
    if (month === '') {
      setSelectedMonth(null)
    } else {
      setSelectedMonth(new Date(month))
    }
  }

  const handlePlanClick = (planId: string) => {
    router.push(`/delivery-plans/${planId}`)
  }

  const handleArchiveToggle = async (planId: string, isArchived: boolean) => {
    try {
      const response = await fetch(`/api/delivery-plans/${planId}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived }),
      })

      if (!response.ok) {
        throw new Error('Failed to update plan status')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error updating plan status:', error)
    }
  }

  const filteredPlans = plans.filter(plan => {
    if (!showArchived && plan.isArchived) {
      return false
    }
    if (selectedMonth) {
      return format(new Date(plan.targetMonth), 'MMMM yyyy') === format(selectedMonth, 'MMMM yyyy')
    }
    return true
  })

  if (filteredPlans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No delivery plans found.</p>
        <button
          onClick={() => router.push('/delivery-plans/new')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          Create New Plan
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            onChange={(e) => handleMonthChange(e.target.value)}
            value={selectedMonth ? format(selectedMonth, 'MMMM yyyy') : ''}
          >
            <option value="">All Months</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Show Archived</span>
          </label>
        </div>
      </div>

      <div className="space-y-6">
        {filteredPlans.map((plan) => {
          const badgeVariant = STATUS_BADGE_VARIANT[plan.status as keyof typeof STATUS_BADGE_VARIANT] || 'default'
          const totalItems = plan.items.length
          const completedItems = plan.items.filter(
            (item) => item.status === 'DELIVERED'
          ).length
          const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

          return (
            <Card key={plan.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle as="h3" className="text-lg">{plan.name}</CardTitle>
                    <p className="mt-1 text-sm text-gray-500">
                      {plan.client.name || plan.client.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={badgeVariant}>{plan.status}</Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArchiveToggle(plan.id, !plan.isArchived)
                      }}
                      className={plan.isArchived ? 'bg-yellow-100' : 'bg-gray-100'}
                    >
                      {plan.isArchived ? 'Unarchive' : 'Archive'}
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Progress ({completedItems}/{totalItems} items)</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="mt-1 relative">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <div className="flex space-x-4">
                    <span>
                      Target Month: {format(new Date(plan.targetMonth), 'MMMM yyyy')}
                    </span>
                    <span>
                      Start Date: {format(new Date(plan.startDate), 'MMM d, yyyy')}
                    </span>
                    <span>
                      End Date: {format(new Date(plan.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="text-sm font-medium text-gray-900">Delivery Items</h4>
                <div className="mt-2 divide-y divide-gray-200">
                  {plan.items.map((item) => {
                    const itemBadgeVariant = ITEM_STATUS_BADGE_VARIANT[item.status as keyof typeof ITEM_STATUS_BADGE_VARIANT] || 'default'
                    const completedIdeas = item.ideas.filter((idea) => 
                      idea.contentDrafts[0]?.status === 'APPROVED'
                    ).length
                    const itemProgress = item.quantity > 0 ? (completedIdeas / item.quantity) * 100 : 0
                    return (
                      <div key={item.id} className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">
                              {item.contentType}
                            </span>
                            <Badge variant={itemBadgeVariant}>{item.status}</Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            Due {format(new Date(item.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Progress ({completedIdeas}/{item.quantity})</span>
                            <span>{Math.round(itemProgress)}%</span>
                          </div>
                          <div className="mt-1 relative">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                              <div
                                style={{ width: `${itemProgress}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlanClick(plan.id)
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/delivery-plans/${plan.id}/edit`)
                    }}
                  >
                    Edit Plan
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 