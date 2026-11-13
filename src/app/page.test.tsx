// @vitest-environment node
import { Fragment, type ReactNode } from 'react';
import { renderToReadableStream } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prefetch } = vi.hoisted(() => ({
  prefetch: { calls: 0, run: () => Promise.resolve({ queries: [] as [], mutations: [] as [] }) },
}));
vi.mock('@/domains/home/api/homeVideoPrefetch.server', () => ({
  prefetchHomeVideo: () => {
    prefetch.calls++;
    return prefetch.run();
  },
}));
vi.mock('@tanstack/react-query', () => ({
  HydrationBoundary: ({ children }: { children: ReactNode }) => <Fragment>{children}</Fragment>,
}));
vi.mock('@/domains/home/components/widgets/HomeLead', () => ({
  HomeLead: () => <h1>hero-ready</h1>,
}));
vi.mock('@/domains/home/components/widgets/LiveStage', () => ({
  LiveStage: () => <p>live-ready</p>,
}));
vi.mock('@/domains/home/components/widgets/NoticeReel', () => ({
  NoticeReel: () => <p>notices-ready</p>,
  NoticeReelSkeleton: () => <p>notices-pending</p>,
}));
vi.mock('@/domains/home/components/widgets/HomeVideoWarmup', () => ({
  HomeVideoWarmup: () => null,
}));
vi.mock('@/domains/home/components/widgets/ChurchNews', () => ({ ChurchNews: () => null }));
vi.mock('@/domains/home/components/widgets/FirstVisit', () => ({ FirstVisit: () => null }));
vi.mock('@/domains/home/components/widgets/LocationMap', () => ({ LocationMap: () => null }));
vi.mock('@/domains/home/components/widgets/NextGeneration', () => ({ NextGeneration: () => null }));
vi.mock('@/domains/home/components/widgets/RecentSermons/TurntableStage', () => ({
  TurntableStage: () => null,
}));
vi.mock('@/domains/home/components/widgets/WorshipTimes', () => ({
  WorshipTimes: () => <p>worship-ready</p>,
}));

import Home from './page';

beforeEach(() => {
  prefetch.calls = 0;
  prefetch.run = () => Promise.resolve({ queries: [], mutations: [] });
});

describe('홈 첫 화면과 영상 준비 분리', () => {
  it('영상 조회가 끝나기 전에 첫 화면을 스트리밍하고, 준비되면 영상 영역을 이어 보낸다', async () => {
    let resolve!: (value: { queries: []; mutations: [] }) => void;
    prefetch.run = () =>
      new Promise(r => {
        resolve = r;
      });
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const stream = await Promise.race([
        renderToReadableStream(<Home />, { signal: controller.signal, onError: () => {} }),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error('영상 조회가 첫 화면을 막음')), 400);
        }),
      ]);
      clearTimeout(timeout);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      const first = decoder.decode((await reader.read()).value);
      expect(prefetch.calls).toBe(1);
      expect(first).toContain('hero-ready');
      expect(first).toContain('worship-ready');
      expect(first).not.toContain('live-ready');
      resolve({ queries: [], mutations: [] });
      let rest = '';
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        rest += decoder.decode(chunk.value);
      }
      expect(rest).toContain('live-ready');
      expect(rest).toContain('notices-ready');
    } finally {
      clearTimeout(timeout);
      resolve({ queries: [], mutations: [] });
      controller.abort();
    }
  });

  it('영상 미리 조회가 실패해도 홈을 유지하고 영상 부품이 자체 조회를 이어갈 수 있게 한다', async () => {
    prefetch.run = async () => {
      throw new Error('upstream unavailable');
    };
    const stream = await renderToReadableStream(<Home />);
    const html = await new Response(stream).text();
    expect(html).toContain('hero-ready');
    expect(html).toContain('live-ready');
    expect(html).toContain('notices-ready');
  });
});
