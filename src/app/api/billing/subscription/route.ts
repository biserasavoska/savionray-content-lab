import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateSessionUser } from '@/lib/utils/session-validation'

export async function GET(request: NextRequest) {
  try {
    // 🚨 CRITICAL: Use session validation utility to get REAL user ID
    const validation = await validateSessionUser()
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }
    
    // Use the REAL user ID from database, not the session ID
    const realUserId = validation.realUserId
    
    console.log('🔍 DEBUG: Session validation successful:', {
      sessionUserId: validation.sessionUserId,
      databaseUserId: realUserId,
      userEmail: validation.userEmail,
      userRole: validation.userRole
    })

    // Get user with organization through OrganizationUser - ✅ Use REAL user ID
    const userWithOrg = await prisma.user.findUnique({
      where: { id: realUserId },
      include: { 
        organizationUsers: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!userWithOrg?.organizationUsers?.[0]?.organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const organization = userWithOrg.organizationUsers[0].organization

    // Get subscription plan details
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { 
        name: organization.subscriptionPlan,
        isActive: true
      }
    })

    return NextResponse.json({
      subscription: {
        id: organization.id,
        status: organization.subscriptionStatus,
        planName: organization.subscriptionPlan,
        planPrice: plan?.price || 0,
        billingCycle: organization.billingCycle,
        trialEndsAt: organization.trialEndsAt,
        maxUsers: organization.maxUsers,
        maxStorageGB: organization.maxStorageGB,
        organizationId: organization.id
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
    // 🚨 CRITICAL: Use session validation utility to get REAL user ID
    const validation = await validateSessionUser()
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }
    
    // Use the REAL user ID from database, not the session ID
    const realUserId = validation.realUserId
    
    console.log('🔍 DEBUG: Session validation successful:', {
      sessionUserId: validation.sessionUserId,
      databaseUserId: realUserId,
      userEmail: validation.userEmail,
      userRole: validation.userRole
    })

    const body = await request.json()
    const { planType, billingCycle = 'MONTHLY' } = body

    if (!planType) {
      return NextResponse.json(
        { error: 'Plan type is required' },
        { status: 400 }
      )
    }

    // Get user with organization through OrganizationUser - ✅ Use REAL user ID
    const userWithOrg = await prisma.user.findUnique({
      where: { id: realUserId },
      include: { 
        organizationUsers: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!userWithOrg?.organizationUsers?.[0]?.organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const organization = userWithOrg.organizationUsers[0].organization

    // Check if user has permission to manage billing
    if (userWithOrg.organizationUsers[0].role !== 'ADMIN' && userWithOrg.organizationUsers[0].role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage billing' },
        { status: 403 }
      )
    }

    // Update organization subscription
    const updatedOrganization = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        subscriptionPlan: planType,
        subscriptionStatus: 'ACTIVE',
        billingCycle: billingCycle as 'MONTHLY' | 'YEARLY',
        trialEndsAt: null // End trial when upgrading
      }
    })

    // Get updated plan details
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { 
        name: planType,
        isActive: true
      }
    })

    return NextResponse.json({
      subscription: {
        id: updatedOrganization.id,
        status: updatedOrganization.subscriptionStatus,
        planName: updatedOrganization.subscriptionPlan,
        planPrice: plan?.price || 0,
        billingCycle: updatedOrganization.billingCycle,
        trialEndsAt: updatedOrganization.trialEndsAt,
        maxUsers: updatedOrganization.maxUsers,
        maxStorageGB: updatedOrganization.maxStorageGB,
        organizationId: updatedOrganization.id
      },
      message: 'Subscription updated successfully'
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // 🚨 CRITICAL: Use session validation utility to get REAL user ID
    const validation = await validateSessionUser()
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }
    
    // Use the REAL user ID from database, not the session ID
    const realUserId = validation.realUserId
    
    console.log('🔍 DEBUG: Session validation successful:', {
      sessionUserId: validation.sessionUserId,
      databaseUserId: realUserId,
      userEmail: validation.userEmail,
      userRole: validation.userRole
    })

    const body = await request.json()
    const { action, planType, cancelAtPeriodEnd } = body

    // Get user with organization through OrganizationUser - ✅ Use REAL user ID
    const userWithOrg = await prisma.user.findUnique({
      where: { id: realUserId },
      include: { 
        organizationUsers: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!userWithOrg?.organizationUsers?.[0]?.organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const organization = userWithOrg.organizationUsers[0].organization

    // Check if user has permission to manage billing
    if (userWithOrg.organizationUsers[0].role !== 'ADMIN' && userWithOrg.organizationUsers[0].role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage billing' },
        { status: 403 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'upgrade':
        if (!planType) {
          return NextResponse.json(
            { error: 'Plan type is required for upgrade' },
            { status: 400 }
          )
        }
        updateData = {
          subscriptionPlan: planType,
          subscriptionStatus: 'ACTIVE',
          trialEndsAt: null
        }
        break

      case 'downgrade':
        if (!planType) {
          return NextResponse.json(
            { error: 'Plan type is required for downgrade' },
            { status: 400 }
          )
        }
        updateData = {
          subscriptionPlan: planType,
          subscriptionStatus: 'ACTIVE'
        }
        break

      case 'cancel':
        updateData = {
          subscriptionStatus: 'CANCELLED'
        }
        break

      case 'reactivate':
        updateData = {
          subscriptionStatus: 'ACTIVE'
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: organization.id },
      data: updateData
    })

    // Get updated plan details
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { 
        name: updatedOrganization.subscriptionPlan,
        isActive: true
      }
    })

    return NextResponse.json({
      subscription: {
        id: updatedOrganization.id,
        status: updatedOrganization.subscriptionStatus,
        planName: updatedOrganization.subscriptionPlan,
        planPrice: plan?.price || 0,
        billingCycle: updatedOrganization.billingCycle,
        trialEndsAt: updatedOrganization.trialEndsAt,
        maxUsers: updatedOrganization.maxUsers,
        maxStorageGB: updatedOrganization.maxStorageGB,
        organizationId: updatedOrganization.id
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