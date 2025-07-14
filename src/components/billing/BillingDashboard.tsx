'use client'

import React, { useState } from 'react'

import { Card } from '@/components/ui/common/Card'
import Badge from '@/components/ui/common/Badge'
import Button from '@/components/ui/common/Button'

export interface BillingInfo {
  currentPlan: {
    id: string
    name: string
    price: number
    billingCycle: 'monthly' | 'yearly'
    nextBillingDate: string
    status: 'active' | 'past_due' | 'canceled' | 'trialing'
  }
  usage: {
    contentItems: number
    contentItemsLimit: number
    storageGB: number
    storageLimitGB: number
    aiGenerations: number
    aiGenerationsLimit: number
    teamMembers: number
    teamMembersLimit: number
  }
  billingHistory: Array<{
    id: string
    date: string
    amount: number
    status: 'paid' | 'pending' | 'failed'
    description: string
  }>
  paymentMethods: Array<{
    id: string
    type: 'card' | 'bank_account'
    last4: string
    brand?: string
    isDefault: boolean
    expiryMonth?: number
    expiryYear?: number
  }>
}

interface BillingDashboardProps {
  billingInfo: BillingInfo
  onUpdatePaymentMethod?: () => void
  onViewInvoice?: (invoiceId: string) => void
  onCancelSubscription?: () => void
  onUpgradePlan?: () => void
}

export function BillingDashboard({
  billingInfo,
  onUpdatePaymentMethod,
  onViewInvoice,
  onCancelSubscription,
  onUpgradePlan
}: BillingDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'billing' | 'payment'>('overview')

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'past_due':
        return 'destructive'
      case 'canceled':
        return 'secondary'
      case 'trialing':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const UsageBar = ({ current, limit, label }: { current: number; limit: number; label: string }) => {
    const percentage = getUsagePercentage(current, limit)
    const isOverLimit = current > limit

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          <span className={`font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-900'}`}>
            {current.toLocaleString()} / {limit.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isOverLimit ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and billing information</p>
        </div>
        <div className="flex gap-2">
          {onUpgradePlan && (
            <Button onClick={onUpgradePlan}>
              Upgrade Plan
            </Button>
          )}
          {onUpdatePaymentMethod && (
            <Button variant="outline" onClick={onUpdatePaymentMethod}>
              Update Payment Method
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'usage', label: 'Usage' },
            { id: 'billing', label: 'Billing History' },
            { id: 'payment', label: 'Payment Methods' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Current Plan */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium">{billingInfo.currentPlan.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">{formatCurrency(billingInfo.currentPlan.price)}/{billingInfo.currentPlan.billingCycle}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={getStatusColor(billingInfo.currentPlan.status) as any}>
                      {billingInfo.currentPlan.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Next Billing:</span>
                    <span className="font-medium">{formatDate(billingInfo.currentPlan.nextBillingDate)}</span>
                  </div>
                </div>
                {onCancelSubscription && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={onCancelSubscription}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </Card>

            {/* Quick Usage */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Usage This Month</h3>
                <div className="space-y-4">
                  <UsageBar
                    current={billingInfo.usage.contentItems}
                    limit={billingInfo.usage.contentItemsLimit}
                    label="Content Items"
                  />
                  <UsageBar
                    current={billingInfo.usage.aiGenerations}
                    limit={billingInfo.usage.aiGenerationsLimit}
                    label="AI Generations"
                  />
                  <UsageBar
                    current={billingInfo.usage.storageGB}
                    limit={billingInfo.usage.storageLimitGB}
                    label="Storage (GB)"
                  />
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                {billingInfo.paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {billingInfo.paymentMethods
                      .filter(method => method.isDefault)
                      .map(method => (
                        <div key={method.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                              {method.brand || method.type}
                            </div>
                            <span className="text-sm">
                              •••• {method.last4}
                              {method.expiryMonth && method.expiryYear && (
                                <span className="text-gray-500 ml-1">
                                  ({method.expiryMonth}/{method.expiryYear})
                                </span>
                              )}
                            </span>
                          </div>
                          <Badge variant="secondary">Default</Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No payment method added</p>
                )}
                {onUpdatePaymentMethod && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={onUpdatePaymentMethod}
                  >
                    Update Payment Method
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'usage' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Detailed Usage</h3>
              <div className="space-y-6">
                <UsageBar
                  current={billingInfo.usage.contentItems}
                  limit={billingInfo.usage.contentItemsLimit}
                  label="Content Items"
                />
                <UsageBar
                  current={billingInfo.usage.aiGenerations}
                  limit={billingInfo.usage.aiGenerationsLimit}
                  label="AI Generations"
                />
                <UsageBar
                  current={billingInfo.usage.storageGB}
                  limit={billingInfo.usage.storageLimitGB}
                  label="Storage (GB)"
                />
                <UsageBar
                  current={billingInfo.usage.teamMembers}
                  limit={billingInfo.usage.teamMembersLimit}
                  label="Team Members"
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'billing' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Billing History</h3>
              <div className="space-y-4">
                {billingInfo.billingHistory.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{invoice.description}</span>
                        <Badge
                          variant={
                            invoice.status === 'paid' ? 'success' :
                            invoice.status === 'pending' ? 'default' : 'danger'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(invoice.date)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
                      {onViewInvoice && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewInvoice(invoice.id)}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'payment' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Payment Methods</h3>
              <div className="space-y-4">
                {billingInfo.paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                        {method.brand || method.type}
                      </div>
                      <div>
                        <p className="font-medium">
                          •••• {method.last4}
                        </p>
                        <p className="text-sm text-gray-600">
                          {method.type === 'card' && method.expiryMonth && method.expiryYear
                            ? `Expires ${method.expiryMonth}/${method.expiryYear}`
                            : 'Bank Account'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                {onUpdatePaymentMethod && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={onUpdatePaymentMethod}
                  >
                    Add Payment Method
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 