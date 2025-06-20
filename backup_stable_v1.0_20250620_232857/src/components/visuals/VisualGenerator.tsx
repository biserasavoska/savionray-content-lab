import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface VisualGeneratorProps {
  ideaId: string
}

export default function VisualGenerator({ ideaId }: VisualGeneratorProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [service, setService] = useState('unsplash')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [imageMetadata, setImageMetadata] = useState<any>(null)

  const generateVisual = async () => {
    if (service === 'unsplash' && !searchQuery) {
      setError('Please enter a search query')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/visuals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId,
          service,
          searchQuery,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
      setImageMetadata(data.metadata)
    } catch (error) {
      console.error('Error generating visual:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate visual')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return <div>Please sign in to access this feature.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="service" className="block text-sm font-medium text-gray-700">
          Visual Source
        </label>
        <select
          id="service"
          name="service"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option value="unsplash">Unsplash Stock Photos</option>
          <option value="canva" disabled>Canva Templates (Coming Soon)</option>
          <option value="adobe" disabled>Adobe Creative Cloud (Coming Soon)</option>
        </select>
      </div>

      {service === 'unsplash' && (
        <div>
          <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700">
            Search Query
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="searchQuery"
              name="searchQuery"
              className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter keywords to search for photos..."
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={generateVisual}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search Photos'}
        </button>
      </div>

      {generatedImage && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Selected Photo</h3>
          <div className="mt-2">
            <img
              src={generatedImage}
              alt="Selected photo"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
            {imageMetadata?.photographer && (
              <div className="mt-2 text-sm text-gray-500">
                Photo by{' '}
                <a
                  href={imageMetadata.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-500"
                >
                  {imageMetadata.photographer}
                </a>
                {' '}on Unsplash
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 