#!/bin/bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod
sleep 10
mongosh --eval 'rs.initiate()'
mongosh admin --eval 'db.createUser({user: "dbAdmin", pwd: "'O2i4mpyJNGM2m6CCVjVS73c2sIv+lXVlBMcRAmFFHpI='", roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]})'
mongosh admin --eval 'db.createUser({user: "appUser", pwd: "'L3qPWtj52FkPrQBZd8/atwfe206tyhAH8Pbbxso1l6c='", roles: [{role: "readWrite", db: "quantummftools"}]})'
ufw allow from 10.124.32.4 to any port 27017
ufw allow ssh
echo "y" | ufw enable
