import { ChurchNews } from '@/domains/home/components/widgets/ChurchNews';
import { FirstVisit } from '@/domains/home/components/widgets/FirstVisit';
import { HomeHero } from '@/domains/home/components/widgets/HomeHero';
import { HomeLead } from '@/domains/home/components/widgets/HomeLead';
import { LiveStage } from '@/domains/home/components/widgets/LiveStage';
import { LocationMap } from '@/domains/home/components/widgets/LocationMap';
// import { NextGeneration } from '@/domains/home/components/widgets/NextGeneration';
import { NoticeReel } from '@/domains/home/components/widgets/NoticeReel';
// import { TurntableStage } from '@/domains/home/components/widgets/RecentSermons/TurntableStage';
import { WorshipTimes } from '@/domains/home/components/widgets/WorshipTimes';

export default function Home() {
  return (
    <>
      {/* 히어로 (HomeHero: 정적 — 카피 좌측 정렬 + 우측 전경, 스크롤 트랙 없음) */}
      <HomeHero />
      {/* 히어로 다음 섹션 묶음 — HomeLead(표어·담임목사) + 기존 섹션 */}
      <div className="bg-b1-bg relative z-0">
        <HomeLead />
        <WorshipTimes />
        {/* 라이브 스테이지 — 라이브면 무음 자동재생, 아니면 담임목사 최신 설교 */}
        <LiveStage />
        {/* 광고 릴 — 재생목록 로테이션 */}
        <NoticeReel />
        {/* 임시 비노출 — 코드 보존. 복원 시 아래 두 섹션 + 상단 import 주석 해제
        {/* 청년 예배 영상 — LP 턴테이블 *\/}
        <TurntableStage endW={80} endH={45} endRadiusPx={16} darkHex="#0b0b0d" />
        {/* 다음세대 — LP 어둠 연속 → 여명. 밤하늘 별자리 + 커서 추종 카드 *\/}
        <NextGeneration />
        */}
        {/* 교회 소식 — 좌 헤드라인 + 우 카드 뉴스 */}
        <ChurchNews />
        <LocationMap />
        {/* 처음 오신 분께 (새신자) — 풀블리드 + 스크롤 고정 배경 + 등록·문의 플로팅 패널 */}
        <FirstVisit />
      </div>
    </>
  );
}
