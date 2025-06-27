'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  LightBulbIcon, 
  EyeIcon, 
  DocumentTextIcon, 
  FolderIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const { data: session } = useSession()

  const quickActions = [
    {
      name: 'Create New Idea',
      href: '/ideas/new',
      icon: PlusIcon,
      description: 'Submit a new content idea',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Review Content',
      href: '/content-review',
      icon: EyeIcon,
      description: 'Review pending content',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'View Published',
      href: '/published',
      icon: FolderIcon,
      description: 'See published content',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      name: 'Delivery Plans',
      href: '/delivery-plans',
      icon: ChartBarIcon,
      description: 'Manage delivery plans',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Savion Ray Content Lab
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access the content management system.
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {session.user.name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your content today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.name}
              href={action.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${action.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <LightBulbIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Ideas</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <EyeIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ready Content</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <FolderIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Published</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">New idea "AI in Marketing" submitted</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Content "Social Media Strategy" approved</p>
              <p className="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">"Brand Guidelines" published</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
