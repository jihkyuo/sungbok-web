import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  focusManager,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HOME_VIDEO_QUERY_KEY, type HomeVideoFeedData } from './homeVideoFeed';
import { useHomeVideoFeed } from './useHomeVideoFeed';

const DATA: HomeVideoFeedData = {
  live: null,
  sermon: {
    id: 'acts64',
    title: '사도행전 강해 64 | 제목 | 사도행전 13:1-3 | 이요셉 목사',
    description: '',
    publishedAt: '2026-10-11T04:20:00Z',
    thumbnail: 'https://i.ytimg.com/vi/acts64/maxresdefault.jpg',
    durationSec: 2452,
    broadcast: 'none',
    liveStart: null,
  },
  notices: [],
  staleMs: 0,
};

const fetchMock = vi.fn();

const makeWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useHomeVideoFeed', () => {
  it('초기값은 loading · 빈 광고 목록', () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useHomeVideoFeed(), { wrapper: makeWrapper() });
    expect(result.current.status).toBe('loading');
    expect(result.current.notices).toEqual([]);
    expect(result.current.live).toBeNull();
    expect(result.current.sermon).toBeNull();
  });

  it('/api/home-video 200 → ready + 데이터 그대로', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => DATA } as Response);
    const { result } = renderHook(() => useHomeVideoFeed(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(fetchMock).toHaveBeenCalledWith('/api/home-video');
    expect(result.current.sermon).toEqual(DATA.sermon);
    expect(result.current.live).toBeNull();
    expect(result.current.notices).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('쿼터 소진(429)은 다시 요청하지 않는다 — 기본 재시도(3회)로 쿼터를 더 태우지 않게', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, json: async () => ({}) } as Response);
    const client = new QueryClient(); // 기본값(재시도 3회)을 두고, 훅의 정책이 이기는지 본다
    const Wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);
    const { result } = renderHook(() => useHomeVideoFeed(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  const LIVE = { ...DATA.sermon!, id: 'live1', broadcast: 'live' as const };
  const withClient = (client: QueryClient) => {
    const Wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);
    return Wrapper;
  };

  it('마지막 성공 뒤 10분 넘게 실패가 이어지면 라이브만 내린다 — 끝난 라이브가 계속 «ON AIR» 로 남지 않게', async () => {
    const client = new QueryClient();
    client.setQueryData(
      HOME_VIDEO_QUERY_KEY,
      { ...DATA, live: LIVE },
      { updatedAt: Date.now() - 11 * 60_000 }
    );
    fetchMock.mockResolvedValue({ ok: false, status: 429, json: async () => ({}) } as Response);
    const { result } = renderHook(() => useHomeVideoFeed(), { wrapper: withClient(client) });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(result.current.live).toBeNull());
    expect(result.current.sermon).toEqual(DATA.sermon); // 설교·광고는 그대로
  });

  it('실패해도 10분이 안 됐으면 라이브를 그대로 둔다', async () => {
    const client = new QueryClient();
    client.setQueryData(
      HOME_VIDEO_QUERY_KEY,
      { ...DATA, live: LIVE },
      { updatedAt: Date.now() - 2 * 60_000 }
    );
    fetchMock.mockResolvedValue({ ok: false, status: 429, json: async () => ({}) } as Response);
    const { result } = renderHook(() => useHomeVideoFeed(), { wrapper: withClient(client) });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await new Promise(r => setTimeout(r, 50));
    expect(result.current.live?.id).toBe('live1');
  });

  it('서버가 대신 준 응답의 나이(staleMs)도 더한다 — 서버 9분 + 화면 2분이면 내린다(10분+10분으로 늘지 않게)', async () => {
    const client = new QueryClient();
    client.setQueryData(
      HOME_VIDEO_QUERY_KEY,
      { ...DATA, live: LIVE, staleMs: 9 * 60_000 },
      { updatedAt: Date.now() - 2 * 60_000 }
    );
    fetchMock.mockResolvedValue({ ok: false, status: 429, json: async () => ({}) } as Response);
    const { result } = renderHook(() => useHomeVideoFeed(), { wrapper: withClient(client) });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(result.current.live).toBeNull());
  });

  it('미리 채운 피드의 영상 정보가 이미 10분 넘었으면 첫 화면부터 라이브를 숨기고 곧바로 다시 받는다', async () => {
    const server = new QueryClient();
    server.setQueryData(HOME_VIDEO_QUERY_KEY, { ...DATA, live: LIVE, staleMs: 11 * 60_000 });
    const state = dehydrate(server);
    const client = new QueryClient();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ...DATA, live: LIVE, staleMs: 0 }),
    } as Response);
    const Wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QueryClientProvider,
        { client },
        createElement(HydrationBoundary, { state }, children)
      );
    const { result } = renderHook(() => useHomeVideoFeed(), { wrapper: Wrapper });
    expect(result.current.live).toBeNull(); // 서버 HTML 과 같은 판단 — 하이드레이션 어긋남 없음
    await waitFor(() => expect(result.current.live?.id).toBe('live1')); // 60초 기다리지 않고 바로 확인
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('화면에 내보내는 값에는 staleMs 를 싣지 않는다', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => DATA } as Response);
    const { result } = renderHook(() => useHomeVideoFeed(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current).not.toHaveProperty('staleMs');
  });

  it('500 → error', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) } as Response);
    const { result } = renderHook(() => useHomeVideoFeed(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toContain('500');
    expect(result.current.notices).toEqual([]);
  });
  it('서버가 미리 채운 피드가 있으면 첫 렌더부터 ready — 회색 자리표시 없이, 유튜브 재요청 없이', () => {
    const server = new QueryClient();
    server.setQueryData(HOME_VIDEO_QUERY_KEY, DATA);
    const state = dehydrate(server);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const Wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QueryClientProvider,
        { client },
        createElement(HydrationBoundary, { state }, children)
      );

    const { result } = renderHook(() => useHomeVideoFeed(), { wrapper: Wrapper });

    expect(result.current.status).toBe('ready');
    expect(result.current.sermon).toEqual(DATA.sermon);
    // 방금 받은 데이터(60초 이내)라 마운트 때 다시 부르지 않는다
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('짧은 앱 전환은 다시 조회하지 않고, 오래 비운 뒤에는 기존 화면을 유지하며 갱신한다', async () => {
    vi.useFakeTimers();
    const client = new QueryClient();
    client.setQueryData(HOME_VIDEO_QUERY_KEY, DATA);
    fetchMock.mockReturnValue(new Promise(() => {}));
    const { result, unmount } = renderHook(() => useHomeVideoFeed(), {
      wrapper: withClient(client),
    });
    try {
      act(() => {
        focusManager.setFocused(false);
      });
      act(() => vi.advanceTimersByTime(10_000));
      await act(async () => {
        focusManager.setFocused(true);
      });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.current.status).toBe('ready');

      act(() => {
        focusManager.setFocused(false);
      });
      act(() => vi.advanceTimersByTime(70_000));
      expect(fetchMock).not.toHaveBeenCalled();
      await act(async () => {
        focusManager.setFocused(true);
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(result.current.status).toBe('ready');
      expect(result.current.sermon).toEqual(DATA.sermon);
    } finally {
      unmount();
      client.clear();
      focusManager.setFocused(undefined);
      vi.useRealTimers();
    }
  });
});
