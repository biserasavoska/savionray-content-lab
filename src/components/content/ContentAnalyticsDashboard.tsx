'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  ThumbsUp, 
  MessageSquare, 
  Share2,
  Calendar,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Target,
  FileText
} from 'lucide-react'

interface ContentMetrics {
  totalContent: number
  publishedContent: number
  engagementRate: number
  averageViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  conversionRate: number
  topPerformingContent: Array<{
    id: string
    title: string
    views: number
    likes: number
    comments: number
    shares: number
    publishedDate: string
  }>
  contentByType: Array<{
    type: string
    count: number
    percentage: number
  }>
  engagementTrend: Array<{
    date: string
    views: number
    likes: number
    comments: number
  }>
  platformPerformance: Array<{
    platform: string
    posts: number
    engagement: number
    reach: number
  }>
}

interface ContentAnalyticsDashboardProps {
  metrics: ContentMetrics
  timeRange: '7d' | '30d' | '90d' | '1y'
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void
}

export default function ContentAnalyticsDashboard({
  metrics,
  timeRange,
  onTimeRangeChange
}: ContentAnalyticsDashboardProps) {
  const { data: session } = useSession()
  const [selectedMetric, setSelectedMetric] = useState<string>('views')

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatPercentage = (num: number) => {
    return num.toFixed(1) + '%'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
    return null
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Content Analytics</h2>
            <p className="text-gray-600">Track your content performance and engagement</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Content</p>
                <p className="text-3xl font-bold">{formatNumber(metrics.totalContent)}</p>
                <p className="text-blue-100 text-sm">Published pieces</p>
              </div>
              <FileText className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Engagement Rate</p>
                <p className="text-3xl font-bold">{formatPercentage(metrics.engagementRate)}</p>
                <p className="text-green-100 text-sm">Average engagement</p>
              </div>
              <Activity className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Average Views</p>
                <p className="text-3xl font-bold">{formatNumber(metrics.averageViews)}</p>
                <p className="text-purple-100 text-sm">Per piece</p>
              </div>
              <Eye className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Conversion Rate</p>
                <p className="text-3xl font-bold">{formatPercentage(metrics.conversionRate)}</p>
                <p className="text-orange-100 text-sm">Content to action</p>
              </div>
              <Target className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <ThumbsUp className="w-5 h-5 text-blue-500 mr-3" />
                <span className="font-medium text-gray-900">Total Likes</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalLikes)}</p>
                <p className="text-sm text-gray-500">+12.5% from last period</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-medium text-gray-900">Total Comments</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalComments)}</p>
                <p className="text-sm text-gray-500">+8.3% from last period</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Share2 className="w-5 h-5 text-purple-500 mr-3" />
                <span className="font-medium text-gray-900">Total Shares</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalShares)}</p>
                <p className="text-sm text-gray-500">+15.2% from last period</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content by Type</h3>
          <div className="space-y-3">
            {metrics.contentByType.map((type) => (
              <div key={type.type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">{type.type}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{type.count}</p>
                  <p className="text-xs text-gray-500">{formatPercentage(type.percentage)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Content</h3>
        <div className="space-y-4">
          {metrics.topPerformingContent.map((content, index) => (
            <div key={content.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm mr-4">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{content.title}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(content.publishedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{formatNumber(content.views)}</p>
                  <p className="text-xs text-gray-500">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{formatNumber(content.likes)}</p>
                  <p className="text-xs text-gray-500">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{formatNumber(content.comments)}</p>
                  <p className="text-xs text-gray-500">Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{formatNumber(content.shares)}</p>
                  <p className="text-xs text-gray-500">Shares</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.platformPerformance.map((platform) => (
            <div key={platform.platform} className="text-center p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{platform.platform}</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{platform.posts}</p>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{formatPercentage(platform.engagement)}</p>
                  <p className="text-sm text-gray-500">Engagement Rate</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{formatNumber(platform.reach)}</p>
                  <p className="text-sm text-gray-500">Total Reach</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Trend Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trend</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Engagement trend chart will be displayed here</p>
            <p className="text-sm text-gray-400">Showing data for {timeRangeOptions.find(opt => opt.value === timeRange)?.label}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 