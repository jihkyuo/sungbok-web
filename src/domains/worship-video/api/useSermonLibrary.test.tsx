import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSermonDescription, useSermonLibrary } from './useSermonLibrary';
import { sermonDescriptionQueryKey, sermonLibraryQueryKey } from './worshipVideoQueries';

const sermons = Array.from({ length: 3 }, (_, i) => ({
  id: `v${i + 1}`,
  title: `t${i + 1}`,
  series: '사도행전 강해',
  no: i + 1,
  date: `2026-10-0${i + 1}`,
  dateFrom: 'sermon',
  thumbnail: `https://i.ytimg.com/vi/v${i + 1}/hq.jpg`,
  poster: `https://i.ytimg.com/vi/v${i + 1}/max.jpg`,
}));
const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

// 재시도 정책은 훅이 쿼리마다 정한다 — 기본값을 따로 두지 않는다.
const wrapper = () => {
  const qc = new QueryClient();
  const W = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  W.displayName = 'TestWrapper';
  return W;
};
const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

describe('useSermonLibrary', () => {
  it('서버 Route Handler 를 한 번만 부르고(유튜브 직접 호출 없음) 설교 목록 전체를 돌려준다', async () => {
    fetchMock.mockResolvedValue(ok(sermons));
    const { result } = renderHook(() => useSermonLibrary('sunday'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/worship-video/library?page=sunday');
    expect(result.current.data?.map(v => v.id)).toEqual(['v1', 'v2', 'v3']);
  });

  it('쿼터 소진(429)은 다시 요청하지 않는다', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, json: async () => ({}) });
    const { result } = renderHook(() => useSermonLibrary('sunday'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('배열이 아닌 200 응답은 실패로 처리한다', async () => {
    fetchMock.mockResolvedValue(ok({ error: 'proxy' }));
    const { result } = renderHook(() => useSermonLibrary('sunday'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useSermonDescription', () => {
  it('고른 영상의 설명 글을 받는다 — id 는 주소에 안전하게 싣는다', async () => {
    fetchMock.mockResolvedValue(ok({ body: '본문' }));
    const { result } = renderHook(() => useSermonDescription('sunday', 'a b'), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith('/api/worship-video/description?page=sunday&v=a%20b');
    expect(result.current.data).toBe('본문');
  });

  it('고른 영상이 없으면 요청하지 않는다', () => {
    renderHook(() => useSermonDescription('sunday', undefined), { wrapper: wrapper() });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

it('다른 페이지에서 6분을 보낸 뒤 돌아와도 목록·설명 캐시를 먼저 사용한다', () => {
  vi.useFakeTimers();
  const client = new QueryClient();
  const W = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  client.setQueryData(sermonLibraryQueryKey('sunday'), sermons);
  client.setQueryData(sermonDescriptionQueryKey('sunday', 'v1'), '기존 설명');
  fetchMock.mockReturnValue(new Promise(() => {}));
  const useCachedData = () => ({
    library: useSermonLibrary('sunday'),
    description: useSermonDescription('sunday', 'v1'),
  });
  let unmount: (() => void) | undefined;
  try {
    const first = renderHook(useCachedData, { wrapper: W });
    first.unmount();
    act(() => vi.advanceTimersByTime(6 * 60_000));
    const back = renderHook(useCachedData, { wrapper: W });
    unmount = back.unmount;
    expect(back.result.current.library.data).toEqual(sermons);
    expect(back.result.current.description.data).toBe('기존 설명');
    expect(back.result.current.library.isPending).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  } finally {
    unmount?.();
    client.clear();
    vi.useRealTimers();
  }
});

it('오래된 목록을 다시 조회하는 동안에도 받은 내용과 화면 상태를 유지한다', () => {
  const client = new QueryClient();
  const W = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  client.setQueryData(sermonLibraryQueryKey('sunday'), sermons, {
    updatedAt: Date.now() - 11 * 60_000,
  });
  fetchMock.mockReturnValue(new Promise(() => {}));
  const { result, unmount } = renderHook(() => useSermonLibrary('sunday'), { wrapper: W });
  expect(result.current.data).toEqual(sermons);
  expect(result.current.isPending).toBe(false);
  expect(result.current.isFetching).toBe(true);
  unmount();
  client.clear();
});
