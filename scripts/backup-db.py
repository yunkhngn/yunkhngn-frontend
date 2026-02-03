#!/usr/bin/env python3
import subprocess
import os
from datetime import datetime, timedelta
import sys

# Configuration
CONTAINER_NAME = "yunkhngn-mssql"
DB_NAME = "blogdb"
DB_USER = "sa"
DB_PASS = "Khoadeptrai1204!"
BACKUP_DIR = "/var/opt/mssql/backups"
HOST_BACKUP_DIR = "./backups"
RETENTION_DAYS = 7

# Create backup filename with timestamp
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_file = f"{DB_NAME}_{timestamp}.bak"
backup_path = f"{BACKUP_DIR}/{backup_file}"

print(f"Starting backup of {DB_NAME}...")

# Ensure backup directory exists
subprocess.run([
    "docker", "exec", CONTAINER_NAME, 
    "mkdir", "-p", BACKUP_DIR
], check=True)

# SQL backup command
sql_command = f"""
BACKUP DATABASE [{DB_NAME}] 
TO DISK = N'{backup_path}' 
WITH NOFORMAT, NOINIT, 
NAME = 'Full Backup of {DB_NAME}', 
SKIP, NOREWIND, NOUNLOAD, STATS = 10
"""

# Execute backup using docker exec with python and pymssql
backup_script = f"""
import pymssql
conn = pymssql.connect(
    server='localhost',
    user='{DB_USER}',
    password='{DB_PASS}',
    database='master'
)
cursor = conn.cursor()
cursor.execute('''{sql_command}''')
conn.commit()
cursor.close()
conn.close()
print('Backup completed successfully')
"""

try:
    # Run the backup
    result = subprocess.run([
        "docker", "exec", CONTAINER_NAME,
        "python3", "-c", backup_script
    ], capture_output=True, text=True, timeout=300)
    
    if result.returncode != 0:
        print(f"Backup failed: {result.stderr}")
        sys.exit(1)
    
    # Check if file was created
    check_result = subprocess.run([
        "docker", "exec", CONTAINER_NAME,
        "test", "-f", backup_path
    ])
    
    if check_result.returncode == 0:
        # Get file size
        size_result = subprocess.run([
            "docker", "exec", CONTAINER_NAME,
            "du", "-h", backup_path
        ], capture_output=True, text=True)
        size = size_result.stdout.split()[0] if size_result.returncode == 0 else "unknown"
        
        print(f"Backup successful: {HOST_BACKUP_DIR}/{backup_file}")
        print(f"Backup size: {size}")
        
        # Cleanup old backups
        print(f"Cleaning up backups older than {RETENTION_DAYS} days...")
        cutoff_time = datetime.now() - timedelta(days=RETENTION_DAYS)
        
        if os.path.exists(HOST_BACKUP_DIR):
            for filename in os.listdir(HOST_BACKUP_DIR):
                if filename.endswith('.bak'):
                    filepath = os.path.join(HOST_BACKUP_DIR, filename)
                    if os.path.isfile(filepath):
                        file_time = datetime.fromtimestamp(os.path.getmtime(filepath))
                        if file_time < cutoff_time:
                            os.remove(filepath)
                            print(f"Removed old backup: {filename}")
        
        print("Cleanup complete.")
    else:
        print("Backup failed - file not created!")
        sys.exit(1)
        
except subprocess.TimeoutExpired:
    print("Backup timeout - operation took too long!")
    sys.exit(1)
except Exception as e:
    print(f"Backup failed with error: {str(e)}")
    sys.exit(1)
