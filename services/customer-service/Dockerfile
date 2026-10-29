
FROM node:24

WORKDIR /app/services/customer-service

COPY services/customer-service/package*.json ./

RUN npm ci

COPY services/customer-service/ ./

COPY shared/proto/ /app/shared/proto/

RUN npx prisma generate

EXPOSE 3002 50052

CMD ["node", "src/server.js"]
