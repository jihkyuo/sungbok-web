import { ChurchNews } from '@/domains/home/components/widgets/ChurchNews';
import { CommunityGallery } from '@/domains/home/components/widgets/CommunityGallery';
import { FirstVisit } from '@/domains/home/components/widgets/FirstVisit';
import { HomeHero } from '@/domains/home/components/widgets/HomeHero';
import { HomeLead } from '@/domains/home/components/widgets/HomeLead';
import { LocationMap } from '@/domains/home/components/widgets/LocationMap';
import { TurntableStage } from '@/domains/home/components/widgets/RecentSermons/TurntableStage';
import { VariantCombo } from '@/domains/home/components/widgets/RecentSermons/VariantCombo';
import { WorshipTimes } from '@/domains/home/components/widgets/WorshipTimes';

export default function Home() {
  return (
    <>
      {/* 히어로 (HomeHero: sticky 200vh 트랙 — 중앙 카피 → 좌측 도킹 + 전경 등장) */}
      <HomeHero />
      {/* 히어로 다음 섹션 묶음 — HomeLead(표어·담임목사) + 기존 섹션 */}
      <div className="bg-b1-bg relative z-0">
        <HomeLead />
        <WorshipTimes />
        {/* 최근 설교 + 청년 영상 (조합) */}
        <VariantCombo />
        {/* 청년 예배 영상 — LP 턴테이블 */}
        <TurntableStage endW={80} endH={45} endRadiusPx={16} darkHex="#0b0b0d" />
        <CommunityGallery />
        {/* 교회 소식 — 좌 헤드라인 + 우 카드 뉴스 */}
        <ChurchNews />
        <LocationMap />
        {/* 처음 오신 분께 (새신자) — 풀블리드 + 스크롤 고정 배경 + 등록·문의 플로팅 패널 */}
        <FirstVisit />
      </div>
    </>
  );
}
