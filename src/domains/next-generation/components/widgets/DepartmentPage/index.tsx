'use client';
// 다음세대 부서 페이지 — 도입부(Intro) 한 벌 + 사진 쇼케이스(900px 이상 «놓기» · 899px 이하 «부채»). ADR 0007.
// 쇼케이스만 갈아 끼우고 도입부는 그대로 둔다(창 폭이 899↔900 을 넘어도 도입부는 다시 그리지 않는다).
// 서버 스냅샷은 데스크톱 — 쇼케이스는 100svh 핀 아래라 모바일의 하이드레이션 교체는 첫 화면 밖에서 일어난다.
import { useSyncExternalStore } from 'react';

import Fan from './Fan';
import Intro from './Intro';
import Landing from './Landing';
import type { DepartmentPageProps } from './types';

const MQ = '(max-width: 899px)';
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(MQ);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};
const getSnapshot = () => window.matchMedia(MQ).matches;
const getServerSnapshot = () => false;

export function DepartmentPage({ dept, photos }: DepartmentPageProps) {
  const mobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <Intro dept={dept} door={photos[0]}>
      {mobile ? <Fan photos={photos} /> : <Landing photos={photos} />}
    </Intro>
  );
}
