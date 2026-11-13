FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
# Prisma CLI is currently a devDependency, and is required for generate/migrate.
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate --schema=prisma/schema.prisma

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node index.js"]
