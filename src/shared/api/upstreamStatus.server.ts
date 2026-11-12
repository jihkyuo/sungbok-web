// 유튜브 실패를 우리 API(Route Handler) 응답 상태로 바꾼다 — 화면은 이 상태로 다시 시도할지 가른다(fetchJson.retryTransient).

import 'server-only'; // 화면(클라이언트) 코드가 가져다 쓰면 빌드가 실패한다 — 키·쿼터는 서버에만
import { YoutubeApiError, YoutubeNetworkError } from './youtubeApi.server';

// 하루 쿼터 소진 — 다시 해도 같고 쿼터만 더 탄다(하루 단위로 풀린다).
const QUOTA_REASONS = new Set(['quotaExceeded', 'dailyLimitExceeded']);
// 짧은 속도 제한 — 초·분 단위로 풀린다.
const RATE_REASONS = new Set(['rateLimitExceeded', 'userRateLimitExceeded']);

/** 429: 쿼터 소진(화면은 재시도 안 함) / 503: 잠시 뒤 풀릴 실패(화면이 재시도) / 502: 다시 해도 같은 실패. */
export const upstreamStatus = (e: unknown): number => {
  if (e instanceof YoutubeApiError) {
    if (QUOTA_REASONS.has(e.reason ?? '')) return 429;
    if (RATE_REASONS.has(e.reason ?? '') || e.status === 429 || e.status >= 500) return 503;
    return 502; // 키 오류·잘못된 요청 등 그 밖의 4xx
  }
  if (e instanceof YoutubeNetworkError) return 503;
  // 우리 코드 버그(TypeError 포함)·응답 모양 오류(YoutubeShapeError) — 다시 해도 같아 재시도하지 않게
  return 502;
};

/**
 * Route Handler 의 catch 에서 그대로 돌려줄 응답. 원인은 서버 로그에만 남기고, 응답에는 짧은 코드만 싣는다 —
 * 내부 오류 메시지(경로·코드 버그 내용)가 누구나 볼 수 있는 응답에 나가지 않게.
 */
export const upstreamErrorResponse = (e: unknown) => {
  const status = upstreamStatus(e);
  console.error('[upstream]', status, e);
  const error = status === 429 ? 'quota' : status === 503 ? 'unavailable' : 'upstream';
  return Response.json({ error }, { status });
};
