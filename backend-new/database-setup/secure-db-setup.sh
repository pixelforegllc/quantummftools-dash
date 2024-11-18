#!/bin/bash

# Generate secure passwords
DB_ADMIN_PASSWORD=$(openssl rand -base64 32)
APP_USER_PASSWORD=$(openssl rand -base64 32)

# Create the environment file
cat > .env << EOF
# MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=dbAdmin
MONGO_INITDB_ROOT_PASSWORD=${DB_ADMIN_PASSWORD}
MONGO_APP_USERNAME=appUser
MONGO_APP_PASSWORD=${APP_USER_PASSWORD}
MONGO_DATABASE=quantummftools

# Backup Configuration
BACKUP_DIR=/var/backups/mongodb
BACKUP_RETENTION_DAYS=7

# Network Configuration
MONGO_PORT=27017
PRIVATE_IP=10.124.32.2
APP_SERVER_IP=10.124.32.4

# Security Configuration
AUTH_ENABLED=true
TLS_ENABLED=true

# Monitoring Configuration
ALERT_EMAIL=admin@quantummftools.com
DISK_ALERT_THRESHOLD=85
MEMORY_ALERT_THRESHOLD=90
EOF

# Store credentials securely for later use
echo "Database Credentials" > ~/db-credentials.txt
echo "Admin Username: dbAdmin" >> ~/db-credentials.txt
echo "Admin Password: ${DB_ADMIN_PASSWORD}" >> ~/db-credentials.txt
echo "App Username: appUser" >> ~/db-credentials.txt
echo "App Password: ${APP_USER_PASSWORD}" >> ~/db-credentials.txt
chmod 600 ~/db-credentials.txt

# Run the main setup script
bash setup-database.sh

echo "Database setup completed. Credentials saved in ~/db-credentials.txt"
echo "Please save these credentials securely and delete the file after noting them down."