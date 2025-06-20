'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { IdeaStatus, Idea, User } from '@prisma/client'
import { useRouter } from 'next/navigation'
import IdeaCard from '@/components/ideas/IdeaCard'
import { IdeaWithCreator } from '@/types/idea'

const TABS = [
  { id: 'all', name: 'All Ideas', status: undefined },
  { id: 'pending', name: 'Pending', status: 'PENDING' as IdeaStatus },
  { id: 'approved', name: 'Approved', status: 'APPROVED_BY_CLIENT' as IdeaStatus },
  { id: 'rejected', name: 'Rejected', status: 'REJECTED_BY_CLIENT' as IdeaStatus },
]

export default function IdeasPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [ideas, setIdeas] = useState<IdeaWithCreator[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  })

  const loadIdeas = async (
    status?: IdeaStatus,
    search?: string,
    page: number = 1
  ) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        ...(status && { status }),
        ...(search && { search }),
        page: page.toString(),
        limit: '10',
      })
      
      const response = await fetch(`/api/ideas?${params}`)
      if (!response.ok) throw new Error('Failed to load ideas')
      const data = await response.json()
      setIdeas(data.ideas)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load ideas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadIdeas()
  }, [])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const tab = TABS.find((t) => t.id === tabId)
    setCurrentPage(1)
    loadIdeas(tab?.status, searchQuery, 1)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    const tab = TABS.find((t) => t.id === activeTab)
    loadIdeas(tab?.status, query, 1)
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
      loadIdeas(tab?.status, searchQuery, currentPage)
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
      loadIdeas(tab?.status, searchQuery, currentPage)
    } catch (error) {
      console.error('Failed to delete idea:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const tab = TABS.find((t) => t.id === activeTab)
    loadIdeas(tab?.status, searchQuery, page)
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Content Ideas</h1>
          <button
            onClick={() => router.push('/ideas/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            New Idea
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
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
        </div>

        {/* Ideas Grid */}
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`
                      px-3 py-1 rounded-md text-sm font-medium
                      ${
                        currentPage === page
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {page}
                  </button>
                )
              )}
            </nav>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 text-center text-gray-500">Loading...</div>
        )}
      </div>
    </div>
  )
} 