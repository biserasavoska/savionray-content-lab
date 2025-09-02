'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/common/Dialog'
import Button from '@/components/ui/common/Button'
import Alert, { AlertDescription } from '@/components/ui/common/Alert'
import Badge from '@/components/ui/common/Badge'
import { 
  AlertTriangle, 
  Trash2, 
  Users, 
  FileText, 
  Calendar, 
  Upload,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

export interface OrganizationDeletionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  organization: {
    id: string
    name: string
    slug: string
    userCount: number
    stats: {
      ideas: number
      contentDrafts: number
      contentItems: number
      deliveryPlans: number
      scheduledPosts: number
      feedback: number
      uploads: number
    }
  }
  isLoading?: boolean
}

const OrganizationDeletionModal: React.FC<OrganizationDeletionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  organization,
  isLoading = false
}) => {
  const [step, setStep] = useState(1)
  const [confirmationText, setConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalContent = organization.stats.ideas + 
                      organization.stats.contentDrafts + 
                      organization.stats.contentItems + 
                      organization.stats.deliveryPlans + 
                      organization.stats.scheduledPosts + 
                      organization.stats.feedback + 
                      organization.stats.uploads

  const hasUsers = organization.userCount > 0
  const hasContent = totalContent > 0
  const canDelete = !hasContent // Allow deletion even with users - cascade deletion will handle it

  const handleConfirm = async () => {
    if (step === 1) {
      setStep(2)
      return
    }

    if (confirmationText !== organization.name) {
      setError('Organization name does not match')
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      await onConfirm()
      onClose()
      // Reset state
      setStep(1)
      setConfirmationText('')
      setIsDeleting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization')
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      onClose()
      setStep(1)
      setConfirmationText('')
      setError(null)
    }
  }

  const getStatusIcon = (hasIssue: boolean) => {
    return hasIssue ? (
      <XCircle className="h-5 w-5 text-red-500" />
    ) : (
      <CheckCircle className="h-5 w-5 text-green-500" />
    )
  }

  const getStatusText = (hasIssue: boolean, message: string) => {
    return (
      <span className={hasIssue ? 'text-red-700' : 'text-green-700'}>
        {message}
      </span>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            Delete Organization
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please review the details below carefully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Organization Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Organization Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Name:</span>
                <span>{organization.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Slug:</span>
                <Badge variant="outline">@{organization.slug}</Badge>
              </div>
            </div>
          </div>

          {/* Deletion Requirements Check */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Deletion Requirements</h3>
            
            <div className="space-y-3">
              {/* Users Check */}
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {hasUsers ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Active Users</span>
                    <Badge variant={hasUsers ? 'secondary' : 'secondary'}>
                      {organization.userCount}
                    </Badge>
                  </div>
                  {getStatusText(false, 
                    hasUsers 
                      ? `Organization has ${organization.userCount} active users - they will be removed during deletion`
                      : 'No active users found'
                  )}
                </div>
              </div>

              {/* Content Check */}
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {getStatusIcon(hasContent)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Content Data</span>
                    <Badge variant={hasContent ? 'destructive' : 'secondary'}>
                      {totalContent} items
                    </Badge>
                  </div>
                  {getStatusText(hasContent,
                    hasContent
                      ? 'Organization has content that must be archived or transferred first'
                      : 'No content data found'
                  )}
                </div>
              </div>
            </div>

            {/* Content Breakdown */}
            {hasContent && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-3">Content Breakdown</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {organization.stats.ideas > 0 && (
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-red-600" />
                      <span>Ideas: {organization.stats.ideas}</span>
                    </div>
                  )}
                  {organization.stats.contentDrafts > 0 && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-600" />
                      <span>Drafts: {organization.stats.contentDrafts}</span>
                    </div>
                  )}
                  {organization.stats.contentItems > 0 && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-600" />
                      <span>Content Items: {organization.stats.contentItems}</span>
                    </div>
                  )}
                  {organization.stats.deliveryPlans > 0 && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-600" />
                      <span>Delivery Plans: {organization.stats.deliveryPlans}</span>
                    </div>
                  )}
                  {organization.stats.scheduledPosts > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-600" />
                      <span>Scheduled Posts: {organization.stats.scheduledPosts}</span>
                    </div>
                  )}
                  {organization.stats.feedback > 0 && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-red-600" />
                      <span>Feedback: {organization.stats.feedback}</span>
                    </div>
                  )}
                  {organization.stats.uploads > 0 && (
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-red-600" />
                      <span>Uploads: {organization.stats.uploads}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confirmation Step */}
          {step === 2 && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Final Confirmation Required</strong><br />
                  Type the organization name <strong>"{organization.name}"</strong> to confirm deletion.
                </AlertDescription>
              </Alert>

              <div>
                <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  id="confirmation"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={`Type "${organization.name}" to confirm`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={isDeleting}
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          
          {!canDelete ? (
            <Button
              variant="destructive"
              disabled
              className="opacity-50 cursor-not-allowed"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cannot Delete
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting || (step === 2 && confirmationText !== organization.name)}
            >
              {isDeleting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {step === 1 ? 'Continue to Confirmation' : 'Delete Organization'}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default OrganizationDeletionModal
