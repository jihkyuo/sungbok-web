import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { HomeVideoFeedData } from './homeVideoFeed';
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
};

const fetchMock = vi.fn();

const makeWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client: queryClient }, children);
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

  it('500 → error', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) } as Response);
    const { result } = renderHook(() => useHomeVideoFeed(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toContain('500');
    expect(result.current.notices).toEqual([]);
  });
});
