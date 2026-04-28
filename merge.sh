#!/usr/bin/env bash
set -e

LATEST_COMMIT=$(git log -1 --pretty=%B | head -n 1)

if [ -z "$LATEST_COMMIT" ]; then
    LATEST_COMMIT="chore: merge dev into main"
fi

echo "🚀 Creating PR and merging dev -> main..."
echo "📝 PR Title: $LATEST_COMMIT"

# Ensure origin dev is pushed
git push origin dev

# Create PR via GitHub CLI
gh pr create --base main --head dev --title "$LATEST_COMMIT" --body "Automated PR from dev to main." || {
    echo "⚠️ PR creation via gh failed (could already exist)."
}

# Merge PR via GitHub CLI
echo "🔄 Merging PR..."
gh pr merge --merge --admin --delete-branch=false || {
    echo "⚠️ Auto-merge via gh failed. Attempting direct fallback..."
    git checkout main
    git pull origin main
    git merge dev -m "Merge dev into main"
    git push origin main
    git checkout dev
}

echo "✅ Successfully merged dev into main!"
