'use client'

import React, { useState, useEffect } from 'react'

import { BillingDashboard } from '@/components/billing/BillingDashboard'
import { SubscriptionPlanCard, SubscriptionPlan } from '@/components/billing/SubscriptionPlanCard'
import { UsageAnalytics } from '@/components/billing/UsageAnalytics'
import { Card } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'

// Mock data - in real app, this would come from API
const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals and small teams',
    price: 29,
    billingCycle: 'monthly',
    features: [
      'Up to 100 content items per month',
      '1,000 AI generations per month',
      '10GB storage',
      'Up to 3 team members',
      'Basic analytics',
      'Email support'
    ],
    limits: {
      contentItems: 100,
      teamMembers: 3,
      storageGB: 10,
      aiGenerations: 1000
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing businesses and agencies',
    price: 99,
    billingCycle: 'monthly',
    features: [
      'Up to 1,000 content items per month',
      '10,000 AI generations per month',
      '100GB storage',
      'Up to 10 team members',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access'
    ],
    limits: {
      contentItems: 1000,
      teamMembers: 10,
      storageGB: 100,
      aiGenerations: 10000
    },
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: 299,
    billingCycle: 'monthly',
    features: [
      'Unlimited content items',
      'Unlimited AI generations',
      '1TB storage',
      'Unlimited team members',
      'Advanced analytics & reporting',
      '24/7 phone support',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees'
    ],
    limits: {
      contentItems: 999999,
      teamMembers: 999999,
      storageGB: 1024,
      aiGenerations: 999999
    }
  }
]

const mockBillingInfo = {
  currentPlan: {
    id: 'professional',
    name: 'Professional',
    price: 99,
    billingCycle: 'monthly' as const,
    nextBillingDate: '2024-02-15',
    status: 'active' as const
  },
  usage: {
    contentItems: 750,
    contentItemsLimit: 1000,
    storageGB: 45,
    storageLimitGB: 100,
    aiGenerations: 8500,
    aiGenerationsLimit: 10000,
    teamMembers: 7,
    teamMembersLimit: 10
  },
  billingHistory: [
    {
      id: 'inv_001',
      date: '2024-01-15',
      amount: 99,
      status: 'paid' as const,
      description: 'Professional Plan - January 2024'
    },
    {
      id: 'inv_002',
      date: '2023-12-15',
      amount: 99,
      status: 'paid' as const,
      description: 'Professional Plan - December 2023'
    },
    {
      id: 'inv_003',
      date: '2023-11-15',
      amount: 99,
      status: 'paid' as const,
      description: 'Professional Plan - November 2023'
    }
  ],
  paymentMethods: [
    {
      id: 'pm_001',
      type: 'card' as const,
      last4: '4242',
      brand: 'Visa',
      isDefault: true,
      expiryMonth: 12,
      expiryYear: 2025
    }
  ]
}

const mockHistoricalData = [
  { period: 'Jan 1', contentItems: 120, aiGenerations: 1500, storageGB: 25, teamMembers: 5 },
  { period: 'Jan 8', contentItems: 180, aiGenerations: 2200, storageGB: 32, teamMembers: 6 },
  { period: 'Jan 15', contentItems: 220, aiGenerations: 2800, storageGB: 38, teamMembers: 6 },
  { period: 'Jan 22', contentItems: 280, aiGenerations: 3500, storageGB: 42, teamMembers: 7 },
  { period: 'Jan 29', contentItems: 320, aiGenerations: 4200, storageGB: 45, teamMembers: 7 },
  { period: 'Feb 5', contentItems: 380, aiGenerations: 4800, storageGB: 48, teamMembers: 7 },
  { period: 'Feb 12', contentItems: 450, aiGenerations: 5800, storageGB: 52, teamMembers: 7 }
]

export default function BillingPage() {
  const [activeSection, setActiveSection] = useState<'overview' | 'plans' | 'usage'>('overview')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePlanSelect = async (planId: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSelectedPlan(planId)
    setLoading(false)
    // In real app, this would redirect to Stripe checkout or update subscription
    alert(`Selected plan: ${planId}`)
  }

  const handleUpgradePlan = () => {
    setActiveSection('plans')
  }

  const handleUpdatePaymentMethod = () => {
    // In real app, this would open Stripe payment method form
    alert('Update payment method')
  }

  const handleViewInvoice = (invoiceId: string) => {
    // In real app, this would download or display invoice
    alert(`View invoice: ${invoiceId}`)
  }

  const handleCancelSubscription = () => {
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      // In real app, this would call API to cancel subscription
      alert('Subscription cancellation requested')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription, view usage, and update billing information
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', description: 'Billing dashboard and current plan' },
              { id: 'plans', label: 'Plans & Pricing', description: 'View and change subscription plans' },
              { id: 'usage', label: 'Usage Analytics', description: 'Detailed usage metrics and trends' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === section.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-medium">{section.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{section.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        {activeSection === 'overview' && (
          <BillingDashboard
            billingInfo={mockBillingInfo}
            onUpdatePaymentMethod={handleUpdatePaymentMethod}
            onViewInvoice={handleViewInvoice}
            onCancelSubscription={handleCancelSubscription}
            onUpgradePlan={handleUpgradePlan}
          />
        )}

        {activeSection === 'plans' && (
          <div className="space-y-8">
            {/* Current Plan Status */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                    <p className="text-gray-600">You're currently on the Professional plan</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Plan</span>
                    <p className="font-medium">Professional</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Price</span>
                    <p className="font-medium">$99/month</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Next Billing</span>
                    <p className="font-medium">February 15, 2024</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Available Plans */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockSubscriptionPlans.map((plan) => (
                  <SubscriptionPlanCard
                    key={plan.id}
                    plan={{
                      ...plan,
                      isCurrent: plan.id === mockBillingInfo.currentPlan.id
                    }}
                    onSelect={handlePlanSelect}
                    loading={loading && selectedPlan === plan.id}
                  />
                ))}
              </div>
            </div>

            {/* Plan Comparison */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Plan Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Starter</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Professional</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-3 px-4 text-gray-900">Content Items</td>
                        <td className="py-3 px-4 text-center">100/month</td>
                        <td className="py-3 px-4 text-center">1,000/month</td>
                        <td className="py-3 px-4 text-center">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-900">AI Generations</td>
                        <td className="py-3 px-4 text-center">1,000/month</td>
                        <td className="py-3 px-4 text-center">10,000/month</td>
                        <td className="py-3 px-4 text-center">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-900">Storage</td>
                        <td className="py-3 px-4 text-center">10GB</td>
                        <td className="py-3 px-4 text-center">100GB</td>
                        <td className="py-3 px-4 text-center">1TB</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-900">Team Members</td>
                        <td className="py-3 px-4 text-center">3</td>
                        <td className="py-3 px-4 text-center">10</td>
                        <td className="py-3 px-4 text-center">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-900">Support</td>
                        <td className="py-3 px-4 text-center">Email</td>
                        <td className="py-3 px-4 text-center">Priority</td>
                        <td className="py-3 px-4 text-center">24/7 Phone</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'usage' && (
          <UsageAnalytics
            currentUsage={mockBillingInfo.usage}
            historicalData={mockHistoricalData}
            period="30d"
            onPeriodChange={(period) => console.log('Period changed:', period)}
          />
        )}
      </div>
    </div>
  )
} 