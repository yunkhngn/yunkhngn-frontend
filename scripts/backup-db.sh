#!/bin/bash

# Simple database backup by copying files from container
# Works with Azure SQL Edge which doesn't have sqlcmd or Python

CONTAINER_NAME="yunkhngn-mssql"
DB_NAME="blogdb"
BACKUP_DIR="./backups"
RETENTION_DAYS=7

# Create backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "Starting backup of ${DB_NAME}..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Stop writes temporarily (optional, comment out if you want live backup)
# docker exec $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$DB_PASS" -Q "ALTER DATABASE [$DB_NAME] SET SINGLE_USER WITH ROLLBACK IMMEDIATE"

echo "Copying database files..."

# Copy database files from container
docker cp $CONTAINER_NAME:/var/opt/mssql/data/$DB_NAME.mdf "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.mdf"
MDF_RESULT=$?

docker cp $CONTAINER_NAME:/var/opt/mssql/data/${DB_NAME}_log.ldf "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.ldf" 2>/dev/null
LDF_RESULT=$?

# Resume normal operations (if you stopped writes above)
# docker exec $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$DB_PASS" -Q "ALTER DATABASE [$DB_NAME] SET MULTI_USER"

# Check if backup was successful
if [ $MDF_RESULT -eq 0 ]; then
    echo "✓ Backup successful!"
    echo "  - MDF: $BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.mdf"
    
    if [ $LDF_RESULT -eq 0 ]; then
        echo "  - LDF: $BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.ldf"
    fi
    
    # Show total backup size
    du -sh "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}."* | awk '{sum+=$1} END {print "Total size: " sum}'
    
    # Cleanup old backups
    echo "Cleaning up backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "${DB_NAME}_*.mdf" -o -name "${DB_NAME}_*.ldf" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null
    
    # Show current backups
    echo ""
    echo "Current backups:"
    ls -lh "$BACKUP_DIR" | grep "$DB_NAME"
    
    echo "✓ Backup complete"
else
    echo "✗ Backup failed - could not copy database files!"
    echo "Make sure the container is running and the database name is correct."
    exit 1
fi
