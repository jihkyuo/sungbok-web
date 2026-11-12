import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSermonDescription, useSermonLibrary } from './useSermonLibrary';

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
