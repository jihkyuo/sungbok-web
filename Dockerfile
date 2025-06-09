# Dockerfile

# =================================================================
#  1단계: Builder Stage (애플리케이션 빌드 담당)
# =================================================================
FROM node:24-alpine AS builder

WORKDIR /app

# pnpm 설치 (corepack 사용 권장)
RUN corepack enable && corepack prepare pnpm@latest --activate

# --- 빌드 시점에 사용할 환경 변수 정의 ---
# docker-compose.yml의 build.args로부터 값을 전달받을 변수들을 선언합니다.
ARG NEXT_PUBLIC_YOUTUBE_API_KEY
ARG NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
ARG NEXT_PUBLIC_API_URL

# ARG로 받은 값을 ENV로 설정하여 Next.js 빌드 프로세스가 접근할 수 있도록 합니다.
ENV NEXT_PUBLIC_YOUTUBE_API_KEY=$NEXT_PUBLIC_YOUTUBE_API_KEY
ENV NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=$NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# 만약 클라이언트에서도 사용해야 하는 변수라면 ENV NEXT_PUBLIC_... 형태로 설정해야 합니다.
# ENV NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=$YOUTUBE_CHANNEL_ID

# 소스 코드를 복사하기 전에 의존성 관련 파일만 먼저 복사
COPY package.json pnpm-lock.yaml ./

# 모든 의존성 설치
RUN pnpm install --frozen-lockfile

# 나머지 모든 소스 코드 복사
COPY . .

# Next.js 애플리케이션 빌드
# 이제 이 빌드 과정에서 위의 환경 변수들을 사용할 수 있습니다.
RUN pnpm run build

# =================================================================
#  2단계: Runner Stage (최종 실행용 이미지)
# =================================================================
FROM node:24-alpine AS runner

WORKDIR /app

# 기본적으로 production 환경으로 설정
ENV NODE_ENV=production

# --- Builder 스테이지에서 필요한 파일만 복사 ---
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# 보안 강화를 위해 root 사용자가 아닌 node 사용자 계정으로 실행
USER node

# 애플리케이션 포트 설정
EXPOSE 3000

# 애플리케이션 실행
# standalone 모드에서는 생성된 server.js 파일을 직접 실행합니다.
# 런타임 환경 변수는 docker-compose.yml의 environment 섹션에서 주입됩니다.
CMD ["node", "server.js"]