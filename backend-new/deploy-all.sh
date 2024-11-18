#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DB_SERVER="144.126.213.183"
DB_PASSWORD="5Aj-Z)r)PS%K7MrT"
APP_SERVER="164.92.79.175"
APP_PASSWORD="G6p+9kYtI1q7v4ZQ"

# Generate secrets
MONGO_ADMIN_PASSWORD=$(openssl rand -base64 32)
MONGO_APP_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)

echo -e "${GREEN}Starting deployment process...${NC}"

# Save all credentials
echo "=== Database Credentials ===" > credentials.txt
echo "MongoDB Admin Username: dbAdmin" >> credentials.txt
echo "MongoDB Admin Password: $MONGO_ADMIN_PASSWORD" >> credentials.txt
echo "MongoDB App Username: appUser" >> credentials.txt
echo "MongoDB App Password: $MONGO_APP_PASSWORD" >> credentials.txt
echo "" >> credentials.txt
echo "=== Application Secrets ===" >> credentials.txt
echo "JWT Secret: $JWT_SECRET" >> credentials.txt
echo "Refresh Token Secret: $REFRESH_TOKEN_SECRET" >> credentials.txt
echo "Cookie Secret: $COOKIE_SECRET" >> credentials.txt

# Create temporary script files
echo -e "${YELLOW}Creating deployment scripts...${NC}"

# Database setup script
cat > db-setup.sh << EOF
#!/bin/bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod
sleep 10
mongosh --eval 'rs.initiate()'
mongosh admin --eval 'db.createUser({user: "dbAdmin", pwd: "'$MONGO_ADMIN_PASSWORD'", roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]})'
mongosh admin --eval 'db.createUser({user: "appUser", pwd: "'$MONGO_APP_PASSWORD'", roles: [{role: "readWrite", db: "quantummftools"}]})'
ufw allow from 10.124.32.4 to any port 27017
ufw allow ssh
echo "y" | ufw enable
EOF

# Application setup script
cat > app-setup.sh << EOF
#!/bin/bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get update
apt-get install -y nodejs nginx
npm install -g pm2
mkdir -p /var/www/quantummftools
cat > /var/www/quantummftools/.env << EOL
NODE_ENV=production
PORT=3000
APP_NAME=QuantumMF Tools
DOMAIN=quantummftools.com

# Database Configuration
MONGODB_URI=mongodb://appUser:$MONGO_APP_PASSWORD@10.124.32.2:27017/quantummftools
MONGODB_DB_NAME=quantummftools

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION=24h
REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRATION=7d

# Security Configuration
CORS_ORIGIN=https://quantummftools.com
SECURE_COOKIE=true
COOKIE_SECRET=$COOKIE_SECRET
EOL

cd /var/www/quantummftools
git clone https://github.com/pixelforegllc/quantummftools-dash.git .
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 start backend/src/index.js --name quantummftools
pm2 save
pm2 startup
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot
certbot --nginx -d quantummftools.com -d www.quantummftools.com --non-interactive --agree-tos --email admin@quantummftools.com
ufw allow 'Nginx Full'
ufw allow ssh
echo "y" | ufw enable
EOF

chmod +x db-setup.sh app-setup.sh

echo -e "${YELLOW}Deploying to database server...${NC}"
sshpass -p "$DB_PASSWORD" scp db-setup.sh root@$DB_SERVER:/root/
sshpass -p "$DB_PASSWORD" ssh -o StrictHostKeyChecking=no root@$DB_SERVER 'bash /root/db-setup.sh'

echo -e "${YELLOW}Deploying to application server...${NC}"
sshpass -p "$APP_PASSWORD" scp app-setup.sh root@$APP_SERVER:/root/
sshpass -p "$APP_PASSWORD" ssh -o StrictHostKeyChecking=no root@$APP_SERVER 'bash /root/app-setup.sh'

# Cleanup
rm db-setup.sh app-setup.sh

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${YELLOW}Credentials have been saved to credentials.txt${NC}"
echo "Please save these credentials securely and delete the file after noting them down."