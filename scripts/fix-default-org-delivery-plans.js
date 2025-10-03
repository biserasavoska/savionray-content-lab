#!/usr/bin/env node

/**
 * Script to fix delivery plans that have 'default-org-id' as organizationId
 * This is a one-time migration to clean up legacy data
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDefaultOrgDeliveryPlans() {
  console.log('🔍 Searching for delivery plans with default-org-id...');
  
  try {
    // Find delivery plans with 'default-org-id'
    const problematicPlans = await prisma.contentDeliveryPlan.findMany({
      where: {
        organizationId: 'default-org-id'
      },
      include: {
        organization: true
      }
    });

    console.log(`Found ${problematicPlans.length} delivery plans with default-org-id`);

    if (problematicPlans.length === 0) {
      console.log('✅ No problematic delivery plans found');
      return;
    }

    // Get the first available organization (SavionRay)
    const savionRayOrg = await prisma.organization.findFirst({
      where: {
        name: 'SavionRay'
      }
    });

    if (!savionRayOrg) {
      console.error('❌ SavionRay organization not found');
      return;
    }

    console.log(`📝 Migrating ${problematicPlans.length} delivery plans to SavionRay organization (${savionRayOrg.id})`);

    // Update all problematic plans to use SavionRay organization
    const updateResult = await prisma.contentDeliveryPlan.updateMany({
      where: {
        organizationId: 'default-org-id'
      },
      data: {
        organizationId: savionRayOrg.id
      }
    });

    console.log(`✅ Successfully updated ${updateResult.count} delivery plans`);
    console.log(`📋 Updated plans:`);
    
    for (const plan of problematicPlans) {
      console.log(`   - ${plan.name} (${plan.id})`);
    }

  } catch (error) {
    console.error('❌ Error fixing default-org-id delivery plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
fixDefaultOrgDeliveryPlans()
  .then(() => {
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
