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

# Ensure the backup directory exists inside the container
docker exec $CONTAINER_NAME mkdir -p $BACKUP_DIR

# Execute the backup command inside the container
# Note: Using -C for trust server certificate might be needed depending on sqlcmd version
docker exec $CONTAINER_NAME /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U $DB_USER -P "$DB_PASS" \
    -Q "BACKUP DATABASE [$DB_NAME] TO DISK = N'$BACKUP_DIR/$BACKUP_FILE' WITH NOFORMAT, NOINIT, NAME = 'Full Backup of $DB_NAME', SKIP, NOREWIND, NOUNLOAD, STATS = 10" \
    -C

if [ $? -eq 0 ]; then
    echo "Backup successful: $HOST_BACKUP_DIR/$BACKUP_FILE"
    
    # Cleanup old backups (older than RETENTION_DAYS)
    echo "Cleaning up backups older than $RETENTION_DAYS days..."
    find $HOST_BACKUP_DIR -name "*.bak" -type f -mtime +$RETENTION_DAYS -delete
    echo "Cleanup complete."
else
    echo "Backup failed!"
    exit 1
fi
