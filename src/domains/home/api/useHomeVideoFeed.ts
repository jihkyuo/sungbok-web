// 홈 영상 피드 훅 — 서버 Route Handler(`/api/home-video`)를 60초 간격으로 폴링한다. 유튜브는 직접 부르지 않는다.
'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { HomeVideoFeed, HomeVideoFeedData } from './homeVideoFeed';

const fetchFeed = async (): Promise<HomeVideoFeedData> => {
  const r = await fetch('/api/home-video');
  if (!r.ok) throw new Error(`home-video ${r.status}`);
  return (await r.json()) as HomeVideoFeedData;
};

export const useHomeVideoFeed = (): HomeVideoFeed => {
  const q = useQuery({
    queryKey: ['home-video'],
    queryFn: fetchFeed,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
  });
  return useMemo(
    () =>
      q.data
        ? { status: 'ready', ...q.data, error: null }
        : { status: q.isError ? 'error' : 'loading', live: null, sermon: null, notices: [], error: q.error ? String(q.error) : null },
    [q.data, q.isError, q.error],
  );
};
