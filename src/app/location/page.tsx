import { WorshipTimesTable } from '@/domains/home/components/widgets/WorshipTimes/WorshipTimesTable';
import { SectionShell } from '@/shared/components/layout/SectionShell';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '찾아오시는 길 | 성복교회' };

// 예배 시간표 — 예배 메뉴의 «예배 안내»에서 옮겨 왔다(2026-11-12, 예배 메뉴는 영상만). 처음 오는 분이
// 언제·어디로를 한 페이지에서 본다. 시간표는 홈 예배 시간 섹션과 같은 부품(WorshipTimesTable).
export default function Page() {
  return (
    <SectionShell section="location">
      {/* 홈 «이번 주 예배» 의 링크(/location#worship-times)가 여기로 온다. 고정 헤더 보정은 전역 scroll-padding-top 이 한다 */}
      <section id="worship-times" aria-labelledby="worship-times-title">
        <h2 id="worship-times-title" className="text-b1-text text-h3 mb-5 text-balance md:mb-6">
          예배 시간
        </h2>
        <WorshipTimesTable />
      </section>
      <section aria-labelledby="directions-title" className="mt-14 md:mt-20">
        <h2 id="directions-title" className="text-b1-text text-h3 mb-5 text-balance md:mb-6">
          오시는 길
        </h2>
        {/* PagePlaceholder 를 쓰지 않는다 — 그 표시(data-page-placeholder)가 있으면 design:audit 가 이 페이지(예배 시간표)를 건너뛴다 */}
        <p className="text-b1-sub text-body">오시는 길 안내는 준비 중입니다.</p>
      </section>
    </SectionShell>
  );
}
