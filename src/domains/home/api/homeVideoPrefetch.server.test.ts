import { hydrate, QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./homeVideoFeed.server', () => ({ fetchHomeVideoFeed: vi.fn() }));

import { HOME_VIDEO_QUERY_KEY, type HomeVideoFeedData } from './homeVideoFeed';
import { fetchHomeVideoFeed } from './homeVideoFeed.server';
import { prefetchHomeVideo } from './homeVideoPrefetch.server';

const DATA: HomeVideoFeedData = { live: null, sermon: null, notices: [], staleMs: 0 };
const feed = vi.mocked(fetchHomeVideoFeed);

beforeEach(() => {
  feed.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

describe('prefetchHomeVideo', () => {
  it('서버에서 받은 피드를 클라이언트 훅과 같은 키로 실어 보낸다(첫 화면에 회색 틀 없음)', async () => {
    feed.mockResolvedValue(DATA);

    const state = await prefetchHomeVideo();

    const client = new QueryClient();
    hydrate(client, state);
    expect(client.getQueryData(HOME_VIDEO_QUERY_KEY)).toEqual(DATA);
  });

  it('운영 실행 중(ISR 재생성) 실패는 던진다 — Next 가 직전 홈 페이지를 계속 내보내게', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    feed.mockImplementation(async () => {
      throw new Error('videos 403');
    });
    await expect(prefetchHomeVideo()).rejects.toThrow('videos 403');
  });

  it('개발 서버에서의 실패는 빈 상태로 넘긴다 — 키 없는 로컬에서 홈이 500 이 되지 않게', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    feed.mockImplementation(async () => {
      throw new Error('playlistItems 403');
    });

    const state = await prefetchHomeVideo();

    const client = new QueryClient();
    hydrate(client, state);
    expect(client.getQueryData(HOME_VIDEO_QUERY_KEY)).toBeUndefined();
  });

  it('빌드 중 실패는 빈 상태로 넘긴다 — 유튜브 장애로 배포가 막히지 않게(브라우저가 이어서 받는다)', async () => {
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    feed.mockImplementation(async () => {
      throw new Error('videos 403');
    });

    const state = await prefetchHomeVideo();

    const client = new QueryClient();
    hydrate(client, state);
    expect(client.getQueryData(HOME_VIDEO_QUERY_KEY)).toBeUndefined();
  });
});
