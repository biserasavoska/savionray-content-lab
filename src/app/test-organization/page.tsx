'use client'

import { useState } from 'react'

import OrganizationSelector from '@/components/content/OrganizationSelector'
import ContentCreationFormWithOrg from '@/components/content/ContentCreationFormWithOrg'

export default function TestOrganizationPage() {
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Organization Assignment Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Organization Selector */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Organization Selector Test</h2>
          
          <OrganizationSelector
            selectedOrganizationId={selectedOrg}
            onOrganizationChange={setSelectedOrg}
            showLabel={true}
            className="mb-4"
          />
          
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>Selected Organization ID:</strong> {selectedOrg || 'None'}
            </p>
          </div>
        </div>

        {/* Test Content Creation Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Content Creation Form Test</h2>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showForm ? 'Hide Form' : 'Show Form'}
          </button>
          
          {showForm && (
            <ContentCreationFormWithOrg
              showOrganizationSelector={true}
              allowOrganizationOverride={true}
              onSubmit={async (data) => {
                console.log('Form submitted with data:', data)
                alert(`Content would be created for organization: ${data.organizationId}`)
              }}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      </div>

      {/* API Test Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">API Test</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Test Organization List API:</h3>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              GET /api/organization/list
            </code>
            <p className="text-sm text-gray-600 mt-1">
              This endpoint returns organizations the current user has access to.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Test Content Item Creation API:</h3>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              POST /api/content-items
            </code>
            <p className="text-sm text-gray-600 mt-1">
              This endpoint supports both automatic and manual organization assignment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 