import { prefetchHomeVideo } from '@/domains/home/api/homeVideoPrefetch.server';
import { ChurchNews } from '@/domains/home/components/widgets/ChurchNews';
import { FirstVisit } from '@/domains/home/components/widgets/FirstVisit';
import { HomeLead } from '@/domains/home/components/widgets/HomeLead';
import { LiveStage } from '@/domains/home/components/widgets/LiveStage';
import { LocationMap } from '@/domains/home/components/widgets/LocationMap';
import { NextGeneration } from '@/domains/home/components/widgets/NextGeneration';
import { NoticeReel, NoticeReelSkeleton } from '@/domains/home/components/widgets/NoticeReel';
import { HomeVideoWarmup } from '@/domains/home/components/widgets/HomeVideoWarmup';
import { Section } from '@/domains/home/components/features/Section';
import { TurntableStage } from '@/domains/home/components/widgets/RecentSermons/TurntableStage';
import { WorshipTimes } from '@/domains/home/components/widgets/WorshipTimes';
import { HydrationBoundary, type DehydratedState } from '@tanstack/react-query';
import { Suspense } from 'react';

// 영상 정보 조회는 요청 시작과 함께 진행하지만, 첫 화면은 조회를 기다리지 않는다.
// 영상 영역만 별도로 스트리밍하고, 브라우저에서는 기존의 60초 폴링을 유지한다.
export const revalidate = 60;

const HomeVideoFallback = () => (
  <div role="status" aria-label="영상 정보 준비 중">
    <Section>
      <div className="bg-b1-border/40 aspect-[21/9] rounded-3xl" aria-hidden />
      <div
        className="bg-b1-surface border-b1-border relative mx-auto -mt-10 h-28 max-w-[640px] rounded-2xl border md:mr-10 md:ml-auto"
        aria-hidden
      />
    </Section>
    <NoticeReelSkeleton />
  </div>
);

const HomeVideoSections = async ({ state }: { state: Promise<DehydratedState | undefined> }) => (
  <HydrationBoundary state={await state}>
    <LiveStage />
    <NoticeReel />
  </HydrationBoundary>
);

export default function Home() {
  // 홈의 장식·영상 조회 실패가 첫 화면 전체를 오류로 바꾸지 않게 한다.
  // 서버에서 못 채운 경우 영상 부품의 기존 useQuery가 /api/home-video 조회를 이어간다.
  const videoState = prefetchHomeVideo().catch(() => undefined);
  return (
    <>
      {/* 히어로 → 사진 띠 → 표어 → 담임 (HomeLead 가 HomeHero 를 품고 변형 무대로 잇는다) */}
      <HomeLead />
      <HomeVideoWarmup />
      <div className="bg-b1-bg relative z-0">
        <WorshipTimes />
        {/* 영상 준비는 첫 화면과 독립적으로 완료되는 대로 반영한다. */}
        <Suspense fallback={<HomeVideoFallback />}>
          <HomeVideoSections state={videoState} />
        </Suspense>
        {/* LP 턴테이블·다음세대 별자리는 폰(768px 미만)에서 숨긴다 — 넓은 화면용 인터랙션이고(기획 요구 8),
            별자리는 touch-action:none 이라 폰에서 그 화면 높이만큼 스크롤이 막힌다. 폰 대체 화면은 따로 만든다.
            숨겨져 있으면 화면 근처 감지가 안 걸려 턴테이블 유튜브 임베드·회전 루프도 시작하지 않는다. */}
        <div className="hidden md:block">
          {/* 청년 예배 영상 — LP 턴테이블 */}
          <TurntableStage endW={80} endH={45} endRadiusPx={16} darkHex="#0b0b0d" />
          {/* 다음세대 — LP 어둠 연속 → 여명. 밤하늘 별자리 + 커서 추종 카드 */}
          <NextGeneration />
        </div>
        {/* 교회 소식 — 좌 헤드라인 + 우 카드 뉴스 */}
        <ChurchNews />
        <LocationMap />
        {/* 처음 오신 분께 (새신자) — 풀블리드 + 스크롤 고정 배경 + 등록·문의 플로팅 패널 */}
        <FirstVisit />
      </div>
    </>
  );
}
