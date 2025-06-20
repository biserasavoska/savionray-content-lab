import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Content Not Found</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>The content you're looking for could not be found.</p>
          </div>
          <div className="mt-5">
            <Link
              href="/ready-content"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
            >
              Back to Content List
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 