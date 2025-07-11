'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import type { Idea, ContentDraft, User } from '@/types/content'
import { CONTENT_TYPE } from '@/lib/utils/enum-constants'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

type CreateContentItem = {
  id: string
  title: string
  description: string
  status: string
  createdAt: Date
  updatedAt: Date
  createdById: string
  mediaType: string | null
  publishingDateTime: Date | null
  savedForLater: boolean
  contentType: string | null
  deliveryItemId: string | null
  createdBy: {
    name: string | null
    email: string | null
  }
  contentDrafts: Array<{
    id: string
    status: string
    createdAt: Date
    updatedAt: Date
    createdById: string
    body: string
    metadata: any
    ideaId: string
    contentType: string
    createdBy: {
      name: string | null
      email: string | null
    }
  }>
}

interface CreateContentListProps {
  items: CreateContentItem[]
}

export default function CreateContentList({ items }: CreateContentListProps) {
  const { data: session } = useSession()
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedMonth, setSelectedMonth] = useState<string>('')

  const filteredItems = items.filter(item => {
    if (selectedType !== 'ALL' && item.contentType !== selectedType) {
      return false
    }
    if (selectedMonth && item.publishingDateTime) {
      const itemMonth = format(new Date(item.publishingDateTime), 'yyyy-MM')
      return itemMonth === selectedMonth
    }
    return true
  })

  // Get unique months from items with publishing dates
  const availableMonths = Array.from(new Set(
    items
      .filter((item): item is CreateContentItem & { publishingDateTime: Date } => 
        item.publishingDateTime !== null
      )
      .map(item => format(new Date(item.publishingDateTime), 'yyyy-MM'))
  )).sort().reverse()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          >
            <option value="ALL">All Types</option>
            {Object.values(CONTENT_TYPE).map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          >
            <option value="">All Months</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {format(new Date(month + '-01'), 'MMMM yyyy')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const latestDraft = item.contentDrafts[0]

          return (
            <div key={item.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${item.contentType === 'BLOG_POST' ? 'bg-blue-100 text-blue-800' :
                      item.contentType === 'SOCIAL_MEDIA_POST' ? 'bg-green-100 text-green-800' :
                      item.contentType === 'NEWSLETTER' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {item.contentType?.replace(/_/g, ' ')}
                  </span>
                  {item.publishingDateTime && (
                    <span className="text-sm text-gray-500">
                      Publishing: {format(new Date(item.publishingDateTime), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-medium text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.description}</p>

                {latestDraft && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Last draft by {latestDraft.createdBy.name || latestDraft.createdBy.email}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${latestDraft.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                          latestDraft.status === 'AWAITING_FEEDBACK' ? 'bg-blue-100 text-blue-800' :
                          latestDraft.status === 'AWAITING_REVISION' ? 'bg-orange-100 text-orange-800' :
                          latestDraft.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          latestDraft.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          ''}`}
                      >
                        {latestDraft.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Last updated: {format(new Date(latestDraft.updatedAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <Link
                    href={`/create-content/${item.id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 w-full justify-center"
                  >
                    {latestDraft ? 'Edit Content' : 'Create Content'}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No content found matching your filters.</p>
        </div>
      )}
    </div>
  )
} 