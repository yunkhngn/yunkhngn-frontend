#!/bin/bash

set -e

BASE="main"
HEAD="dev"

echo "Checking current branch..."
CURRENT=$(git branch --show-current)

if [ "$CURRENT" != "$HEAD" ]; then
  echo "You must be on branch $HEAD"
  exit 1
fi

echo "Pushing latest $HEAD..."
git push origin $HEAD

echo "Creating PR..."
PR_URL=$(gh pr create --base $BASE --head $HEAD --fill)

echo "PR created: $PR_URL"

PR_NUMBER=$(echo $PR_URL | grep -oE '[0-9]+$')

echo "Merging PR #$PR_NUMBER ..."
gh pr merge $PR_NUMBER --merge --delete-branch=false

echo "Done. main updated, CI/CD should be running."