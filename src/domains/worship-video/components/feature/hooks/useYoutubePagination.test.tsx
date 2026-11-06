import { useYoutubePagination } from '@/domains/worship-video/components/feature/hooks/useYoutubePagination';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { Suspense, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// 시드(비동기 훅 + react-query + Suspense + 모킹):
// client.api 만 스텁하고 실제 react-query(useSuspenseQuery/fetchQuery)·queryKeys 는 그대로 둬서
// 훅의 "nextPageToken 재귀 prefetch + 페이지 누적 + 종료"를 진짜로 태운다.
vi.mock('@/domains/worship-video/api/client.api', () => ({
  getPlaylistApi: vi.fn(),
  getPlaylistItemsApi: vi.fn(),
}));

import { getPlaylistItemsApi } from '@/domains/worship-video/api/client.api';

const mockGetItems = vi.mocked(getPlaylistItemsApi);

// page1 → tok2 → page2 → tok3 → page3(토큰 없음, 종료)
const PAGES: Record<string, { items: { id: string }[]; nextPageToken?: string }> = {
  __first: { items: [{ id: 'v1' }], nextPageToken: 'tok2' },
  tok2: { items: [{ id: 'v2' }], nextPageToken: 'tok3' },
  tok3: { items: [{ id: 'v3' }] },
};

beforeEach(() => {
  mockGetItems.mockReset();
  mockGetItems.mockImplementation(async args => PAGES[args.pageToken ?? '__first'] as never);
});

const makeWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>{children}</Suspense>
    </QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
};

describe('useYoutubePagination', () => {
  it('nextPageToken 을 따라 모든 페이지를 누적하고 토큰이 없으면 멈춘다', async () => {
    const { result } = renderHook(() => useYoutubePagination({ playlistId: 'PL', pageSize: 10 }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.getPage(3)).toHaveLength(1));

    expect(result.current.getPage(1)).toEqual([{ id: 'v1' }]);
    expect(result.current.getPage(2)).toEqual([{ id: 'v2' }]);
    expect(result.current.getPage(3)).toEqual([{ id: 'v3' }]);
    // 없는 페이지는 undefined 가 아니라 빈 배열을 돌려준다.
    expect(result.current.getPage(4)).toEqual([]);

    // page1(suspense) + page2·page3(fetchQuery) = 3회. 토큰 falsy 에서 재귀 종료.
    expect(mockGetItems).toHaveBeenCalledTimes(3);
  });
});
