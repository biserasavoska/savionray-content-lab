'use client'

import React from 'react'

import { Card } from '@/components/ui/common/Card'
import Badge from '@/components/ui/common/Badge'

export interface UsageData {
  period: string
  contentItems: number
  aiGenerations: number
  storageGB: number
  teamMembers: number
}

export interface UsageAnalyticsProps {
  currentUsage: {
    contentItems: number
    contentItemsLimit: number
    aiGenerations: number
    aiGenerationsLimit: number
    storageGB: number
    storageLimitGB: number
    teamMembers: number
    teamMembersLimit: number
  }
  historicalData: UsageData[]
  period: '7d' | '30d' | '90d' | '1y'
  onPeriodChange?: (period: '7d' | '30d' | '90d' | '1y') => void
}

export function UsageAnalytics({
  currentUsage,
  historicalData,
  period,
  onPeriodChange
}: UsageAnalyticsProps) {
  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageStatus = (current: number, limit: number) => {
    const percentage = getUsagePercentage(current, limit)
    if (current > limit) return { status: 'over_limit', color: 'destructive' }
    if (percentage > 80) return { status: 'high', color: 'warning' }
    if (percentage > 50) return { status: 'medium', color: 'default' }
    return { status: 'low', color: 'success' }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const UsageMetric = ({ 
    label, 
    current, 
    limit, 
    unit = '', 
    showPercentage = true 
  }: {
    label: string
    current: number
    limit: number
    unit?: string
    showPercentage?: boolean
  }) => {
    const percentage = getUsagePercentage(current, limit)
    const status = getUsageStatus(current, limit)

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {formatNumber(current)} / {formatNumber(limit)} {unit}
            </span>
            {showPercentage && (
              <Badge variant={status.color as any}>
                {percentage.toFixed(1)}%
              </Badge>
            )}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              status.color === 'destructive' ? 'bg-red-500' :
              status.color === 'warning' ? 'bg-yellow-500' :
              status.color === 'success' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  const SimpleChart = ({ data, label }: { data: UsageData[], label: string }) => {
    const maxValue = Math.max(...data.map(d => d.contentItems))
    const minValue = Math.min(...data.map(d => d.contentItems))

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">{label}</h4>
        <div className="flex items-end space-x-1 h-20">
          {data.map((item, index) => {
            const height = maxValue > 0 ? (item.contentItems / maxValue) * 100 : 0
            return (
              <div
                key={index}
                className="flex-1 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${height}%` }}
                title={`${item.period}: ${item.contentItems}`}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{data[0]?.period}</span>
          <span>{data[data.length - 1]?.period}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Usage Analytics</h2>
          <p className="text-gray-600">Monitor your resource usage and trends</p>
        </div>
        
        {/* Period Selector */}
        {onPeriodChange && (
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  period === p
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Content Items</span>
              <Badge variant={getUsageStatus(currentUsage.contentItems, currentUsage.contentItemsLimit).color as any}>
                {getUsagePercentage(currentUsage.contentItems, currentUsage.contentItemsLimit).toFixed(1)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(currentUsage.contentItems)}
            </div>
            <div className="text-sm text-gray-500">
              of {formatNumber(currentUsage.contentItemsLimit)} limit
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">AI Generations</span>
              <Badge variant={getUsageStatus(currentUsage.aiGenerations, currentUsage.aiGenerationsLimit).color as any}>
                {getUsagePercentage(currentUsage.aiGenerations, currentUsage.aiGenerationsLimit).toFixed(1)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(currentUsage.aiGenerations)}
            </div>
            <div className="text-sm text-gray-500">
              of {formatNumber(currentUsage.aiGenerationsLimit)} limit
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Storage</span>
              <Badge variant={getUsageStatus(currentUsage.storageGB, currentUsage.storageLimitGB).color as any}>
                {getUsagePercentage(currentUsage.storageGB, currentUsage.storageLimitGB).toFixed(1)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {currentUsage.storageGB}GB
            </div>
            <div className="text-sm text-gray-500">
              of {currentUsage.storageLimitGB}GB limit
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Team Members</span>
              <Badge variant={getUsageStatus(currentUsage.teamMembers, currentUsage.teamMembersLimit).color as any}>
                {getUsagePercentage(currentUsage.teamMembers, currentUsage.teamMembersLimit).toFixed(1)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {currentUsage.teamMembers}
            </div>
            <div className="text-sm text-gray-500">
              of {currentUsage.teamMembersLimit} limit
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Usage Metrics */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Detailed Usage Breakdown</h3>
          <div className="space-y-6">
            <UsageMetric
              label="Content Items Created"
              current={currentUsage.contentItems}
              limit={currentUsage.contentItemsLimit}
            />
            <UsageMetric
              label="AI Content Generations"
              current={currentUsage.aiGenerations}
              limit={currentUsage.aiGenerationsLimit}
            />
            <UsageMetric
              label="Storage Used"
              current={currentUsage.storageGB}
              limit={currentUsage.storageLimitGB}
              unit="GB"
            />
            <UsageMetric
              label="Team Members"
              current={currentUsage.teamMembers}
              limit={currentUsage.teamMembersLimit}
              showPercentage={false}
            />
          </div>
        </div>
      </Card>

      {/* Usage Trends */}
      {historicalData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <SimpleChart
                data={historicalData}
                label="Content Items Trend"
              />
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <SimpleChart
                data={historicalData}
                label="AI Generations Trend"
              />
            </div>
          </Card>
        </div>
      )}

      {/* Usage Insights */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Usage Insights</h3>
          <div className="space-y-4">
            {getUsageStatus(currentUsage.contentItems, currentUsage.contentItemsLimit).status === 'over_limit' && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-5 h-5 text-red-500 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-red-800">Content Items Limit Exceeded</h4>
                  <p className="text-sm text-red-700 mt-1">
                    You've exceeded your content items limit. Consider upgrading your plan to continue creating content.
                  </p>
                </div>
              </div>
            )}

            {getUsageStatus(currentUsage.aiGenerations, currentUsage.aiGenerationsLimit).status === 'high' && (
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-5 h-5 text-yellow-500 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800">High AI Usage</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You're approaching your AI generation limit. Monitor your usage to avoid hitting the limit.
                  </p>
                </div>
              </div>
            )}

            {getUsageStatus(currentUsage.storageGB, currentUsage.storageLimitGB).status === 'low' && (
              <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-5 h-5 text-green-500 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-green-800">Healthy Storage Usage</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your storage usage is well within limits. You have plenty of space for new content.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
} 