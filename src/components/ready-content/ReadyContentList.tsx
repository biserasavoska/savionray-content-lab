'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Idea, ContentDraft, ContentType, IdeaStatus, User, DraftStatus } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { isCreative } from '@/lib/auth'
import Link from 'next/link'

type ReadyContentItem = Idea & {
  createdBy: Pick<User, 'name' | 'email'>
  contentDrafts: (ContentDraft & {
    createdBy: Pick<User, 'name' | 'email'>
  })[]
}

interface ReadyContentListProps {
  items: ReadyContentItem[]
}

export default function ReadyContentList({ items }: ReadyContentListProps) {
  const { data: session } = useSession()
  const [selectedType, setSelectedType] = useState<ContentType | 'ALL'>('ALL')
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
      .filter((item): item is ReadyContentItem & { publishingDateTime: Date } => 
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
            onChange={(e) => setSelectedType(e.target.value as ContentType | 'ALL')}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          >
            <option value="ALL">All Types</option>
            {Object.values(ContentType).map(type => (
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
                        Created by {latestDraft.createdBy.name || latestDraft.createdBy.email}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${latestDraft.status === DraftStatus.DRAFT ? 'bg-yellow-100 text-yellow-800' :
                          latestDraft.status === DraftStatus.AWAITING_REVISION ? 'bg-red-100 text-red-800' :
                          latestDraft.status === DraftStatus.AWAITING_FEEDBACK ? 'bg-blue-100 text-blue-800' :
                          latestDraft.status === DraftStatus.APPROVED ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}`}
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
                    href={isCreative(session) 
                      ? `/ready-content/${item.id}/edit`
                      : `/content/${item.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 w-full justify-center"
                  >
                    {isCreative(session) ? 'Create/Edit Content' : 'View Content'}
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