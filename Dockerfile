# --- Builder Stage ---
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# --- Runner Stage (Final Image) ---
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# !!! 이 부분이 중요합니다 (standalone 방식) !!!
# builder 스테이지에서 생성된 standalone 폴더와 public 폴더를 복사합니다.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

# standalone 폴더 내의 server.js를 직접 실행합니다.
CMD ["node", "server.js"]