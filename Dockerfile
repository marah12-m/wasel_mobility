FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY schema.sql ./
COPY src ./src

EXPOSE 3000

CMD ["npm", "run", "start"]
