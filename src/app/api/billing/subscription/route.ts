import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user with organization through OrganizationUser
    const userWithOrg = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!userWithOrg?.organizations?.[0]?.organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const organization = userWithOrg.organizations[0].organization

    // Get current subscription
    const subscription = await prisma.subscription.findFirst({
      where: { organizationId: organization.id },
      include: {
        plan: true,
        organization: true
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        message: 'No active subscription found'
      })
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.planId,
        planName: subscription.plan.name,
        planPrice: subscription.plan.price,
        billingCycle: subscription.billingCycle,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        organizationId: subscription.organizationId
      }
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId, billingCycle = 'monthly' } = body

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Get user with organization through OrganizationUser
    const userWithOrg = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!userWithOrg?.organizations?.[0]?.organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const organization = userWithOrg.organizations[0].organization

    // Verify plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Check if user has permission to manage billing
    if (userWithOrg.role !== 'ADMIN' && userWithOrg.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage billing' },
        { status: 403 }
      )
    }

    // In a real implementation, this would integrate with Stripe
    // For now, we'll create a mock subscription
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const subscription = await prisma.subscription.create({
      data: {
        organizationId: organization.id,
        planId: planId,
        status: 'ACTIVE',
        billingCycle: billingCycle as 'monthly' | 'yearly',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: `sub_${Date.now()}`, // Mock Stripe ID
        stripeCustomerId: `cus_${Date.now()}`, // Mock Stripe customer ID
        metadata: {}
      },
      include: {
        plan: true
      }
    })

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.planId,
        planName: subscription.plan.name,
        planPrice: subscription.plan.price,
        billingCycle: subscription.billingCycle,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      },
      message: 'Subscription created successfully'
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, planId, cancelAtPeriodEnd } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Get user with organization through OrganizationUser
    const userWithOrg = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!userWithOrg?.organizations?.[0]?.organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const organization = userWithOrg.organizations[0].organization

    // Check if user has permission to manage billing
    if (userWithOrg.role !== 'ADMIN' && userWithOrg.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage billing' },
        { status: 403 }
      )
    }

    // Get current subscription
    const currentSubscription = await prisma.subscription.findFirst({
      where: { organizationId: organization.id },
      orderBy: { createdAt: 'desc' }
    })

    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    let updatedSubscription

    switch (action) {
      case 'upgrade':
        if (!planId) {
          return NextResponse.json(
            { error: 'Plan ID is required for upgrade' },
            { status: 400 }
          )
        }

        // Verify new plan exists
        const newPlan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId }
        })

        if (!newPlan) {
          return NextResponse.json(
            { error: 'Invalid plan ID' },
            { status: 400 }
          )
        }

        // In a real implementation, this would update the Stripe subscription
        updatedSubscription = await prisma.subscription.update({
          where: { id: currentSubscription.id },
          data: {
            planId: planId,
            status: 'ACTIVE',
            cancelAtPeriodEnd: false
          },
          include: {
            plan: true
          }
        })
        break

      case 'cancel':
        updatedSubscription = await prisma.subscription.update({
          where: { id: currentSubscription.id },
          data: {
            cancelAtPeriodEnd: true
          },
          include: {
            plan: true
          }
        })
        break

      case 'reactivate':
        updatedSubscription = await prisma.subscription.update({
          where: { id: currentSubscription.id },
          data: {
            cancelAtPeriodEnd: false
          },
          include: {
            plan: true
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        planId: updatedSubscription.planId,
        planName: updatedSubscription.plan.name,
        planPrice: updatedSubscription.plan.price,
        billingCycle: updatedSubscription.billingCycle,
        currentPeriodStart: updatedSubscription.currentPeriodStart,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd
      },
      message: `Subscription ${action} successful`
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
} 