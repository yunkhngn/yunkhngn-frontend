#!/bin/bash

# Script to clean up old SEO settings from database
# Run this on the server where the database is accessible

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

CONTAINER_NAME="yunkhngn-mssql"
DB_NAME="blogdb"
DB_USER="sa"
DB_PASS="Khoadeptrai1204!"

echo "Deleting SEO settings..."

docker exec $CONTAINER_NAME python3 -c "
import pymssql
conn = pymssql.connect(server='localhost', user='$DB_USER', password='$DB_PASS', database='$DB_NAME')
cursor = conn.cursor()

# Delete all seo_* settings
cursor.execute(\"\"\"
DELETE FROM [Settings] 
WHERE settingTitle LIKE 'seo_%'
\"\"\")

affected = cursor.rowcount
conn.commit()
cursor.close()
conn.close()

print(f'✓ Deleted {affected} SEO settings from database')
"

if [ $? -eq 0 ]; then
    echo "✓ Cleanup completed successfully"
else
    echo "✗ Cleanup failed"
    exit 1
fi
