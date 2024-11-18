#!/bin/bash

# Deploy to database server
echo "Deploying to database server..."
scp -r database-setup/* root@144.126.213.183:/root/db-setup/
ssh root@144.126.213.183 'cd /root/db-setup && chmod +x secure-db-setup.sh && ./secure-db-setup.sh'