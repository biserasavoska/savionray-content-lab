import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/utils/logger";

export interface OrganizationContext {
  organizationId: string;
  userId: string;
  userRole: string;
  organizationRole: string;
}

/**
 * Get the current user's organization context
 * This is the core function for multi-tenant data isolation
 */
export async function getOrganizationContext(): Promise<OrganizationContext | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      logger.warn("No authenticated user found for organization context");
      return null;
    }

    // Get user with their organization membership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          where: { isActive: true },
          include: {
            organization: true
          }
        }
      }
    });

    if (!user) {
      logger.warn(`User not found: ${session.user.email}`);
      return null;
    }

    // For now, we'll use the first active organization
    // In Phase 3, we'll add organization switching
    const organizationUser = user.organizations[0];
    
    if (!organizationUser) {
      logger.warn(`No active organization found for user: ${session.user.email}`);
      return null;
    }

    return {
      organizationId: organizationUser.organizationId,
      userId: user.id,
      userRole: user.role,
      organizationRole: organizationUser.role
    };
  } catch (error) {
    logger.error("Error getting organization context", error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Require organization context - throws error if not available
 */
export async function requireOrganizationContext(): Promise<OrganizationContext> {
  const context = await getOrganizationContext();
  
  if (!context) {
    throw new Error("Organization context required but not available");
  }
  
  return context;
}

/**
 * Check if user has permission for a specific action
 */
export function hasPermission(
  organizationRole: string,
  requiredRole: string
): boolean {
  const roleHierarchy = {
    'OWNER': 4,
    'ADMIN': 3,
    'MANAGER': 2,
    'MEMBER': 1,
    'VIEWER': 0
  };

  const userLevel = roleHierarchy[organizationRole as keyof typeof roleHierarchy] ?? 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 0;

  return userLevel >= requiredLevel;
}

/**
 * Create organization-aware Prisma query filters
 */
export function createOrgFilter(organizationId: string) {
  return {
    organizationId: organizationId
  };
}

/**
 * Validate that a resource belongs to the user's organization
 */
export async function validateOrganizationAccess(
  resourceId: string,
  resourceType: 'idea' | 'contentDraft' | 'media' | 'contentDeliveryPlan' | 'contentItem',
  organizationId: string
): Promise<boolean> {
  try {
    let resource: { organizationId: string } | null = null;
    switch (resourceType) {
      case 'idea':
        resource = await prisma.idea.findUnique({
          where: { id: resourceId },
          select: { organizationId: true }
        });
        break;
      case 'contentDraft':
        resource = await prisma.contentDraft.findUnique({
          where: { id: resourceId },
          select: { organizationId: true }
        });
        break;
      case 'media':
        resource = await prisma.media.findUnique({
          where: { id: resourceId },
          select: { organizationId: true }
        });
        break;
      case 'contentDeliveryPlan':
        resource = await prisma.contentDeliveryPlan.findUnique({
          where: { id: resourceId },
          select: { organizationId: true }
        });
        break;
      case 'contentItem':
        resource = await prisma.contentItem.findUnique({
          where: { id: resourceId },
          select: { organizationId: true }
        });
        break;
      default:
        return false;
    }

    if (!resource) {
      return false;
    }

    return resource.organizationId === organizationId;
  } catch (error) {
    logger.error(`Error validating organization access for ${resourceType}`, error instanceof Error ? error : new Error(String(error)), { resourceId });
    return false;
  }
} 