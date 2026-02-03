#!/bin/bash

# Script to restore database from .mdf and .ldf files
CONTAINER_NAME="yunkhngn-mssql"
DB_NAME="blogdb"
BACKUP_DIR="./backups"

if [ -z "$1" ]; then
    echo "Usage: ./scripts/restore-db.sh <TIMESTAMP>"
    echo "Example: ./scripts/restore-db.sh 20240204_003000"
    echo "Current backups in $BACKUP_DIR:"
    ls -1 $BACKUP_DIR/*.mdf | sed 's/.*blogdb_\(.*\)\.mdf/\1/'
    exit 1
fi

TIMESTAMP=$1
MDF_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.mdf"
LDF_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.ldf"

if [ ! -f "$MDF_FILE" ]; then
    echo "Error: Backup file $MDF_FILE not found!"
    exit 1
fi

echo "⚠️ Warning: This will overwrite the current database!"
read -p "Are you sure? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    exit 0
fi

echo "Stopping containers..."
docker compose -f docker-compose.prod.yml stop backend mssql

echo "Starting mssql for file replacement..."
docker compose -f docker-compose.prod.yml start mssql
sleep 5

echo "Restoring files..."
docker cp "$MDF_FILE" $CONTAINER_NAME:/var/opt/mssql/data/blogdb.mdf
docker cp "$LDF_FILE" $CONTAINER_NAME:/var/opt/mssql/data/blogdb_log.ldf

echo "Fixing permissions..."
docker exec -u 0 $CONTAINER_NAME chown mssql:root /var/opt/mssql/data/blogdb.mdf /var/opt/mssql/data/blogdb_log.ldf

echo "Restarting services..."
docker compose -f docker-compose.prod.yml restart mssql
sleep 5
docker compose -f docker-compose.prod.yml start backend

echo "✓ Restore complete. Please check the logs."
docker compose -f docker-compose.prod.yml logs -f --tail=20 backend
