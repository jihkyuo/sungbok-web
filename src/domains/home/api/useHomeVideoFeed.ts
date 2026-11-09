// 홈 영상 피드 훅 — 서버 Route Handler(`/api/home-video`)를 60초 간격으로 폴링한다. 유튜브는 직접 부르지 않는다.
'use client';

import { fetchJson, retryTransient } from '@/shared/api/fetchJson';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  HOME_VIDEO_QUERY_KEY,
  isLiveStale,
  LIVE_MAX_AGE,
  type HomeVideoFeed,
  type HomeVideoFeedData,
} from './homeVideoFeed';

const fetchFeed = () => fetchJson<HomeVideoFeedData>('/api/home-video');

export const useHomeVideoFeed = (): HomeVideoFeed => {
  const q = useQuery({
    queryKey: HOME_VIDEO_QUERY_KEY,
    queryFn: fetchFeed,
    // 받은 영상 정보가 이미 10분 넘은 것(서버 캐시의 옛 응답)이면 60초 기다리지 않고 마운트 즉시 다시 받는다 —
    // 방송 시작 무렵 한산할 때 옛 응답 때문에 라이브가 1분 넘게 빠져 보이지 않게
    staleTime: ({ state }) => (state.data && state.data.staleMs > LIVE_MAX_AGE ? 0 : 60_000),
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    // 다시 해서 풀릴 실패(망 끊김·503)만 재시도 — 쿼터 소진(429)에 기본 3회 재시도로 쿼터를 더 태우지 않게
    retry: retryTransient,
  });
  // 라이브는 영상 정보 나이(서버가 잰 staleMs) + 받은 뒤 흐른 시간(마지막 확인 시각까지)이 10분을 넘으면 내린다 —
  // 쿼터 소진 등으로 실패가 이어질 때 끝난 라이브가 «ON AIR» 로 남지 않게. 설교·광고는 지난 것이어도 그대로 둔다.
  // 지금 시각(Date.now) 대신 react-query 가 기록한 시각을 써서, 서버 HTML 과 첫 화면이 같은 판단을 한다(하이드레이션 어긋남 없음).
  // 알고 둔 한계: ① 오래 묵은 ISR 페이지는 첫 화면에 끝난 라이브가 보일 수 있다 — 그 데이터는 60초가 지나 마운트 즉시
  // 다시 받으므로 1초 안에 바로잡힌다(첫 화면에서 기기 시계로 숨기면 방송 중 라이브가 깜빡인다). ② 미리 채운 데이터의
  // 시각은 서버 시계, 실패 시각은 기기 시계라 기기 시계가 10분 넘게 틀리고 실패가 이어질 때만 만료가 늦다.
  const lastCheckedAt = Math.max(q.dataUpdatedAt, q.errorUpdatedAt);
  const liveExpired = !!q.data && isLiveStale(q.data.staleMs, lastCheckedAt - q.dataUpdatedAt);
  return useMemo(
    () =>
      q.data
        ? {
            status: 'ready',
            live: liveExpired ? null : q.data.live,
            sermon: q.data.sermon,
            notices: q.data.notices,
            error: null,
          }
        : {
            status: q.isError ? 'error' : 'loading',
            live: null,
            sermon: null,
            notices: [],
            error: q.error ? String(q.error) : null,
          },
    [q.data, q.isError, q.error, liveExpired]
  );
};
