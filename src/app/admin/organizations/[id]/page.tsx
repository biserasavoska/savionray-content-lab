'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Button from '@/components/ui/common/Button'
import Alert, { AlertDescription } from '@/components/ui/common/Alert'
import OrganizationDeletionModal from '@/components/ui/admin/OrganizationDeletionModal'
import { Trash2, AlertTriangle } from 'lucide-react'

interface Organization {
  id: string
  name: string
  slug: string
  domain: string | null
  primaryColor: string | null
  subscriptionPlan: string
  subscriptionStatus: string
  maxUsers: number
  createdAt: string
  updatedAt: string
  OrganizationUser: Array<{
    id: string
    organizationId: string
    userId: string
    role: string
    permissions: any
    isActive: boolean
    invitedBy: string | null
    invitedAt: string | null
    joinedAt: string | null
    User_OrganizationUser_userIdToUser: {
      id: string
      name: string | null
      email: string | null
      role: string
      image: string | null
    }
  }>
  // Add stats for the deletion modal
  stats?: {
    ideas: number
    contentDrafts: number
    contentItems: number
    deliveryPlans: number
    scheduledPosts: number
    feedback: number
    uploads: number
  }
}

export default function OrganizationViewPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!session) return

    const fetchOrganization = async () => {
      try {
        const response = await fetch(`/api/admin/organizations/${id}`, {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch organization')
        }
        
        const data = await response.json()
        setOrganization(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch organization')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [id, session])

  const handleDeleteClick = () => {
    setDeleteModalOpen(true)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!organization) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/organizations/${organization.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete organization')
      }

      // Redirect back to organizations list after successful deletion
      router.push('/admin/organizations')
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete organization')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false)
    setDeleteError(null)
  }

  if (!session) {
    return <div className="p-6">Please sign in to view this organization.</div>
  }

  if (loading) {
    return <div className="p-6">Loading organization...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>
  }

  if (!organization) {
    return <div className="p-6">Organization not found.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link 
          href="/admin/organizations"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Organizations
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900">{organization.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="text-sm text-gray-900">{organization.slug}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Domain</dt>
                <dd className="text-sm text-gray-900">{organization.domain || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Subscription Plan</dt>
                <dd className="text-sm text-gray-900">{organization.subscriptionPlan}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Max Users</dt>
                <dd className="text-sm text-gray-900">{organization.maxUsers}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(organization.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(organization.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Active Users</dt>
                <dd className="text-sm text-gray-900">{organization.OrganizationUser.length}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/admin/organizations/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Organization
              </Link>
              <Link
                href={`/admin/organizations/${id}/users`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Users
              </Link>
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Organization
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Users */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
        <div className="space-y-3">
          {organization.OrganizationUser.map((orgUser) => (
            <div key={orgUser.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {orgUser.User_OrganizationUser_userIdToUser.name?.charAt(0) || 
                     orgUser.User_OrganizationUser_userIdToUser.email?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {orgUser.User_OrganizationUser_userIdToUser.name || 'No name'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {orgUser.User_OrganizationUser_userIdToUser.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {orgUser.role}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Joined: {orgUser.joinedAt ? new Date(orgUser.joinedAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          ))}
          {organization.OrganizationUser.length === 0 && (
            <p className="text-gray-500 text-center py-4">No team members found</p>
          )}
        </div>
      </div>

      {/* Organization Stats */}
      {organization.stats && (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{organization.stats.ideas}</p>
              <p className="text-sm text-gray-500">Ideas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{organization.stats.contentDrafts}</p>
              <p className="text-sm text-gray-500">Drafts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{organization.stats.contentItems}</p>
              <p className="text-sm text-gray-500">Content Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{organization.stats.deliveryPlans}</p>
              <p className="text-sm text-gray-500">Delivery Plans</p>
            </div>
          </div>
        </div>
      )}

      {/* Organization Deletion Modal */}
      {organization && (
        <OrganizationDeletionModal
          isOpen={deleteModalOpen}
          onClose={handleDeleteModalClose}
          onConfirm={handleDeleteConfirm}
          organization={organization}
          isLoading={isDeleting}
        />
      )}

      {/* Error Display */}
      {deleteError && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
