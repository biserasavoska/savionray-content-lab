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
  FileText,
  Clock,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

interface PerformanceMetrics {
  totalContent: number
  publishedContent: number
  engagementRate: number
  averageViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  conversionRate: number
  averageTimeOnPage: number
  bounceRate: number
  topPerformingContent: Array<{
    id: string
    title: string
    views: number
    likes: number
    comments: number
    shares: number
    publishedDate: string
    engagementRate: number
  }>
  contentByType: Array<{
    type: string
    count: number
    percentage: number
    avgEngagement: number
  }>
  engagementTrend: Array<{
    date: string
    views: number
    likes: number
    comments: number
    shares: number
  }>
  platformPerformance: Array<{
    platform: string
    posts: number
    engagement: number
    reach: number
    conversionRate: number
  }>
  userBehavior: {
    peakHours: Array<{ hour: number; activity: number }>
    deviceTypes: Array<{ device: string; percentage: number }>
    userRetention: number
    averageSessionDuration: number
  }
  predictiveInsights: Array<{
    type: 'trend' | 'opportunity' | 'warning'
    title: string
    description: string
    confidence: number
    impact: 'high' | 'medium' | 'low'
  }>
}

interface AdvancedAnalyticsDashboardProps {
  metrics: PerformanceMetrics
  timeRange: '7d' | '30d' | '90d' | '1y'
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void
  onExportData?: () => void
}

export default function AdvancedAnalyticsDashboard({
  metrics,
  timeRange,
  onTimeRangeChange,
  onExportData
}: AdvancedAnalyticsDashboardProps) {
  const { data: session } = useSession()
  const [selectedMetric, setSelectedMetric] = useState<string>('views')
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-blue-600" />
      case 'opportunity':
        return <Zap className="w-4 h-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend':
        return 'bg-blue-50 border-blue-200'
      case 'opportunity':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setRefreshKey(prev => prev + 1)
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive insights into your content performance</p>
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
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            {onExportData && (
              <button
                onClick={onExportData}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            )}
          </div>
        </div>

        {/* Key Performance Indicators */}
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
                <p className="text-orange-100 text-sm">Goal completion</p>
              </div>
              <Target className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <ThumbsUp className="w-5 h-5 text-blue-500 mr-3" />
                <span className="font-medium text-gray-900">Total Likes</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalLikes)}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                  +12.5% from last period
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-medium text-gray-900">Total Comments</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalComments)}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                  +8.3% from last period
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Share2 className="w-5 h-5 text-purple-500 mr-3" />
                <span className="font-medium text-gray-900">Total Shares</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalShares)}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                  +15.2% from last period
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Behavior</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-3" />
                <span className="font-medium text-gray-900">Avg. Time on Page</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatTime(metrics.averageTimeOnPage)}</p>
                <p className="text-sm text-gray-500">Per session</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-medium text-gray-900">User Retention</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.userBehavior.userRetention)}</p>
                <p className="text-sm text-gray-500">30-day retention</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-purple-500 mr-3" />
                <span className="font-medium text-gray-900">Bounce Rate</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.bounceRate)}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <ArrowDownRight className="w-3 h-3 text-green-500 mr-1" />
                  -5.2% improvement
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-yellow-500 mr-3" />
                <span className="font-medium text-gray-900">Top Performing</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{metrics.topPerformingContent.length}</p>
                <p className="text-sm text-gray-500">High-engagement posts</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-medium text-gray-900">Avg. Engagement</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.engagementRate)}</p>
                <p className="text-sm text-gray-500">Per post</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-500 mr-3" />
                <span className="font-medium text-gray-900">Publishing Rate</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{Math.round(metrics.publishedContent / 30)}</p>
                <p className="text-sm text-gray-500">Posts per month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.predictiveInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {insight.confidence}% confidence
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {insight.impact} impact
                    </span>
                  </div>
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
                <div>
                  <p className="text-sm font-semibold text-gray-900">{formatPercentage(platform.conversionRate)}</p>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                </div>
              </div>
            </div>
          ))}
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
                <div className="text-center">
                  <p className="text-sm font-bold text-green-600">{formatPercentage(content.engagementRate)}</p>
                  <p className="text-xs text-gray-500">Engagement</p>
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
            <p className="text-gray-500">Advanced engagement trend chart will be displayed here</p>
            <p className="text-sm text-gray-400">Showing data for {timeRangeOptions.find(opt => opt.value === timeRange)?.label}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 