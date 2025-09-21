import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'

import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DeliveryPlanDetails from '@/components/delivery/DeliveryPlanDetails'

interface DeliveryPlanPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: 'Delivery Plan Details',
  description: 'View and manage delivery plan details',
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function DeliveryPlanPage({ params }: DeliveryPlanPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  if (!isAdmin(session)) {
    redirect('/ready-content')
  }

  try {
    const plan = await prisma.contentDeliveryPlan.findUnique({
      where: {
        id: params.id,
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            Idea: {
              include: {
                ContentDraft: true,
              },
            },
          },
          orderBy: {
            priority: 'asc',
          },
        },
        organization: {
          select: {
            name: true,
            primaryColor: true,
          },
        },
      },
    })

    if (!plan) {
      notFound()
    }

    return (
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <DeliveryPlanDetails plan={plan} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching delivery plan:', error)
    notFound()
  }
}
