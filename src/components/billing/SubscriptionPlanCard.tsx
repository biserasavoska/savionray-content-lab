'use client'

import React from 'react'
import Badge from '@/components/ui/common/Badge'
import Button from '@/components/ui/common/Button'
import { Card } from '@/components/ui/common/Card'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  features: string[]
  limits: {
    contentItems: number
    teamMembers: number
    storageGB: number
    aiGenerations: number
  }
  isPopular?: boolean
  isCurrent?: boolean
}

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan
  onSelect?: (planId: string) => void
  onUpgrade?: (planId: string) => void
  onDowngrade?: (planId: string) => void
  onCancel?: (planId: string) => void
  loading?: boolean
}

export function SubscriptionPlanCard({
  plan,
  onSelect,
  onUpgrade,
  onDowngrade,
  onCancel,
  loading = false
}: SubscriptionPlanCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getActionButton = () => {
    if (plan.isCurrent) {
      return (
        <div className="flex gap-2">
          {onUpgrade && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpgrade(plan.id)}
              disabled={loading}
            >
              Upgrade
            </Button>
          )}
          {onCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onCancel(plan.id)}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      )
    }

    if (onSelect) {
      return (
        <Button
          variant={plan.isPopular ? "primary" : "outline"}
          onClick={() => onSelect(plan.id)}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Select Plan'}
        </Button>
      )
    }

    if (onDowngrade) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDowngrade(plan.id)}
          disabled={loading}
        >
          Downgrade
        </Button>
      )
    }

    return null
  }

  return (
    <Card
      variant={plan.isPopular ? "elevated" : "default"}
      className={`relative ${plan.isPopular ? 'border-primary shadow-lg' : ''}`}
    >
      {plan.isPopular && (
        <Badge
          variant="default"
          className="absolute -top-3 left-1/2 transform -translate-x-1/2"
        >
          Most Popular
        </Badge>
      )}
      
      {plan.isCurrent && (
        <Badge
          variant="secondary"
          className="absolute -top-3 right-4"
        >
          Current Plan
        </Badge>
      )}

      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
          <p className="text-gray-600 mb-4">{plan.description}</p>
          
          <div className="mb-4">
            <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
            <span className="text-gray-600">/{plan.billingCycle}</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Features:</h4>
            <ul className="space-y-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Limits:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Content Items:</span>
                <span className="font-medium">{plan.limits.contentItems.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Team Members:</span>
                <span className="font-medium">{plan.limits.teamMembers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage:</span>
                <span className="font-medium">{plan.limits.storageGB}GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">AI Generations:</span>
                <span className="font-medium">{plan.limits.aiGenerations.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          {getActionButton()}
        </div>
      </div>
    </Card>
  )
} 