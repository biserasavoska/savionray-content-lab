import Link from 'next/link'
import Button from '@/components/ui/common/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            404 - Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you are looking for does not exist.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 