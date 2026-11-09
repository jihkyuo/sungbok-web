import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePlaylists, usePlaylistVideos } from './usePlaylistVideos';

const videos = Array.from({ length: 23 }, (_, i) => ({
  id: `v${i + 1}`,
  title: `t${i + 1}`,
  thumbnail: `https://i.ytimg.com/vi/v${i + 1}/hq.jpg`,
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

describe('usePlaylistVideos', () => {
  it('서버 Route Handler 를 한 번만 부르고(유튜브 직접 호출 없음) 목록 전체를 돌려준다', async () => {
    fetchMock.mockResolvedValue(ok(videos));
    const { result } = renderHook(() => usePlaylistVideos('PL 1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // 취소 신호(signal)는 넘기지 않는다 — 탭을 떠나도 끝까지 받아 캐시에 남긴다.
    expect(fetchMock).toHaveBeenCalledWith('/api/worship-video?playlistId=PL%201');
    expect(result.current.data?.map(v => v.id)).toEqual(videos.map(v => v.id));
  });

  it('쿼터 소진(429)·유튜브 오류(502)는 다시 요청하지 않는다', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, json: async () => ({}) });
    const { result } = renderHook(() => usePlaylistVideos('PL'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('usePlaylists', () => {
  it('재생목록 목록을 받는다', async () => {
    fetchMock.mockResolvedValue(ok([{ id: 'A', title: '주일' }]));
    const { result } = renderHook(() => usePlaylists(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith('/api/worship-video/playlists');
    expect(result.current.data).toEqual([{ id: 'A', title: '주일' }]);
  });
});
