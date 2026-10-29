
FROM node:24

WORKDIR /app/services/order-service

COPY services/order-service/package*.json ./

RUN npm ci

COPY services/order-service/ ./

COPY shared/proto/ /app/shared/proto/

RUN npx prisma generate

EXPOSE 3004

CMD ["node", "src/server.js"]
