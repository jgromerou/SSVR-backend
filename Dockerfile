# ---- Build stage ----
FROM node:22-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

# prisma.config.ts solo necesita la variable presente para `generate` (no se conecta a la BD).
ENV DATABASE_URL="mysql://user:pass@localhost:3306/ssvr"
RUN npx prisma generate
RUN npm run build
RUN cp src/generated/prisma/*.node dist/generated/prisma/ 2>/dev/null || true

# ---- Runtime stage ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/index.js"]
