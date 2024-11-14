#!/bin/bash

# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)

# Create the environment file
cat > .env << EOF
# Application Configuration
NODE_ENV=production
PORT=3000
APP_NAME=QuantumMF Tools
DOMAIN=quantummftools.com

# Database Configuration
MONGODB_URI=mongodb://appUser:APP_PASSWORD_PLACEHOLDER@10.124.32.2:27017/quantummftools
MONGODB_DB_NAME=quantummftools

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=24h
REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}
REFRESH_TOKEN_EXPIRATION=7d

# Active Directory Configuration
AD_URL=ldap://your.ad.server
AD_BASE_DN=DC=example,DC=com
AD_USERNAME=your_ad_username
AD_PASSWORD=your_ad_password
AD_DOMAIN=yourdomain.com

# API Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=combined

# SSL Configuration
SSL_CERTIFICATE=/etc/letsencrypt/live/quantummftools.com/fullchain.pem
SSL_PRIVATE_KEY=/etc/letsencrypt/live/quantummftools.com/privkey.pem

# Monitoring Configuration
ENABLE_METRICS=true
METRICS_PORT=9090

# Email Configuration
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=alerts@quantummftools.com
SMTP_PASSWORD=your_smtp_password
ALERT_EMAIL=admin@quantummftools.com

# Security Configuration
CORS_ORIGIN=https://quantummftools.com
SECURE_COOKIE=true
COOKIE_SECRET=${COOKIE_SECRET}
EOF

# Store secrets securely for later use
echo "Application Secrets" > ~/app-secrets.txt
echo "JWT Secret: ${JWT_SECRET}" >> ~/app-secrets.txt
echo "Refresh Token Secret: ${REFRESH_TOKEN_SECRET}" >> ~/app-secrets.txt
echo "Cookie Secret: ${COOKIE_SECRET}" >> ~/app-secrets.txt
chmod 600 ~/app-secrets.txt

# Run the main setup script
bash setup-application.sh

echo "Application setup completed. Secrets saved in ~/app-secrets.txt"
echo "Please save these secrets securely and delete the file after noting them down."