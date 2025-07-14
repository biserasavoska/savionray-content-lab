'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { IdeaStatus, Idea, User } from '@prisma/client'
import { useRouter } from 'next/navigation'

import IdeaCard from '@/components/ideas/IdeaCard'
import { IdeaWithCreator } from '@/types/idea'
import { IDEA_STATUS } from '@/lib/utils/enum-utils'
import { SimpleErrorDisplay } from '@/components/ui/ErrorDisplay'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization'
import { useOrganization } from '@/lib/contexts/OrganizationContext'
import { useApiHeaders } from '@/lib/utils/api-helpers'

const TABS = [
  { id: 'all', name: 'All Ideas', status: undefined },
  { id: 'pending', name: 'Pending', status: IDEA_STATUS.PENDING },
  { id: 'approved', name: 'Approved', status: IDEA_STATUS.APPROVED },
  { id: 'rejected', name: 'Rejected', status: IDEA_STATUS.REJECTED },
]

export default function IdeasPage() {
  const { data: session } = useSession()
  const { organizationId, isLoading: orgLoading } = useCurrentOrganization()
  const { currentOrganization } = useOrganization()
  const apiHeaders = useApiHeaders()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [ideas, setIdeas] = useState<IdeaWithCreator[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  })
  const [error, setError] = useState<string | null>(null)

  const loadIdeas = async (
    status?: IdeaStatus,
    page: number = 1
  ) => {
    if (!organizationId) return
    
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        ...(status && { status }),
        page: page.toString(),
        limit: '10',
      })
      
      const response = await fetch(`/api/ideas?${params}`, {
        headers: apiHeaders
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to load ideas')
      }
      const data = await response.json()
      
      if (data.success) {
        setIdeas(data.data.ideas)
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.error?.message || 'Failed to load ideas')
      }
    } catch (error) {
      console.error('Failed to load ideas:', error)
      setError(error instanceof Error ? error.message : 'Failed to load ideas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (organizationId) {
      loadIdeas()
    }
  }, [organizationId])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const tab = TABS.find((t) => t.id === tabId)
    setCurrentPage(1)
    loadIdeas(tab?.status, 1)
  }

  const handleStatusChange = async (id: string, status: IdeaStatus) => {
    try {
      const response = await fetch(`/api/ideas/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error('Failed to update status')
      const tab = TABS.find((t) => t.id === activeTab)
      loadIdeas(tab?.status, currentPage)
    } catch (error) {
      console.error('Failed to update idea status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this idea?')) {
      return
    }

    try {
      const response = await fetch(`/api/ideas/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete idea')
      const tab = TABS.find((t) => t.id === activeTab)
      loadIdeas(tab?.status, currentPage)
    } catch (error) {
      console.error('Failed to delete idea:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const tab = TABS.find((t) => t.id === activeTab)
    loadIdeas(tab?.status, page)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <LoadingSpinner text="Loading session..." />
          </div>
        </div>
      </div>
    )
  }

  if (orgLoading || !organizationId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <LoadingSpinner text="Loading organization..." />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Ideas</h1>
            {currentOrganization && (
              <p className="text-sm text-gray-600 mt-1">
                Viewing ideas for <span className="font-medium">{currentOrganization.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => router.push('/ideas/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            New Idea
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex items-center justify-between">
          <nav className="-mb-px flex space-x-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.name}
              </button>
            ))}
          </nav>
          {/* Next Month Dropdown */}
          <div className="ml-4">
            <label htmlFor="next-month" className="sr-only">Next Month</label>
            <select
              id="next-month"
              name="next-month"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
            >
              <option>Next Month</option>
              {/* Add more options as needed */}
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6">
            <SimpleErrorDisplay 
              message={error} 
              onRetry={() => {
                const tab = TABS.find((t) => t.id === activeTab)
                loadIdeas(tab?.status, currentPage)
              }}
            />
          </div>
        )}

        {/* Ideas Grid */}
        {!error && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onStatusChange={handleStatusChange}
                onEdit={(idea) => router.push(`/ideas/${idea.id}/edit`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 text-center">
            <LoadingSpinner text="Loading ideas..." />
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === currentPage
                      ? 'bg-red-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && ideas.length === 0 && (
          <div className="mt-8 text-center">
            <div className="text-gray-500">
              <p className="text-lg font-medium">No ideas found</p>
              <p className="mt-2">Get started by creating your first content idea.</p>
              <button
                onClick={() => router.push('/ideas/new')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Create First Idea
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 