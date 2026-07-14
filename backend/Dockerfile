FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate --schema=prisma/schema.prisma

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node index.js"]
