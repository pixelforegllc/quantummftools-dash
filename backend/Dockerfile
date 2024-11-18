FROM node:20-slim

WORKDIR /app

COPY backend/package*.json ./

RUN npm install
RUN npm cache clean --force

FROM node:20-slim

WORKDIR /app
COPY --from=0 /app/package*.json ./
COPY --from=0 /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
