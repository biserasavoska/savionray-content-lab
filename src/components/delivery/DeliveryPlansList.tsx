'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { useState, useEffect } from 'react'
import { useOrganization } from '@/lib/contexts/OrganizationContext'

import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/layout/Card'
import Badge from '@/components/ui/common/Badge'
import Button from '@/components/ui/common/Button'

interface DeliveryPlan {
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
    Idea: Array<{
      ContentDraft: Array<{
        status: string
      }>
    }>
    ContentItem: Array<{
      id: string
      status: string
      currentStage: string
      publishedAt: string | Date | null
      createdAt: string | Date
      updatedAt: string | Date
    }>
  }>
  client: {
    name: string | null
    email: string | null
  }
}

interface DeliveryPlansListProps {
  plans?: DeliveryPlan[] // Make optional for backward compatibility
}

const STATUS_BADGE_VARIANT = {
  DRAFT: 'default',
  ACTIVE: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  ARCHIVED: 'secondary',
} as const

const ITEM_STATUS_BADGE_VARIANT = {
  PENDING: 'default',
  IN_PROGRESS: 'secondary',
  REVIEW: 'secondary',
  APPROVED: 'default',
  DELIVERED: 'secondary',
} as const

export default function DeliveryPlansList({ plans: initialPlans }: DeliveryPlansListProps) {
  const router = useRouter()
  const { currentOrganization } = useOrganization()
  const [plans, setPlans] = useState<DeliveryPlan[]>(initialPlans || [])
  const [loading, setLoading] = useState(!initialPlans)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  // Fetch plans from API if not provided as props
  useEffect(() => {
    if (!initialPlans && currentOrganization) {
      fetchPlans()
    }
  }, [currentOrganization, initialPlans])

  const fetchPlans = async () => {
    if (!currentOrganization) return
    
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/delivery-plans', {
        headers: {
          'x-selected-organization': currentOrganization.id
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch delivery plans')
      }
      
      const data = await response.json()
      setPlans(data.plans || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch delivery plans')
    } finally {
      setLoading(false)
    }
  }

  // Comprehensive progress calculation
  const calculateItemProgress = (item: DeliveryPlan['items'][0]) => {
    const totalQuantity = item.quantity
    const contentItems = item.ContentItem || []
    
    // Count different stages of completion
    const completed = contentItems.filter(ci => 
      ci.status === 'PUBLISHED' || ci.publishedAt !== null
    ).length
    
    const inReview = contentItems.filter(ci => 
      ci.status === 'CONTENT_REVIEW' || ci.currentStage === 'CONTENT_REVIEW'
    ).length
    
    const approved = contentItems.filter(ci => 
      ci.status === 'APPROVED'
    ).length
    
    const inProgress = contentItems.filter(ci => 
      ci.status === 'IDEA' || ci.currentStage === 'IDEA'
    ).length
    
    // Calculate progress based on published content
    const progress = totalQuantity > 0 ? (completed / totalQuantity) * 100 : 0
    
    return {
      completed,
      inReview,
      approved,
      inProgress,
      total: totalQuantity,
      progress: Math.round(progress),
      status: completed >= totalQuantity ? 'COMPLETED' : 
              completed > 0 ? 'IN_PROGRESS' : 
              inReview > 0 ? 'REVIEW' : 'PENDING'
    }
  }

  const calculatePlanProgress = (plan: DeliveryPlan) => {
    const totalItems = plan.items.length
    const completedItems = plan.items.filter(item => {
      const itemProgress = calculateItemProgress(item)
      return itemProgress.completed >= itemProgress.total
    }).length
    
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0
    
    return {
      completed: completedItems,
      total: totalItems,
      progress: Math.round(progress)
    }
  }

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

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading delivery plans...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error: {error}</p>
        <Button
          onClick={fetchPlans}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (filteredPlans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No delivery plans found.</p>
        <Button
          onClick={() => router.push('/delivery-plans/new')}
          className="mt-4"
        >
          Create New Plan
        </Button>
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
          const planProgress = calculatePlanProgress(plan)

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
                    <span>Progress ({planProgress.completed}/{planProgress.total} items completed)</span>
                    <span>{planProgress.progress}%</span>
                  </div>
                  <div className="mt-1 relative">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${planProgress.progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
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
                    const itemProgress = calculateItemProgress(item)
                    const itemBadgeVariant = ITEM_STATUS_BADGE_VARIANT[itemProgress.status as keyof typeof ITEM_STATUS_BADGE_VARIANT] || 'default'
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
                            <span>Progress ({itemProgress.completed}/{itemProgress.total} published)</span>
                            <span>{itemProgress.progress}%</span>
                          </div>
                          <div className="mt-1 relative">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                              <div
                                style={{ width: `${itemProgress.progress}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                              />
                            </div>
                          </div>
                          {/* Detailed breakdown */}
                          <div className="mt-2 text-xs text-gray-400">
                            {itemProgress.inReview > 0 && <span className="mr-3">📝 {itemProgress.inReview} in review</span>}
                            {itemProgress.approved > 0 && <span className="mr-3">✅ {itemProgress.approved} approved</span>}
                            {itemProgress.inProgress > 0 && <span className="mr-3">🔄 {itemProgress.inProgress} in progress</span>}
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