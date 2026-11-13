// 처음 오신 분께 — 풀블리드 + 스크롤 고정 배경(background-attachment:fixed) + 글래스 카드.
// 상세 절차(등록·5주 과정)와 등록·문의 폼은 우하단 플로팅 패널(RegisterPanel)에서.
// 배경은 임시 stand-in(self-host) — 확정 시 교회 실제 사진으로 교체.
// 고정 배경은 마우스 기기(pointer: fine)에서만 쓴다. iOS Safari(폰·아이패드)는 fixed 배경을 페이지 전체 높이에
// 맞춰 cover 해서 사진 한 귀퉁이만 수십 배 확대돼(흐릿한 색 덩어리) 보인다 — 터치 기기는 일반 스크롤 배경.
'use client';

import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';

import bg from '@/assets/images/main/first-visit.webp';
import { useNearViewport } from '@/shared/lib/hooks/useNearViewport';

import { SECTION } from './data';
import { MorphPanel, usePanelFlow } from './RegisterPanel';

export const FirstVisit = () => {
  const flow = usePanelFlow();
  // CSS 배경은 화면 밖이어도 페이지를 열자마자 받는다 — 페이지 맨 아래 섹션이라 첫 화면과 회선을 다투지 않게
  // 두 화면 거리 안에 들어왔을 때 붙인다. 그 전에는 어두운 바탕(bg-b1-text)이 깔려 흰 글씨 대비를 지킨다.
  const sectionRef = useRef<HTMLElement>(null);
  const near = useNearViewport(sectionRef);
  return (
    <>
      <section ref={sectionRef} className="relative flex min-h-[80vh] items-center overflow-hidden">
        <div
          aria-hidden
          className="bg-b1-text absolute inset-0 bg-cover bg-center pointer-fine:bg-fixed"
          style={near ? { backgroundImage: `url(${bg.src})` } : undefined}
        />
        <div aria-hidden className="absolute inset-0 bg-slate-950/35" />
        <div className="relative z-10 w-full px-[6vw]">
          <div className="mx-auto max-w-[1320px]">
            <div className="max-w-[460px] rounded-3xl border border-white/25 bg-white/10 p-8 text-white backdrop-blur-md md:p-10">
              <div className="b1-mono text-eyebrow mb-4 tracking-[0.2em] text-white/80">
                {SECTION.eyebrow}
              </div>
              <h2 className="m-0 text-[30px] leading-[1.12] font-bold tracking-[-0.02em] md:text-[40px]">
                {SECTION.headingShort}
              </h2>
              <p className="text-body-sm mt-4 leading-[1.8] text-white/90">{SECTION.lead}</p>
              <button
                type="button"
                onClick={flow.openPanel}
                className="text-b1-accent text-label mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold transition-transform hover:-translate-y-0.5"
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
