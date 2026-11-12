import { WorshipTimesDesktop } from '@/domains/home/components/widgets/WorshipTimes/desktop';
import { WorshipTimesMobile } from '@/domains/home/components/widgets/WorshipTimes/mobile';

/**
 * 예배 시간표(제목 없이 표만) — 홈 «이번 주 예배» 섹션과 찾아오시는 길 페이지가 함께 쓴다.
 * 휴대폰·태블릿: 그룹 리스트 / PC(lg 이상): 정류장 타임라인 — 타임라인은 1024 미만에서 열이 좁아 줄이 깨진다.
 */
export const WorshipTimesTable = () => (
  <>
    <div className="lg:hidden">
      <WorshipTimesMobile />
    </div>
    <div className="hidden lg:block">
      <WorshipTimesDesktop />
    </div>
  </>
);
