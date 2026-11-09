import { afterEach, describe, expect, it, vi } from 'vitest';

import { prefetchForIsr } from './prefetchForIsr.server';

afterEach(() => vi.unstubAllEnvs());

describe('prefetchForIsr — 서버 미리 채우기의 실패 규칙(홈·주일예배 공용)', () => {
  it('성공한 쿼리만 실어 보낸다', async () => {
    const s = await prefetchForIsr(async c => {
      await c.prefetchQuery({ queryKey: ['ok'], queryFn: async () => 1 });
      await c.prefetchQuery({
        queryKey: ['bad'],
        queryFn: async () => {
          throw new Error('x');
        },
      });
    });
    expect(s.queries.map(q => q.queryKey)).toEqual([['ok']]);
  });

  it('운영 중 재생성에서 하나라도 실패하면 던진다 — 직전 성공 페이지 유지', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-server');
    await expect(
      prefetchForIsr(c =>
        c.prefetchQuery({
          queryKey: ['bad'],
          queryFn: async () => {
            throw new Error('quota');
          },
        })
      )
    ).rejects.toThrow('quota');
  });

  it('빌드 중 실패는 던지지 않는다 — 배포를 막지 않게', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    const s = await prefetchForIsr(c =>
      c.prefetchQuery({
        queryKey: ['bad'],
        queryFn: async () => {
          throw new Error('quota');
        },
      })
    );
    expect(s.queries).toEqual([]);
  });
});
