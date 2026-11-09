import { prefetchHomeVideo } from '@/domains/home/api/homeVideoPrefetch.server';
import { ChurchNews } from '@/domains/home/components/widgets/ChurchNews';
import { FirstVisit } from '@/domains/home/components/widgets/FirstVisit';
import { HomeLead } from '@/domains/home/components/widgets/HomeLead';
import { LiveStage } from '@/domains/home/components/widgets/LiveStage';
import { LocationMap } from '@/domains/home/components/widgets/LocationMap';
import { NextGeneration } from '@/domains/home/components/widgets/NextGeneration';
import { NoticeReel } from '@/domains/home/components/widgets/NoticeReel';
import { TurntableStage } from '@/domains/home/components/widgets/RecentSermons/TurntableStage';
import { WorshipTimes } from '@/domains/home/components/widgets/WorshipTimes';
import { HydrationBoundary } from '@tanstack/react-query';

// 홈은 60초마다 서버에서 다시 만든다(ISR). 그때 유튜브 피드(라이브·설교·광고)를 넣어 두어 첫 화면부터 영상이 차 있다.
// 방문자는 캐시된 HTML 을 바로 받고(유튜브를 기다리지 않음), 연 뒤에는 브라우저가 60초마다 다시 확인한다.
export const revalidate = 60;

export default async function Home() {
  return (
    <HydrationBoundary state={await prefetchHomeVideo()}>
      {/* 히어로 → 사진 띠 → 표어 → 담임 (HomeLead 가 HomeHero 를 품고 변형 무대로 잇는다) */}
      <HomeLead />
      <div className="bg-b1-bg relative z-0">
        <WorshipTimes />
        {/* 라이브 스테이지 — 라이브면 무음 자동재생, 아니면 담임목사 최신 설교 */}
        <LiveStage />
        {/* 광고 릴 — 재생목록 로테이션 */}
        <NoticeReel />
        {/* 청년 예배 영상 — LP 턴테이블 */}
        <TurntableStage endW={80} endH={45} endRadiusPx={16} darkHex="#0b0b0d" />
        {/* 다음세대 — LP 어둠 연속 → 여명. 밤하늘 별자리 + 커서 추종 카드 */}
        <NextGeneration />
        {/* 교회 소식 — 좌 헤드라인 + 우 카드 뉴스 */}
        <ChurchNews />
        <LocationMap />
        {/* 처음 오신 분께 (새신자) — 풀블리드 + 스크롤 고정 배경 + 등록·문의 플로팅 패널 */}
        <FirstVisit />
      </div>
    </HydrationBoundary>
  );
}
