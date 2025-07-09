#!/bin/bash

echo "Marking all migrations as applied..."

# List of all migration IDs
migrations=(
  "20250606203826_init"
  "20250609125356_add_idea_publishing_fields"
  "20250609184452_add_content_delivery_plans"
  "20250609202443_add_target_month_to_delivery_plan"
  "20250609212119_update_approval_workflow_statuses"
  "20250609221254_add_idea_comments"
  "20250613150455_add_visual_drafts"
  "20250613214322_add_visual_draft_model"
  "20250623105240_add_user_password"
  "20250624183306_add_old_enum_values_for_migration"
  "20250624190806_update_status_enums"
  "20250702185451_add_unified_content_item_models"
  "20250702205404_remove_visual_draft"
  "20250707074944_add_multi_tenant_models"
  "20250708085153_add_organization_invitations"
  "20250708153726_add_enhanced_feedback_fields"
)

# Mark each migration as applied
for migration in "${migrations[@]}"; do
  echo "Marking $migration as applied..."
  npx prisma migrate resolve --applied "$migration"
done

echo "All migrations marked as applied!" 