import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/utils/logger";
import { NextRequest } from "next/server";

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
export async function getOrganizationContext(
  organizationId?: string, 
  request?: NextRequest
): Promise<OrganizationContext | null> {
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
        organizationUsers: {
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

    let organizationUser;
    
    if (organizationId) {
      // Use the specified organization if provided
      organizationUser = user.organizationUsers.find((ou: any) => ou.organizationId === organizationId);
      if (!organizationUser) {
        logger.warn(`User ${session.user.email} does not have access to organization ${organizationId}`);
        return null;
      }
    } else {
      // Try to get the selected organization from request cookies/headers
      let selectedOrganizationId: string | undefined;
      
      if (request) {
        // Check for organization in cookies
        const orgCookie = request.cookies.get('selectedOrganizationId');
        if (orgCookie?.value) {
          selectedOrganizationId = orgCookie.value;
        }
        
        // Check for organization in headers (fallback)
        if (!selectedOrganizationId) {
          const orgHeader = request.headers.get('x-selected-organization');
          if (orgHeader) {
            selectedOrganizationId = orgHeader;
          }
        }
      }
      
      if (selectedOrganizationId) {
        // Use the selected organization from client
        organizationUser = user.organizationUsers.find((ou: any) => ou.organizationId === selectedOrganizationId);
        if (organizationUser) {
          logger.info(`Using selected organization: ${organizationUser.organization.name}`, {
            userId: user.id,
            userEmail: session.user.email,
            organizationId: selectedOrganizationId
          });
        }
      }
      
      // Fall back to the first active organization if no selected organization found
      if (!organizationUser) {
        organizationUser = user.organizationUsers[0];
        if (organizationUser) {
          logger.info(`Using first organization: ${organizationUser.organization.name}`, {
            userId: user.id,
            userEmail: session.user.email,
            organizationId: organizationUser.organizationId
          });
        }
      }
    }
    
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
 * Get organization context with support for manual override
 * This allows for both automatic and manual organization assignment
 */
export async function getOrganizationContextWithOverride(
  manualOrganizationId?: string,
  request?: NextRequest
): Promise<OrganizationContext | null> {
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
        organizationUsers: {
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

    let organizationUser;
    
    // Priority 1: Manual override (highest priority)
    if (manualOrganizationId) {
      organizationUser = user.organizationUsers.find((ou: any) => ou.organizationId === manualOrganizationId);
      if (!organizationUser) {
        logger.warn(`User ${session.user.email} does not have access to manually specified organization ${manualOrganizationId}`);
        return null;
      }
      logger.info(`Using manually specified organization: ${organizationUser.organization.name}`, {
        userId: user.id,
        userEmail: session.user.email,
        organizationId: manualOrganizationId,
        source: 'manual_override'
      });
    } else {
      // Priority 2: Client-selected organization from cookies/headers
      let selectedOrganizationId: string | undefined;
      
      if (request) {
        // Check for organization in cookies
        const orgCookie = request.cookies.get('selectedOrganizationId');
        if (orgCookie?.value) {
          selectedOrganizationId = orgCookie.value;
        }
        
        // Check for organization in headers (fallback)
        if (!selectedOrganizationId) {
          const orgHeader = request.headers.get('x-selected-organization');
          if (orgHeader) {
            selectedOrganizationId = orgHeader;
          }
        }
      }
      
      if (selectedOrganizationId) {
        organizationUser = user.organizationUsers.find((ou: any) => ou.organizationId === selectedOrganizationId);
        if (organizationUser) {
          logger.info(`Using client-selected organization: ${organizationUser.organization.name}`, {
            userId: user.id,
            userEmail: session.user.email,
            organizationId: selectedOrganizationId,
            source: 'client_selection'
          });
        }
      }
      
      // Priority 3: Fall back to the first active organization
      if (!organizationUser) {
        organizationUser = user.organizationUsers[0];
        if (organizationUser) {
          logger.info(`Using first available organization: ${organizationUser.organization.name}`, {
            userId: user.id,
            userEmail: session.user.email,
            organizationId: organizationUser.organizationId,
            source: 'fallback'
          });
        }
      }
    }
    
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
    logger.error("Error getting organization context with override", error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Require organization context - throws error if not available
 */
export async function requireOrganizationContext(organizationId?: string): Promise<OrganizationContext> {
  const context = await getOrganizationContext(organizationId);
  
  if (!context) {
    throw new Error("Organization context required but not available");
  }
  
  return context;
}

/**
 * Require organization context with manual override support
 */
export async function requireOrganizationContextWithOverride(manualOrganizationId?: string): Promise<OrganizationContext> {
  const context = await getOrganizationContextWithOverride(manualOrganizationId);
  
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