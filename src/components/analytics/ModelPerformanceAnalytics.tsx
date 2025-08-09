'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Brain, 
  Target,
  CheckCircle,
  AlertTriangle,
  Activity,
  Zap
} from 'lucide-react'

interface ModelMetrics {
  modelId: string
  modelName: string
  totalRequests: number
  successRate: number
  averageResponseTime: number
  totalCost: number
  averageConfidence: number
  fallbackRate: number
  lastUsed: string
  usageByDay: { date: string; requests: number; cost: number }[]
  qualityRating: number
}

interface PerformanceData {
  models: ModelMetrics[]
  totalRequests: number
  totalCost: number
  averageResponseTime: number
  timeRange: '7d' | '30d' | '90d'
}

export default function ModelPerformanceAnalytics() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - in real app this would come from your analytics API
  useEffect(() => {
    const mockData: PerformanceData = {
      models: [
        {
          modelId: 'gpt-5',
          modelName: 'GPT-5',
          totalRequests: 45,
          successRate: 95.6,
          averageResponseTime: 3200,
          totalCost: 12.45,
          averageConfidence: 89.2,
          fallbackRate: 4.4,
          lastUsed: '2 hours ago',
          qualityRating: 9.2,
          usageByDay: [
            { date: '2024-08-03', requests: 8, cost: 2.1 },
            { date: '2024-08-04', requests: 12, cost: 3.2 },
            { date: '2024-08-05', requests: 6, cost: 1.8 },
            { date: '2024-08-06', requests: 9, cost: 2.4 },
            { date: '2024-08-07', requests: 7, cost: 1.9 },
            { date: '2024-08-08', requests: 3, cost: 1.0 }
          ]
        },
        {
          modelId: 'gpt-5-mini',
          modelName: 'GPT-5 Mini',
          totalRequests: 123,
          successRate: 98.4,
          averageResponseTime: 1800,
          totalCost: 8.76,
          averageConfidence: 86.7,
          fallbackRate: 1.6,
          lastUsed: '15 minutes ago',
          qualityRating: 8.5,
          usageByDay: [
            { date: '2024-08-03', requests: 18, cost: 1.2 },
            { date: '2024-08-04', requests: 22, cost: 1.5 },
            { date: '2024-08-05', requests: 19, cost: 1.3 },
            { date: '2024-08-06', requests: 25, cost: 1.7 },
            { date: '2024-08-07', requests: 21, cost: 1.4 },
            { date: '2024-08-08', requests: 18, cost: 1.6 }
          ]
        },
        {
          modelId: 'gpt-5-nano',
          modelName: 'GPT-5 Nano',
          totalRequests: 67,
          successRate: 99.1,
          averageResponseTime: 950,
          totalCost: 2.34,
          averageConfidence: 82.3,
          fallbackRate: 0.9,
          lastUsed: '5 minutes ago',
          qualityRating: 7.8,
          usageByDay: [
            { date: '2024-08-03', requests: 12, cost: 0.4 },
            { date: '2024-08-04', requests: 15, cost: 0.5 },
            { date: '2024-08-05', requests: 8, cost: 0.3 },
            { date: '2024-08-06', requests: 11, cost: 0.4 },
            { date: '2024-08-07', requests: 13, cost: 0.4 },
            { date: '2024-08-08', requests: 8, cost: 0.3 }
          ]
        },
        {
          modelId: 'gpt-4o',
          modelName: 'GPT-4o (Fallback)',
          totalRequests: 89,
          successRate: 96.6,
          averageResponseTime: 2100,
          totalCost: 4.23,
          averageConfidence: 84.1,
          fallbackRate: 0,
          lastUsed: '1 hour ago',
          qualityRating: 8.2,
          usageByDay: [
            { date: '2024-08-03', requests: 15, cost: 0.7 },
            { date: '2024-08-04', requests: 18, cost: 0.8 },
            { date: '2024-08-05', requests: 12, cost: 0.6 },
            { date: '2024-08-06', requests: 16, cost: 0.7 },
            { date: '2024-08-07', requests: 14, cost: 0.6 },
            { date: '2024-08-08', requests: 14, cost: 0.8 }
          ]
        }
      ],
      totalRequests: 324,
      totalCost: 27.78,
      averageResponseTime: 2012,
      timeRange: selectedTimeRange
    }

    // Simulate API delay
    setTimeout(() => {
      setPerformanceData(mockData)
      setIsLoading(false)
    }, 1000)
  }, [selectedTimeRange])

  const getPerformanceColor = (value: number, type: 'success' | 'speed' | 'confidence') => {
    switch (type) {
      case 'success':
        return value >= 95 ? 'text-green-600' : value >= 90 ? 'text-yellow-600' : 'text-red-600'
      case 'speed':
        return value <= 1500 ? 'text-green-600' : value <= 3000 ? 'text-yellow-600' : 'text-red-600'
      case 'confidence':
        return value >= 85 ? 'text-green-600' : value >= 75 ? 'text-yellow-600' : 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getQualityColor = (rating: number) => {
    if (rating >= 9) return 'bg-green-100 text-green-800'
    if (rating >= 8) return 'bg-blue-100 text-blue-800'
    if (rating >= 7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!performanceData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
          <p className="text-gray-600">Unable to load model performance analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
              Model Performance Analytics
            </h1>
            <p className="text-gray-600 mt-2">Monitor and analyze AI model performance metrics</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{performanceData.totalRequests.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">${performanceData.totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{performanceData.averageResponseTime}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {(performanceData.models.reduce((sum, m) => sum + m.successRate * m.totalRequests, 0) / performanceData.totalRequests).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Model Performance Comparison</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fallback Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData.models.map((model) => (
                <tr key={model.modelId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Brain className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{model.modelName}</div>
                        <div className="text-sm text-gray-500">{model.modelId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {model.totalRequests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getPerformanceColor(model.successRate, 'success')}`}>
                      {model.successRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getPerformanceColor(model.averageResponseTime, 'speed')}`}>
                      {model.averageResponseTime.toLocaleString()}ms
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${model.totalCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getPerformanceColor(model.averageConfidence, 'confidence')}`}>
                      {model.averageConfidence.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQualityColor(model.qualityRating)}`}>
                      {model.qualityRating.toFixed(1)}/10
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {model.fallbackRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.lastUsed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usage by Model */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Request Volume
          </h3>
          
          <div className="space-y-4">
            {performanceData.models.map((model) => (
              <div key={model.modelId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{model.modelName}</span>
                  <span className="text-sm text-gray-500">{model.totalRequests} requests</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(model.totalRequests / Math.max(...performanceData.models.map(m => m.totalRequests))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Cost Distribution
          </h3>
          
          <div className="space-y-4">
            {performanceData.models.map((model) => (
              <div key={model.modelId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{model.modelName}</span>
                  <span className="text-sm text-gray-500">${model.totalCost.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(model.totalCost / performanceData.totalCost) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-600" />
          Performance Insights & Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">📈 Key Insights</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <Zap className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                GPT-5 Mini shows the best balance of cost-effectiveness and performance
              </li>
              <li className="flex items-start">
                <Zap className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                GPT-5 Nano has the fastest response times for simple tasks
              </li>
              <li className="flex items-start">
                <Zap className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                Fallback rates are low, indicating good model reliability
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">💡 Recommendations</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Consider using more GPT-5 Mini for routine content generation
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Reserve GPT-5 for complex strategic content planning
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Implement automatic model routing based on task complexity
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
