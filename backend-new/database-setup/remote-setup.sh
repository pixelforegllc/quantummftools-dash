#!/bin/bash

# Update system and install required packages
apt-get update && apt-get upgrade -y
apt-get install -y curl gnupg wget

# Add MongoDB repository
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
    gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
    --dearmor

echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
    tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
apt-get update
apt-get install -y mongodb-org

# Stop MongoDB service if running
systemctl stop mongod

# Backup original config
cp /etc/mongod.conf /etc/mongod.conf.backup

# Create MongoDB configuration
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
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1,10.124.32.2

security:
  authorization: enabled

operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100

replication:
  replSetName: "rs0"
EOF

# Create directories if they don't exist
mkdir -p /var/lib/mongodb /var/log/mongodb
chown -R mongodb:mongodb /var/lib/mongodb /var/log/mongodb
chmod 750 /var/lib/mongodb /var/log/mongodb

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Initialize the replica set
sleep 10
mongosh --eval 'rs.initiate()'

# Create admin user
mongosh admin --eval 'db.createUser({user: "dbAdmin", pwd: "ADMIN_PASSWORD", roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]})'

# Create application user
mongosh admin --eval 'db.createUser({user: "appUser", pwd: "APP_PASSWORD", roles: [{role: "readWrite", db: "quantummftools"}]})'

# Configure firewall
ufw allow from 10.124.32.4 to any port 27017
ufw allow ssh
ufw --force enable

echo "MongoDB setup completed successfully!"