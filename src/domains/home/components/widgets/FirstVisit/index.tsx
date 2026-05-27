// 처음 오신 분께 — 풀블리드 + 스크롤 고정 배경(background-attachment:fixed) + 글래스 카드.
// 상세 절차(등록·5주 과정)와 등록·문의 폼은 우하단 플로팅 패널(RegisterPanel)에서.
// 배경은 임시 stand-in(self-host) — 확정 시 교회 실제 사진으로 교체.
// ⚠️ iOS Safari 는 background-attachment:fixed 미지원(스크롤로 폴백) — 모바일 폴백은 후속 과제.
'use client';

import { ArrowRight } from 'lucide-react';

import bg from '@/assets/images/main/first-visit.jpg';

import { SECTION } from './data';
import { MorphPanel, usePanelFlow } from './RegisterPanel';

export const FirstVisit = () => {
  const flow = usePanelFlow();
  return (
    <>
      <section className="relative flex min-h-[80vh] items-center overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg.src})`, backgroundAttachment: 'fixed' }}
        />
        <div aria-hidden className="absolute inset-0 bg-slate-950/35" />
        <div className="relative z-10 w-full px-[6vw]">
          <div className="mx-auto max-w-[1320px]">
            <div className="max-w-[460px] rounded-3xl border border-white/25 bg-white/10 p-8 text-white backdrop-blur-md md:p-10">
              <div className="b1-mono mb-4 text-[11px] tracking-[0.2em] text-white/80">
                {SECTION.eyebrow}
              </div>
              <h2 className="m-0 text-[30px] leading-[1.12] font-bold tracking-[-0.02em] md:text-[40px]">
                {SECTION.headingShort}
              </h2>
              <p className="mt-4 text-[15px] leading-[1.8] text-white/90">{SECTION.lead}</p>
              <button
                type="button"
                onClick={flow.openPanel}
                className="text-b1-accent mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14px] font-bold transition-transform hover:-translate-y-0.5"
              >
                {SECTION.ctaLabel}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <MorphPanel flow={flow} />
    </>
  );
};
