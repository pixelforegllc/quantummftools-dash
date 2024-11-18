#!/bin/bash

# Update system
apt-get update
apt-get upgrade -y

# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org

# Create MongoDB configuration
cat > /etc/mongod.conf << EOF
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1,10.124.32.2

security:
  authorization: enabled

replication:
  replSetName: "rs0"
EOF

# Create MongoDB user initialization script
cat > /root/init-mongo.js << EOF
use admin;
db.createUser({
  user: "adminUser",
  pwd: "REPLACE_WITH_SECURE_PASSWORD",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
});

use quantummftools;
db.createUser({
  user: "appUser",
  pwd: "REPLACE_WITH_APP_PASSWORD",
  roles: [
    { role: "readWrite", db: "quantummftools" }
  ]
});
EOF

# Start MongoDB
systemctl enable mongod
systemctl start mongod

# Initialize the replica set
mongosh --eval 'rs.initiate()'

# Configure firewall
ufw allow from 10.124.32.4 to any port 27017  # Allow application server
ufw enable