'use client'

export default function TestSimplePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Simple Test Page</h1>
      <p>This is a basic test page to verify routing works.</p>
      <button 
        onClick={() => alert('Button clicked!')}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Test Button
      </button>
    </div>
  )
}
