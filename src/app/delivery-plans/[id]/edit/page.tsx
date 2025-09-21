import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'

import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DeliveryPlanEditForm from '@/components/delivery/DeliveryPlanEditForm'

interface EditDeliveryPlanPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: 'Edit Delivery Plan',
  description: 'Edit delivery plan details',
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function EditDeliveryPlanPage({ params }: EditDeliveryPlanPageProps) {
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
          <h1 className="text-2xl font-semibold text-gray-900">Edit Delivery Plan</h1>
          <div className="mt-8">
            <DeliveryPlanEditForm plan={plan} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching delivery plan:', error)
    notFound()
  }
}
