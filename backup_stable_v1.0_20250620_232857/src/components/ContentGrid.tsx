import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface ContentGridProps {
  title: string
  items: any[]
  onAddNew?: () => void
  addButtonText?: string
}

export default function ContentGrid({ 
  title,
  items = [],
  onAddNew,
  addButtonText = "Add an Idea"
}: ContentGridProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex-grow focus-within:z-10">
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="block w-full rounded-md border border-gray-300 pl-3 pr-12 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  placeholder="Search for records"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {onAddNew && (
                <button
                  type="button"
                  onClick={onAddNew}
                  className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  {addButtonText}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-8 overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Content Idea
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Confirmed Content
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Description
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Date and Time of publishing
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Save for Later
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Media Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {item.title}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <button
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          item.confirmed ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={item.confirmed}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            item.confirmed ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {item.description}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {item.publishDate}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <button
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          item.savedForLater ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={item.savedForLater}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            item.savedForLater ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {item.mediaType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 