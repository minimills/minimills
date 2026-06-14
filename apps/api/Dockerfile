FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci --workspace=apps/api --workspace=packages/shared

COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

RUN npm run build --workspace=apps/api

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/apps/api/prisma ./prisma

RUN npm ci --omit=dev

RUN npx prisma generate

USER nodejs

EXPOSE 3001

CMD ["node", "dist/index.js"]
