#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration Variables
DB_PORT=27017
APP_DB_NAME="quantummftools"
BACKUP_DIR="/var/backups/mongodb"
LOG_DIR="/var/log/mongodb"

# Security Configuration
MONGO_VERSION="7.0"
AUTH_ENABLED=true
TLS_ENABLED=true
PRIVATE_IP="10.124.32.2"
APP_SERVER_IP="10.124.32.4"

echo -e "${GREEN}Starting MongoDB Setup...${NC}"

# Update System
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update && apt-get upgrade -y

# Install required packages
echo -e "${YELLOW}Installing required packages...${NC}"
apt-get install -y gnupg curl software-properties-common fail2ban ufw

# Add MongoDB Repository
echo -e "${YELLOW}Adding MongoDB repository...${NC}"
curl -fsSL https://pgp.mongodb.com/server-${MONGO_VERSION}.asc | \
    gpg -o /usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg \
    --dearmor

echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-${MONGO_VERSION}.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/${MONGO_VERSION} multiverse" | \
    tee /etc/apt/sources.list.d/mongodb-org-${MONGO_VERSION}.list

# Install MongoDB
echo -e "${YELLOW}Installing MongoDB...${NC}"
apt-get update
apt-get install -y mongodb-org

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p ${BACKUP_DIR}
mkdir -p ${LOG_DIR}
chown -R mongodb:mongodb ${BACKUP_DIR}
chown -R mongodb:mongodb ${LOG_DIR}

# Configure MongoDB
echo -e "${YELLOW}Configuring MongoDB...${NC}"
cat > /etc/mongod.conf << EOF
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1

systemLog:
  destination: file
  logAppend: true
  path: ${LOG_DIR}/mongod.log

net:
  port: ${DB_PORT}
  bindIp: 127.0.0.1,${PRIVATE_IP}
  maxIncomingConnections: 20000

security:
  authorization: enabled
  javascriptEnabled: false

operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100

replication:
  replSetName: "rs0"

EOF

# Create MongoDB admin user initialization script
cat > /root/init-mongo.js << EOF
use admin;
db.createUser({
  user: "dbAdmin",
  pwd: passwordPrompt(),
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" },
    { role: "dbAdminAnyDatabase", db: "admin" }
  ]
});

use ${APP_DB_NAME};
db.createUser({
  user: "appUser",
  pwd: passwordPrompt(),
  roles: [
    { role: "readWrite", db: "${APP_DB_NAME}" },
    { role: "dbAdmin", db: "${APP_DB_NAME}" }
  ]
});

// Create indexes
use ${APP_DB_NAME};
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.apiKeys.createIndex({ "service": 1 });
db.apiKeys.createIndex({ "createdAt": 1 });
EOF

# Configure Firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow from ${APP_SERVER_IP} to any port ${DB_PORT}
ufw --force enable

# Configure fail2ban
echo -e "${YELLOW}Configuring fail2ban...${NC}"
cat > /etc/fail2ban/jail.local << EOF
[mongodb]
enabled = true
port = ${DB_PORT}
filter = mongodb
logpath = ${LOG_DIR}/mongod.log
maxretry = 3
findtime = 600
bantime = 3600
EOF

# Create fail2ban filter for MongoDB
cat > /etc/fail2ban/filter.d/mongodb.conf << EOF
[Definition]
failregex = ^.*Failed to authenticate .* source: .*<HOST>.*$
ignoreregex =
EOF

# Create backup script
echo -e "${YELLOW}Creating backup script...${NC}"
cat > /usr/local/bin/mongodb-backup.sh << EOF
#!/bin/bash
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/\${TIMESTAMP}"
mkdir -p \${BACKUP_PATH}

# Perform backup
mongodump --uri="mongodb://appUser:password@localhost:${DB_PORT}/${APP_DB_NAME}" --out=\${BACKUP_PATH}

# Compress backup
cd ${BACKUP_DIR}
tar czf \${TIMESTAMP}.tar.gz \${TIMESTAMP}
rm -rf \${TIMESTAMP}

# Keep only last 7 days of backups
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/mongodb-backup.sh

# Add backup cron job
echo "0 2 * * * /usr/local/bin/mongodb-backup.sh" | crontab -

# Start MongoDB
echo -e "${YELLOW}Starting MongoDB...${NC}"
systemctl enable mongod
systemctl start mongod

# Initialize replica set
echo -e "${YELLOW}Initializing replica set...${NC}"
mongosh --eval 'rs.initiate()'

echo -e "${GREEN}MongoDB setup completed!${NC}"
echo -e "${YELLOW}Please run the following commands to create users:${NC}"
echo "mongosh admin /root/init-mongo.js"

# Create monitoring script
echo -e "${YELLOW}Creating monitoring script...${NC}"
cat > /usr/local/bin/check-mongodb.sh << EOF
#!/bin/bash

# Check MongoDB status
STATUS=\$(systemctl is-active mongod)
if [ "\$STATUS" != "active" ]; then
    echo "MongoDB is not running! Status: \$STATUS"
    exit 1
fi

# Check MongoDB connectivity
mongosh --eval "db.runCommand({ ping: 1 })" > /dev/null
if [ \$? -ne 0 ]; then
    echo "Cannot connect to MongoDB!"
    exit 1
fi

# Check disk space
DISK_USAGE=\$(df /var/lib/mongodb | tail -1 | awk '{print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 85 ]; then
    echo "Disk space critical! Usage: \$DISK_USAGE%"
    exit 1
fi

echo "MongoDB health check passed"
exit 0
EOF

chmod +x /usr/local/bin/check-mongodb.sh

# Add monitoring cron job
echo "*/5 * * * * /usr/local/bin/check-mongodb.sh" | crontab -l | sort -u | crontab -

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Create database users using the init-mongo.js script"
echo "2. Update application configuration with database credentials"
echo "3. Test connectivity from application server"
echo "4. Configure monitoring alerts"