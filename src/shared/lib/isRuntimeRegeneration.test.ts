import { afterEach, describe, expect, it, vi } from 'vitest';

import { isRuntimeRegeneration } from './isRuntimeRegeneration';

afterEach(() => vi.unstubAllEnvs());

describe('isRuntimeRegeneration — 운영 서버가 페이지를 다시 만드는 중인지(ISR 재생성)', () => {
  it('운영 실행(빌드 아님)이면 true', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-server');
    expect(isRuntimeRegeneration()).toBe(true);
  });

  it('빌드 중이면 false — 배포를 막지 않게', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    expect(isRuntimeRegeneration()).toBe(false);
  });

  it('개발 서버면 false', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isRuntimeRegeneration()).toBe(false);
  });
});
