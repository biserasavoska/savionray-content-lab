'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { 
  CalendarIcon, 
  UserIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

import { Card, CardHeader, CardContent } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'

interface DeliveryItem {
  id: string
  contentType: string
  quantity: number
  dueDate: string
  priority: number
  notes?: string
  status: string
  createdAt: string
  updatedAt: string
  planId: string
  Idea: any[]
  ContentItem: any[]
}

interface DeliveryPlan {
  id: string
  name: string
  description?: string
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
    name?: string
    email?: string
  }
  items: DeliveryItem[]
  organization: {
    name: string
    primaryColor: string
  }
}

interface DeliveryPlanDetailsProps {
  plan: DeliveryPlan
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
} as const

const ITEM_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-purple-100 text-purple-800',
  APPROVED: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
} as const

export default function DeliveryPlanDetails({ plan }: DeliveryPlanDetailsProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'
  }

  const getItemStatusColor = (status: string) => {
    return ITEM_STATUS_COLORS[status as keyof typeof ITEM_STATUS_COLORS] || 'bg-gray-100 text-gray-800'
  }

  const formatContentType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const totalItems = plan.items.length
  const completedItems = plan.items.filter(item => item.status === 'DELIVERED').length
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{plan.name}</h1>
            <p className="text-sm text-gray-500">
              Created by {plan.client.name || plan.client.email} • {format(new Date(plan.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(plan.status)}>
            {plan.status}
          </Badge>
          <Button
            variant="outline"
            onClick={() => router.push(`/delivery-plans/${plan.id}/edit`)}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Description */}
      {plan.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-700">{plan.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Plan Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Target Month</p>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(plan.targetMonth), 'MMMM yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(plan.startDate), 'MMM d')} - {format(new Date(plan.endDate), 'MMM d')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Progress</p>
                <p className="text-lg font-semibold text-gray-900">
                  {completedItems}/{totalItems} items
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completion</p>
                <p className="text-lg font-semibold text-gray-900">
                  {progressPercentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Overall Progress</h3>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {completedItems} of {totalItems} items completed
          </p>
        </CardContent>
      </Card>

      {/* Delivery Items */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Delivery Items</h3>
        </CardHeader>
        <CardContent>
          {plan.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No delivery items yet.</p>
          ) : (
            <div className="space-y-4">
              {plan.items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {item.priority}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {formatContentType(item.contentType)}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} • Due: {format(new Date(item.dueDate), 'MMM d, yyyy')}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={getItemStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
