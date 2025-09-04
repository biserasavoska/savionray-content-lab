import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import OrganizationManagementList from './OrganizationManagementList'
import AdminNavigation from '@/components/admin/AdminNavigation'

import { authOptions, isAdmin } from '@/lib/auth'
import Button from '@/components/ui/common/Button'
import { PageLayout, PageHeader, PageContent, PageSection } from '@/components/ui/layout/PageLayout'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function AdminOrganizationsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isAdmin(session)) {
    redirect('/dashboard')
  }

  return (
    <PageLayout size="full">
      <AdminNavigation />
      <PageHeader
        title="Organization Management"
        description="Manage all client organizations and their settings"
        actions={
          <Link href="/admin/organizations/create">
            <Button variant="default" size="lg">
              Create Organization
            </Button>
          </Link>
        }
      />
      <PageContent>
        <PageSection>
          <div className="bg-white shadow rounded-lg">
            <OrganizationManagementList />
          </div>
        </PageSection>
      </PageContent>
    </PageLayout>
  )
} 