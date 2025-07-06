#!/bin/bash
echo "🔄 Restoring reasoning models branch..."
git checkout feature/reasoning-models
git apply changes-vs-main.patch
echo "✅ Restore complete!"
