'use client'

import React, { useState } from 'react'

import { useOrganization } from '@/lib/contexts/OrganizationContext'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface EnhancedOrganizationSwitcherProps {
  className?: string
  showStats?: boolean
}

export default function EnhancedOrganizationSwitcher({ 
  className = '',
  showStats = false 
}: EnhancedOrganizationSwitcherProps) {
  const { currentOrganization, userOrganizations, switchOrganization, isLoading } = useOrganization()
  const [isSwitching, setIsSwitching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleOrganizationSwitch = async (organizationId: string) => {
    setIsSwitching(true)
    try {
      await switchOrganization(organizationId)
    } catch (error) {
      console.error('Error switching organization:', error)
    } finally {
      setIsSwitching(false)
      setShowDropdown(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-500">Loading organizations...</span>
      </div>
    )
  }

  if (!currentOrganization) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm text-gray-500">No organization selected</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Current Organization Display */}
        <div className="flex items-center space-x-2">
          {currentOrganization.logo ? (
            <img 
              src={currentOrganization.logo} 
              alt={`${currentOrganization.name} logo`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ 
                backgroundColor: currentOrganization.primaryColor || '#3B82F6' 
              }}
            >
              {currentOrganization.name.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {currentOrganization.name}
              </span>
              <Badge variant="secondary" size="sm">
                {currentOrganization.subscriptionPlan || 'Standard'}
              </Badge>
            </div>
            {showStats && (
              <div className="text-xs text-gray-500">
                {currentOrganization._aggr_count_ideas || 0} ideas • 
                {currentOrganization._aggr_count_contentDrafts || 0} drafts
              </div>
            )}
          </div>
        </div>

        {/* Organization Switcher Button */}
        {userOrganizations.length > 1 && (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isSwitching}
              className="flex items-center space-x-1"
            >
              {isSwitching ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Switching...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="hidden sm:inline">Switch</span>
                </>
              )}
            </Button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Switch Organization</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Select an organization to switch context
                  </p>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {userOrganizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleOrganizationSwitch(org.id)}
                      disabled={org.id === currentOrganization.id || isSwitching}
                      className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                        org.id === currentOrganization.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        {org.logo ? (
                          <img 
                            src={org.logo} 
                            alt={`${org.name} logo`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                            style={{ 
                              backgroundColor: org.primaryColor || '#3B82F6' 
                            }}
                          >
                            {org.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 truncate">
                              {org.name}
                            </span>
                            {org.id === currentOrganization.id && (
                              <Badge variant="primary" size="sm">Current</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" size="sm">
                              {org.subscriptionPlan || 'Standard'}
                            </Badge>
                            <Badge 
                              variant={org.subscriptionStatus === 'active' ? 'success' : 'warning'} 
                              size="sm"
                            >
                              {org.subscriptionStatus || 'Unknown'}
                            </Badge>
                          </div>
                          
                          {showStats && (
                            <div className="text-xs text-gray-500 mt-1">
                              {org._aggr_count_ideas || 0} ideas • 
                              {org._aggr_count_contentDrafts || 0} drafts • 
                              {org._aggr_count_contentItems || 0} published
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="p-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/admin/organizations'}
                    className="w-full"
                  >
                    Manage Organizations
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
} 