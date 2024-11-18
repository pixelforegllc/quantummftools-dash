#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration Variables
APP_USER="appuser"
APP_DIR="/var/www/quantummftools"
NODE_VERSION="20"
DOMAIN="quantummftools.com"
PM2_INSTANCES=2

echo -e "${GREEN}Starting Application Server Setup...${NC}"

# Update System
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update && apt-get upgrade -y

# Install Essential Packages
echo -e "${YELLOW}Installing essential packages...${NC}"
apt-get install -y curl git nginx software-properties-common fail2ban ufw build-essential

# Install Node.js
echo -e "${YELLOW}Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

# Install PM2
echo -e "${YELLOW}Installing PM2...${NC}"
npm install -y pm2@latest -g

# Create Application User
echo -e "${YELLOW}Creating application user...${NC}"
useradd -m -s /bin/bash ${APP_USER}
mkdir -p ${APP_DIR}
chown -R ${APP_USER}:${APP_USER} ${APP_DIR}

# Configure Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/${DOMAIN} << EOF
map \$http_upgrade \$connection_upgrade {
    default upgrade;
    '' close;
}

upstream backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    root ${APP_DIR}/frontend/build;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Security headers
        proxy_hide_header X-Powered-By;
        proxy_hide_header Server;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.quantummftools.com;" always;
}
EOF

ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Install Certbot and get SSL certificate
echo -e "${YELLOW}Installing Certbot and obtaining SSL certificate...${NC}"
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}

# Configure PM2
echo -e "${YELLOW}Configuring PM2...${NC}"
cat > ${APP_DIR}/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'quantummftools-api',
    script: '${APP_DIR}/backend/src/index.js',
    instances: ${PM2_INSTANCES},
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: '${APP_DIR}/logs/err.log',
    out_file: '${APP_DIR}/logs/out.log',
    log_file: '${APP_DIR}/logs/combined.log',
    time: true
  }]
}
EOF

# Configure Firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Configure fail2ban
echo -e "${YELLOW}Configuring fail2ban...${NC}"
cat > /etc/fail2ban/jail.local << EOF
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-botsearch]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-badbots]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

# Create deployment script
echo -e "${YELLOW}Creating deployment script...${NC}"
cat > ${APP_DIR}/deploy.sh << EOF
#!/bin/bash

# Pull latest changes
git pull origin main

# Install backend dependencies
cd ${APP_DIR}/backend
npm install --production

# Install frontend dependencies and build
cd ${APP_DIR}/frontend
npm install
npm run build

# Restart PM2
pm2 reload all

# Restart Nginx
systemctl reload nginx
EOF

chmod +x ${APP_DIR}/deploy.sh
chown ${APP_USER}:${APP_USER} ${APP_DIR}/deploy.sh

# Create monitoring script
echo -e "${YELLOW}Creating monitoring script...${NC}"
cat > /usr/local/bin/check-application.sh << EOF
#!/bin/bash

# Check Node.js service
pm2 list | grep "quantummftools-api" | grep "online" > /dev/null
if [ \$? -ne 0 ]; then
    echo "Node.js application is not running!"
    exit 1
fi

# Check Nginx
systemctl is-active --quiet nginx
if [ \$? -ne 0 ]; then
    echo "Nginx is not running!"
    exit 1
fi

# Check SSL certificate expiry
DOMAIN="${DOMAIN}"
CERT_EXPIRY=\$(certbot certificates | grep "Expiry Date:" | awk '{print \$3}')
EXPIRY_DATE=\$(date -d "\$CERT_EXPIRY" +%s)
CURRENT_DATE=\$(date +%s)
DAYS_UNTIL_EXPIRY=\$(( (\$EXPIRY_DATE - \$CURRENT_DATE) / 86400 ))

if [ \$DAYS_UNTIL_EXPIRY -lt 30 ]; then
    echo "SSL certificate will expire in \$DAYS_UNTIL_EXPIRY days!"
    exit 1
fi

# Check disk space
DISK_USAGE=\$(df / | tail -1 | awk '{print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 85 ]; then
    echo "Disk space critical! Usage: \$DISK_USAGE%"
    exit 1
fi

echo "Application health check passed"
exit 0
EOF

chmod +x /usr/local/bin/check-application.sh

# Add monitoring cron job
echo "*/5 * * * * /usr/local/bin/check-application.sh" | crontab -l | sort -u | crontab -

# Create log rotation configuration
echo -e "${YELLOW}Configuring log rotation...${NC}"
cat > /etc/logrotate.d/quantummftools << EOF
${APP_DIR}/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ${APP_USER} ${APP_USER}
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

echo -e "${GREEN}Application server setup completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Clone the repository to ${APP_DIR}"
echo "2. Set up environment variables"
echo "3. Install application dependencies"
echo "4. Start the application using PM2"
echo "5. Configure monitoring alerts"