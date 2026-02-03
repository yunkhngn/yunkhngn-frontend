#!/bin/bash

# Configuration  
CONTAINER_NAME="yunkhngn-mssql"
DB_NAME="blogdb"
DB_USER="sa"
DB_PASS="Khoadeptrai1204!"
BACKUP_DIR="/var/opt/mssql/backups"
HOST_BACKUP_DIR="./backups"
RETENTION_DAYS=7

# Create backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${DB_NAME}_${TIMESTAMP}.bak"

echo "Starting backup of ${DB_NAME}..."

# Ensure the backup directory exists
docker exec $CONTAINER_NAME mkdir -p $BACKUP_DIR

# Execute backup using Python (pre-installed in Azure SQL Edge)
docker exec $CONTAINER_NAME python3 -c "
import pymssql
conn = pymssql.connect(server='localhost', user='$DB_USER', password='$DB_PASS', database='master')
cursor = conn.cursor()
cursor.execute(\"\"\"
BACKUP DATABASE [$DB_NAME] 
TO DISK = N'$BACKUP_DIR/$BACKUP_FILE'
WITH NOFORMAT, NOINIT, 
NAME = 'Full Backup of $DB_NAME',
SKIP, NOREWIND, NOUNLOAD, STATS = 10
\"\"\")
while cursor.nextset():
    pass
conn.commit()
cursor.close()
conn.close()
print('Backup completed')
"

# Check if backup file was created
if docker exec $CONTAINER_NAME test -f "$BACKUP_DIR/$BACKUP_FILE"; then
    SIZE=$(docker exec $CONTAINER_NAME du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo "✓ Backup successful: $HOST_BACKUP_DIR/$BACKUP_FILE (Size: $SIZE)"
    
    # Cleanup old backups
    echo "Cleaning up backups older than $RETENTION_DAYS days..."
    find $HOST_BACKUP_DIR -name "*.bak" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null
    echo "✓ Cleanup complete"
else
    echo "✗ Backup failed - file not created!"
    exit 1
fi
