
FROM node:24

WORKDIR /app/services/product-service

COPY services/product-service/package*.json ./

RUN npm ci

COPY services/product-service/ ./

COPY shared/proto/ /app/shared/proto/

EXPOSE 3003 50053

CMD ["node", "src/server.js"]
