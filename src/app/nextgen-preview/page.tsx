// 임시 시안 — 다음세대 섹션 비교용 프리뷰(격리 공간). 확정 후 이 라우트 + _variants 폴더째 삭제.
// 실제 홈 전체를 미러하고 다음세대 자리만 시안으로 교체 → 위(LP 턴테이블)에서 스크롤로
// 진입할 때 "어둠 연속 → 여명으로 밝아짐"까지 실제 맥락에서 본다. 한 화면엔 한 시안만(하단 탭바).
// 섹션 순서는 실제 홈과 동일(LP → 다음세대 → 교회소식)로 맞춰 두 이음새가 실측되게 한다.
// ⚠️ 다른 세션의 next-generation-preview / CommunityGallery/_variants 와 무관(파일 미공유).
'use client';

import { useEffect, useState } from 'react';

import { ChurchNews } from '@/domains/home/components/widgets/ChurchNews';
import { FirstVisit } from '@/domains/home/components/widgets/FirstVisit';
import { HomeHero } from '@/domains/home/components/widgets/HomeHero';
import { HomeLead } from '@/domains/home/components/widgets/HomeLead';
import { LocationMap } from '@/domains/home/components/widgets/LocationMap';
import { TurntableStage } from '@/domains/home/components/widgets/RecentSermons/TurntableStage';
import { VariantCombo } from '@/domains/home/components/widgets/RecentSermons/VariantCombo';
import { WorshipTimes } from '@/domains/home/components/widgets/WorshipTimes';

import { NEXTGEN_VARIANTS } from './_variants';

export default function NextgenPreviewPage() {
  const [selected, setSelected] = useState('develop');

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('v');
    if (v && NEXTGEN_VARIANTS.some((x) => x.id === v)) setSelected(v);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('v', selected);
    window.history.replaceState(null, '', url);
  }, [selected]);

  const active = NEXTGEN_VARIANTS.find((x) => x.id === selected) ?? NEXTGEN_VARIANTS[0];
  const Active = active.C;

  return (
    <>
      <style>{`
        body { padding-bottom: 92px; }
        /* C 별자리 빛점 반짝임 */
        @keyframes ng-twinkle { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
        .ng-twinkle { animation: ng-twinkle 3.2s ease-in-out infinite; }
        /* C·E 부유 — transform 미사용(translate 프로퍼티)로 호버 효과와 충돌 회피 */
        @keyframes ng-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -9px; } }
        .ng-float { animation: ng-float 6.5s ease-in-out infinite; }
        /* E 오로라 드리프트 */
        @keyframes ng-aurora {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(4%, -3%) scale(1.12); }
          66% { transform: translate(-3%, 4%) scale(0.94); }
        }
        .ng-aurora { animation: ng-aurora 22s ease-in-out infinite; }
        /* V 성문 열림 — 디테일 등장 */
        @keyframes ng-gate { from { opacity: 0; transform: scale(0.965); } to { opacity: 1; transform: scale(1); } }
        /* X 인플레이스 개화 — 별 자리에서 만개 */
        @keyframes ng-bloom { from { opacity: 0; transform: scale(0.2); } to { opacity: 1; transform: scale(1); } }
        /* Q 랙 포커스 — 호버 시 배경 천체층만 흐려지고(섹션 그라데이션은 유지) 비호버 별은 가라앉음 (리렌더 0) */
        .ng-qback { transition: filter .5s ease, opacity .5s ease; }
        .ng-star { transition: opacity .35s ease; }
        .ng-qstage:has(.ng-star:hover) .ng-qback,
        .ng-qstage:has(.ng-star:focus-visible) .ng-qback { filter: blur(5px); opacity: .5; }
        .ng-qstage:has(.ng-star:hover) .ng-star:not(:hover),
        .ng-qstage:has(.ng-star:focus-visible) .ng-star:not(:focus-visible) { opacity: .3; }
        @media (prefers-reduced-motion: reduce) {
          .ng-twinkle, .ng-float, .ng-aurora { animation: none; }
        }
      `}</style>

      {/* 실제 홈 구성 미러 — 다음세대(LP 아래) 자리만 시안으로 교체 */}
      <HomeHero />
      <div className="bg-b1-bg relative z-0">
        <HomeLead />
        <WorshipTimes />
        <VariantCombo />
        {/* LP 턴테이블 — 스크롤 끝에서 화면을 어둠(#0b0b0d)으로 덮는다 */}
        <TurntableStage endW={80} endH={45} endRadiusPx={16} darkHex="#0b0b0d" />
        {/* 다음세대 시안 (어둠 연속 → 여명) */}
        <div id="ng-slot" key={selected}>
          <Active />
        </div>
        {/* 여명이 풀린 뒤 밝은 영역으로 이어짐 */}
        <ChurchNews />
        <LocationMap />
        <FirstVisit />
      </div>

      {/* 고정 시안 탭바 (하단) */}
      <div className="fixed inset-x-0 bottom-0 z-[9999] border-t border-slate-200 bg-white/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1320px] flex-nowrap items-center gap-1.5 overflow-x-auto px-3 py-2 text-[12px] whitespace-nowrap">
          <span className="mr-1 shrink-0 font-bold text-slate-400">다음세대 다크 시안</span>
          {NEXTGEN_VARIANTS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelected(v.id)}
              className={`shrink-0 rounded-full px-3 py-1 font-semibold transition-colors ${
                selected === v.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="truncate px-3 pb-2 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">타이틀 “{active.title}”</span> · {active.desc}
        </p>
      </div>
    </>
  );
}
