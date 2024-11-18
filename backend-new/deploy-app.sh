#!/bin/bash

# Deploy to application server
echo "Deploying to application server..."
scp -r server-setup/* root@164.92.79.175:/root/app-setup/
ssh root@164.92.79.175 'cd /root/app-setup && chmod +x secure-app-setup.sh && ./secure-app-setup.sh'