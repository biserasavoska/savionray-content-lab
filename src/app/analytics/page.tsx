'use client'

import { useSession } from 'next-auth/react'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { PageLayout, PageHeader, PageContent, PageSection } from '@/components/ui/layout/PageLayout'
import { Card, CardHeader, CardContent } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'

export default function AnalyticsPage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        title="Analytics Dashboard"
        description="View insights and metrics about your content performance and team productivity."
      />
      
      <PageContent>
        <PageSection>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Content Analytics</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Analytics data will appear here as you create and publish content.
                </p>
                <div className="mt-6">
                  <Button variant="default">
                    View Test Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageSection>
      </PageContent>
    </PageLayout>
  )
}
