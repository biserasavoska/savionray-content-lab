#!/bin/bash

# Backup and Restore Script for Reasoning Models Branch
# This script helps manage the reasoning models feature branch

set -e

BACKUP_DIR="backup-reasoning-models"
BRANCH_NAME="feature/reasoning-models"
MAIN_BRANCH="main"

case "$1" in
  "backup")
    echo "🔒 Creating backup of current reasoning models work..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Save current branch state
    git log --oneline -10 > "$BACKUP_DIR/commit-history.txt"
    git diff main > "$BACKUP_DIR/changes-vs-main.patch"
    git status > "$BACKUP_DIR/current-status.txt"
    
    # Create restore script
    cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash
echo "🔄 Restoring reasoning models branch..."
git checkout feature/reasoning-models
git apply changes-vs-main.patch
echo "✅ Restore complete!"
EOF
    
    chmod +x "$BACKUP_DIR/restore.sh"
    
    echo "✅ Backup created in $BACKUP_DIR/"
    echo "📋 To restore: cd $BACKUP_DIR && ./restore.sh"
    ;;
    
  "restore")
    echo "🔄 Restoring from backup..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
      echo "❌ No backup found. Run './scripts/backup-reasoning-branch.sh backup' first."
      exit 1
    fi
    
    cd "$BACKUP_DIR"
    ./restore.sh
    cd ..
    ;;
    
  "rollback")
    echo "🔄 Rolling back to main branch..."
    
    # Stash any current changes
    git stash push -m "Auto-stash before rollback"
    
    # Switch to main branch
    git checkout "$MAIN_BRANCH"
    
    # Delete the feature branch
    git branch -D "$BRANCH_NAME"
    
    echo "✅ Rolled back to main branch"
    echo "📋 To recover stashed changes: git stash pop"
    ;;
    
  "status")
    echo "📊 Current branch status:"
    echo "Current branch: $(git branch --show-current)"
    echo ""
    echo "Recent commits:"
    git log --oneline -5
    echo ""
    echo "Modified files:"
    git status --porcelain
    ;;
    
  *)
    echo "🔧 Reasoning Models Branch Management Script"
    echo ""
    echo "Usage: $0 {backup|restore|rollback|status}"
    echo ""
    echo "Commands:"
    echo "  backup   - Create a backup of current reasoning models work"
    echo "  restore  - Restore from backup"
    echo "  rollback - Roll back to main branch (delete feature branch)"
    echo "  status   - Show current branch status"
    echo ""
    echo "Examples:"
    echo "  ./scripts/backup-reasoning-branch.sh backup"
    echo "  ./scripts/backup-reasoning-branch.sh rollback"
    echo "  ./scripts/backup-reasoning-branch.sh status"
    ;;
esac 