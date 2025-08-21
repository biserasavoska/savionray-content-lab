'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Organization {
  id: string
  name: string
  slug: string
  domain: string
  primaryColor: string
  subscriptionPlan: string
  maxUsers: number
  createdAt: string
  updatedAt: string
}

export default function OrganizationViewPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
