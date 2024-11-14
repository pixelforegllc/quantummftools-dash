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
MONGODB_URI=mongodb://appUser:L3qPWtj52FkPrQBZd8/atwfe206tyhAH8Pbbxso1l6c=@10.124.32.2:27017/quantummftools
MONGODB_DB_NAME=quantummftools

# JWT Configuration
JWT_SECRET=I46oE1I5vVb0cNqN8EjjTdVJdtg8QP21dEoDQzt0aEM=
JWT_EXPIRATION=24h
REFRESH_TOKEN_SECRET=jPAUPZxp0vMKUqFmNQTVQMIqzn0T56+7YEILQebmhUI=
REFRESH_TOKEN_EXPIRATION=7d

# Security Configuration
CORS_ORIGIN=https://quantummftools.com
SECURE_COOKIE=true
COOKIE_SECRET=l9MLH9/G5Mkfpzt+34XsCrufXDuJBlpCfYHHdWtaoiQ=
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
