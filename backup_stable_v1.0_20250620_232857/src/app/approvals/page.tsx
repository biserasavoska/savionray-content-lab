'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import ContentGrid from '@/components/ContentGrid'

const SAMPLE_DATA = [
  {
    title: 'EL/WLA Marketing Seminar (22-24 January)',
    confirmed: true,
    description: 'Poll could be: "Which lottery marketing trend are you most curious about?"',
    publishDate: '2024-05-31',
    savedForLater: false,
    mediaType: 'Poll',
    status: 'Approved'
  }
]

export default function ApprovalsPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Content Grid */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Content Approvals</h3>
                <div className="mt-1 relative rounded-md shadow-sm max-w-xs">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="block w-full rounded-md border-gray-300 pr-10 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    placeholder="Search records"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Status</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Topic</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Publishing Date & Time</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Social Media Post</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {SAMPLE_DATA.map((item, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{item.title}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">{item.description}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.publishDate}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <button className="text-red-600 hover:text-red-900">View Post</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 