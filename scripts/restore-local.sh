#!/bin/bash

# Script to restore database to LOCAL environment
CONTAINER_NAME="yunkhngn_mssql"
DB_NAME="blogdb"
BACKUP_DIR="./backups"

if [ -z "$1" ]; then
    echo "Usage: ./scripts/restore-local.sh <TIMESTAMP>"
    echo "Example: ./scripts/restore-local.sh 20260203_181812"
    echo "Current backups in $BACKUP_DIR:"
    ls -1 $BACKUP_DIR/*.mdf 2>/dev/null | sed 's/.*blogdb_\(.*\)\.mdf/\1/'
    exit 1
fi

TIMESTAMP=$1
MDF_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.mdf"
LDF_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.ldf"

if [ ! -f "$MDF_FILE" ]; then
    echo "Error: Backup file $MDF_FILE not found!"
    exit 1
fi

echo "⚠️ Warning: This will overwrite your LOCAL database!"
read -p "Are you sure? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    exit 0
fi

echo "Stopping local containers..."
docker compose stop backend mssql

echo "Starting mssql for file replacement..."
docker compose start mssql
sleep 5

echo "Restoring files..."
docker cp "$MDF_FILE" $CONTAINER_NAME:/var/opt/mssql/data/blogdb.mdf
docker cp "$LDF_FILE" $CONTAINER_NAME:/var/opt/mssql/data/blogdb_log.ldf

echo "Fixing permissions..."
docker exec -u 0 $CONTAINER_NAME chown mssql:root /var/opt/mssql/data/blogdb.mdf /var/opt/mssql/data/blogdb_log.ldf

echo "Attaching Database (SQL Server 2022)..."
docker exec $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd \
   -S localhost -U sa -P 'YourStrong@Passw0rd' \
   -Q "CREATE DATABASE [blogdb] ON (FILENAME = '/var/opt/mssql/data/blogdb.mdf'), (FILENAME = '/var/opt/mssql/data/blogdb_log.ldf') FOR ATTACH"

echo "Restarting services..."
# docker compose restart mssql # No need to restart if attached online
docker compose start backend

echo "✓ Restore to LOCAL complete (Database Attached)."
