#!/bin/bash

# Script to clean up old SEO settings from database
# Uses direct database deletion via Prisma CLI

echo "This script will delete all seo_* settings from the database."
echo "Settings to be deleted:"
echo "  - seo_default_title, seo_default_description, seo_default_image"
echo "  - seo_home_title, seo_home_description, seo_home_image"  
echo "  - seo_blog_title, seo_blog_description, seo_blog_image"
echo "  - seo_project_title, seo_project_description, seo_project_image"
echo "  - seo_about_title, seo_about_description, seo_about_image"
echo "  - seo_contact_title, seo_contact_description, seo_contact_image"
echo ""
read -p "Continue? (y/N): " confirm

if [[ $confirm != [yY] ]]; then
    echo "Aborted."
    exit 0
fi

echo "Deleting SEO settings..."

# Navigate to backend directory
cd "$(dirname "$0")/../be" || exit 1

# Use npx prisma to delete SEO settings
npx prisma db execute --stdin <<SQL
DELETE FROM [blogdb].[dbo].[Settings] 
WHERE settingTitle LIKE 'seo_%';
SQL

if [ $? -eq 0 ]; then
    echo "✓ Cleanup completed successfully"
else
    echo "✗ Cleanup failed"
    exit 1
fi
