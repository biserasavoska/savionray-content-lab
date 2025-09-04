'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import { isAdmin } from '@/lib/auth'
import { logger } from '@/lib/utils/logger'
import { PageLayout, PageHeader, PageContent, PageSection } from '@/components/ui/layout/PageLayout'
import AdminNavigation from '@/components/admin/AdminNavigation'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    isOpen: boolean
    user: User | null
    newPassword: string
    loading: boolean
  }>({
    isOpen: false,
    user: null,
    newPassword: '',
    loading: false
  })

  useEffect(() => {
    if (session && isAdmin(session)) {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordModal.user || !resetPasswordModal.newPassword) return

    try {
      setResetPasswordModal(prev => ({ ...prev, loading: true }))
      
      const response = await fetch(`/api/admin/users/${resetPasswordModal.user.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: resetPasswordModal.newPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reset password')
      }

      alert(`Password reset successfully for ${resetPasswordModal.user.email}`)
      setResetPasswordModal({
        isOpen: false,
        user: null,
        newPassword: '',
        loading: false
      })
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to reset password'}`)
      setResetPasswordModal(prev => ({ ...prev, loading: false }))
    }
  }

  if (!session || !isAdmin(session)) {
    return (
      <PageLayout size="full">
        <div className="text-center py-12">
          <p>Access denied. Admin privileges required.</p>
        </div>
      </PageLayout>
    )
  }

  if (loading) {
    return (
      <PageLayout size="full">
        <AdminNavigation />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout size="full">
        <AdminNavigation />
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUsers}>Try Again</Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout size="full">
      <AdminNavigation />
      <PageHeader
        title="User Management"
        description="Manage user accounts and reset passwords"
      />
      <PageContent>
        <PageSection>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">All Users ({users.length})</h2>
            </CardHeader>
            <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setResetPasswordModal({
                          isOpen: true,
                          user,
                          newPassword: '',
                          loading: false
                        })}
                      >
                        Reset Password
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
                    </CardContent>
          </Card>
        </PageSection>
      </PageContent>

      {/* Reset Password Modal */}
      {resetPasswordModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reset Password for {resetPasswordModal.user?.email}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={resetPasswordModal.newPassword}
                  onChange={(e) => setResetPasswordModal(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password (min 8 characters)"
                  minLength={8}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setResetPasswordModal({
                    isOpen: false,
                    user: null,
                    newPassword: '',
                    loading: false
                  })}
                  disabled={resetPasswordModal.loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={resetPasswordModal.loading || resetPasswordModal.newPassword.length < 8}
                >
                  {resetPasswordModal.loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
