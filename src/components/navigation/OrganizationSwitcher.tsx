'use client'

import React, { useState } from 'react'
import { useOrganization } from '@/lib/contexts/OrganizationContext'
import { ChevronDownIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

export function OrganizationSwitcher() {
  const { currentOrganization, userOrganizations, switchOrganization, isLoading } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)

  if (isLoading || !currentOrganization) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
        <BuildingOfficeIcon className="h-5 w-5" />
        <span>Loading...</span>
      </div>
    )
  }

  if (userOrganizations.length <= 1) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700">
        <BuildingOfficeIcon className="h-5 w-5" />
        <span className="font-medium">{currentOrganization.name}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        <div className="flex items-center space-x-2">
          <BuildingOfficeIcon className="h-5 w-5" />
          <span className="font-medium truncate">{currentOrganization.name}</span>
        </div>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {userOrganizations.map((organization) => (
              <button
                key={organization.id}
                onClick={() => {
                  switchOrganization(organization.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  organization.id === currentOrganization.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{organization.name}</span>
                  {organization.id === currentOrganization.id && (
                    <span className="text-blue-600">✓</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {organization._aggr_count_ideas} ideas • {organization._aggr_count_contentDrafts} drafts
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 