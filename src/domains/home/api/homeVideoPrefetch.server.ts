// 홈 영상 피드를 서버에서 미리 받아 react-query 상태로 실어 보낸다 — 서버 전용(`src/app/page.tsx` 만 import).
// 홈은 ISR 60초: 서버가 HTML 을 다시 만들 때 피드를 넣고, 방문자는 캐시된 HTML 을 바로 받는다(유튜브를 기다리지 않음).
// 첫 화면부터 영상이 차 있어 회색 자리표시(스켈레톤)와 그게 빠지며 생기는 레이아웃 튐이 없다.
// 페이지를 연 뒤에는 useHomeVideoFeed 가 지금처럼 60초마다 `/api/home-video` 를 다시 확인한다.

import 'server-only'; // 화면(클라이언트) 코드가 가져다 쓰면 빌드가 실패한다 — 키·쿼터는 서버에만

import { prefetchForIsr } from '@/shared/api/prefetchForIsr.server';

import { HOME_VIDEO_QUERY_KEY } from './homeVideoFeed';
import { fetchHomeVideoFeed } from './homeVideoFeed.server';

// 조회 실패는 호출자에게 전달한다. 홈은 영상 영역을 별도 Suspense 경계에 두고 실패를 빈 상태로 바꿔,
// 첫 화면을 유지하면서 브라우저의 `/api/home-video` 조회로 이어간다. 공용 ISR 실패 규칙 자체는 유지한다.
export const prefetchHomeVideo = () =>
  prefetchForIsr(client =>
    client.prefetchQuery({ queryKey: HOME_VIDEO_QUERY_KEY, queryFn: fetchHomeVideoFeed })
  );
