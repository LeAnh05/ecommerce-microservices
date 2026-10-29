
FROM node:24

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3005 50055

CMD ["node", "src/server.js"]
