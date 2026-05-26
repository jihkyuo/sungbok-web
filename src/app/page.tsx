import { CommunityGallery } from '@/domains/home/components/widgets/CommunityGallery';
import { HomeHero } from '@/domains/home/components/widgets/HomeHero';
import { HomeLead } from '@/domains/home/components/widgets/HomeLead';
import { LocationMap } from '@/domains/home/components/widgets/LocationMap';
import { RecentSermons } from '@/domains/home/components/widgets/RecentSermons';
import { VariantCombo } from '@/domains/home/components/widgets/RecentSermons/_variants/VariantCombo';
import { VisitorAndNews } from '@/domains/home/components/widgets/VisitorAndNews';
import { WorshipTimes } from '@/domains/home/components/widgets/WorshipTimes';

export default function Home() {
  return (
    <>
      {/* 고정 전경 히어로 (HomeHero 안에 fixed 히어로 + 스크롤 spacer) */}
      <HomeHero />
      {/* 히어로 위로 차오르는 불투명 묶음 — HomeLead(표어·담임목사) + 기존 섹션 */}
      <div className="bg-b1-bg relative z-0">
        <HomeLead />
        <WorshipTimes />
        {/* 조합 시안 — 기존 최근설교 위. 시안 확정 시 정식 컴포넌트로 이식 후 제거 */}
        <VariantCombo />
        <RecentSermons />
        <CommunityGallery />
        <VisitorAndNews />
        <LocationMap />
      </div>
    </>
  );
}
