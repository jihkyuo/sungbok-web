# 기본 이미지 설정
FROM node:24-alpine as runner

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 환경 변수 설정
ENV NODE_ENV production
ENV PNPM_HOME /pnpm
ENV PATH $PNPM_HOME:$PATH

# pnpm 설치
RUN apk add --no-cache libc6-compat
RUN RUN corepack enable && corepack prepare pnpm@latest --activate
# package.json과 pnpm-lock.yaml 파일 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치 (production only)
RUN pnpm install --frozen-lockfile --prod

# 빌드된 파일들과 필요한 모든 파일 복사
COPY public ./public

# 애플리케이션 포트 설정
ENV HOST 0.0.0.0
EXPOSE 3000

# 애플리케이션 실행
CMD ["pnpm", "start"]