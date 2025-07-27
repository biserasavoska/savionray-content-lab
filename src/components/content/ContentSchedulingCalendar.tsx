'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react'
import { formatDate } from '@/lib/utils/date-helpers'

interface ScheduledContent {
  id: string
  title: string
  description: string
  scheduledDate: string
  status: 'SCHEDULED' | 'PUBLISHED' | 'FAILED'
  contentType: string
  platform: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  contentDraft: {
    id: string
    body: string
    status: string
  }
}

interface ContentSchedulingCalendarProps {
  scheduledContent: ScheduledContent[]
  onScheduleContent: (contentId: string, scheduledDate: string) => void
  onEditSchedule: (scheduleId: string) => void
  onDeleteSchedule: (scheduleId: string) => void
  onAddSchedule: () => void
}

const statusConfig = {
  SCHEDULED: { 
    label: 'Scheduled', 
    color: 'bg-blue-100 text-blue-800',
    icon: Clock
  },
  PUBLISHED: { 
    label: 'Published', 
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  FAILED: { 
    label: 'Failed', 
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle
  }
}

export default function ContentSchedulingCalendar({
  scheduledContent,
  onScheduleContent,
  onEditSchedule,
  onDeleteSchedule,
  onAddSchedule
}: ContentSchedulingCalendarProps) {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Get calendar data
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty days for padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getWeekDays = () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getContentForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return scheduledContent.filter(content => {
      const contentDate = new Date(content.scheduledDate).toISOString().split('T')[0]
      return contentDate === dateString && (filterStatus === 'all' || content.status === filterStatus)
    })
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    return config ? React.createElement(config.icon, { className: 'w-3 h-3' }) : null
  }

  const getStatusColor = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    return config?.color || 'bg-gray-100 text-gray-800'
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = getWeekDays()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Content Scheduling</h2>
          <button
            onClick={onAddSchedule}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Content
          </button>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-gray-900">
              {getMonthName(currentDate)}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Today
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>
            <div className="flex border border-gray-300 rounded-md">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm capitalize ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((date, index) => (
            <div
              key={index}
              className={`min-h-24 p-2 border border-gray-200 ${
                date ? 'bg-white' : 'bg-gray-50'
                              } ${isToday(date) ? 'bg-blue-50 border-blue-300' : ''} ${
                  isSelected(date) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {date && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday(date) ? 'text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {getContentForDate(date).length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded-full">
                        {getContentForDate(date).length}
                      </span>
                    )}
                  </div>

                  {/* Content items for this date */}
                  <div className="space-y-1">
                    {getContentForDate(date).slice(0, 3).map((content) => (
                      <div
                        key={content.id}
                        className="p-1 text-xs bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                        onClick={() => onEditSchedule(content.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate font-medium">
                            {content.title}
                          </span>
                          <div className={`inline-flex items-center px-1 rounded ${getStatusColor(content.status)}`}>
                            {getStatusIcon(content.status)}
                          </div>
                        </div>
                        <div className="text-gray-500 truncate">
                          {content.platform}
                        </div>
                      </div>
                    ))}
                    {getContentForDate(date).length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{getContentForDate(date).length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {formatDate(selectedDate)}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {getContentForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No content scheduled for this date
              </p>
            ) : (
              getContentForDate(selectedDate).map((content) => (
                <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {content.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {content.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{content.platform}</span>
                        <span>{content.contentType}</span>
                        <span>{new Date(content.scheduledDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>By {content.createdBy.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                        {getStatusIcon(content.status)}
                        <span className="ml-1">{statusConfig[content.status as keyof typeof statusConfig]?.label}</span>
                      </div>
                      <button
                        onClick={() => onEditSchedule(content.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSchedule(content.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {content.contentDraft.body}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = scheduledContent.filter(content => content.status === status).length
          return (
            <div key={status} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  {React.createElement(config.icon, { className: 'w-5 h-5' })}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">{config.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 