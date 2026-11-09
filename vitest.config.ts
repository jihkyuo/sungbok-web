import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // Vite 네이티브 기능으로 tsconfig.json 의 `@/*` 별칭을 단일 출처에서 미러링한다(별칭 중복 정의 금지).
  resolve: {
    tsconfigPaths: true,
    // 'server-only' 는 react-server 조건이 아니면 import 하자마자 던진다 — 테스트(jsdom)에서는 빈 모듈로 바꾼다.
    // fileURLToPath — 경로에 한글·공백이 있어도 깨지지 않게(URL.pathname 은 퍼센트 인코딩된다).
    alias: {
      'server-only': fileURLToPath(new URL('./vitest.server-only-stub.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // 로직 보유 코드만 의미 있는 수치로 — 페이지/시안/정적 데이터/자산은 제외.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/app/**',
        '**/_variants/**',
        '**/data.ts',
        '**/*.d.ts',
        '**/index.ts',
        'src/assets/**',
      ],
      // 리포트 전용: 강제 임계값(thresholds) 없음.
    },
  },
});
