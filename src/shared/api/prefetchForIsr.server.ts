// 서버 미리 채우기(ISR 페이지)의 공용 실패 규칙 — 홈 영상·주일예배가 같이 쓴다.
import 'server-only'; // 화면(클라이언트) 코드가 가져다 쓰면 빌드가 실패한다

import { dehydrate, QueryClient, type DehydratedState } from '@tanstack/react-query';

import { isRuntimeRegeneration } from '@/shared/lib/isRuntimeRegeneration';

/**
 * fill 에서 prefetchQuery 로 채운 뒤 react-query 상태로 돌려준다. 실패한 쿼리는 싣지 않는다(화면이 이어서 받는다).
 * 운영 중 재생성에서 하나라도 실패하면 던진다 — Next 가 직전에 성공한 페이지를 계속 보여 준다.
 * 빌드(쿼터가 바닥난 날에도 배포는 된다)·개발 서버에서는 던지지 않는다.
 */
export const prefetchForIsr = async (
  fill: (client: QueryClient) => Promise<unknown>
): Promise<DehydratedState> => {
  // prefetchQuery 는 실패를 삼키고 쿼리 상태에 남긴다 — 그 상태를 보고 판단한다.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await fill(client);
  const failed = client
    .getQueryCache()
    .getAll()
    .find(q => q.state.status === 'error');
  if (failed && isRuntimeRegeneration()) throw failed.state.error;
  return dehydrate(client);
};
