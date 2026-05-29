/**
 * HomeLead — v8. 전경 히어로 다음, 위로 차오르는 두 섹션(예배·담임목사).
 *
 * 배경은 루트 한 장에 깔린 전면(full-bleed) 그라데이션이다(섹션 오버레이 없음 → 경계선 없음).
 * 거의 수평이라 세로 위치와 무관하게 색이 일정하고, 스크롤(sp 0→1)에 따라 좌/우 스톱이 각각
 * 보간되며 예배(앰버, 문구 쪽 밝음)→담임(네이비)로 매끄럽게 어두워진다. 좌우 반전 레이아웃은
 * 스톱 배정으로 흡수(예배 사진 좌·문구 우 / 담임 문구 좌·사진 우; 모바일은 세로 스택).
 * 그 위로 따뜻한 강조 글로우가 좌상(예배 사진)→우하(담임 사진)으로 이동한다.
 * 담임 섹션은 네이비 위 흰 텍스트(강한 대비), 예배는 밝은 쪽 위 검은 텍스트.
 * 고정된 HomeHero 위로 차고 올라와 덮는다(page.tsx 의 불투명 래퍼가 스택 보장).
 *
 * 표어/담임목사 카피는 placeholder — 사무국 검수 필요.
 */
'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import pastorSign from '@/assets/images/pastor-sign.png';
import pastorImg from '@/assets/images/main/pastor.jpg';
import worshipImg from '@/assets/images/main/worship.jpg';

// 예배(앰버) → 담임목사(네이비). 전면 수평 그라데이션의 양 끝 스톱을 각각 보간한다.
const AMBER = [222, 146, 72]; // 예배 사진 쪽
const CREAM = [243, 210, 164]; // 예배 문구 쪽 — 살짝 더 밝은 라이트 앰버
const NAVY = [40, 52, 100]; // 담임 문구 쪽 (흰 텍스트 가독)
const DKNAVY = [14, 20, 46]; // 담임 사진 쪽 (가장 어두움)
const INITIAL_BG =
  'radial-gradient(54% 60% at 26.0% 38.0%, rgba(240,162,82,0.95) 0%, rgba(236,150,68,0.42) 40%, rgba(236,150,68,0) 70%),' +
  'linear-gradient(94deg, rgb(222,146,72) 0%, rgb(243,210,164) 100%)';

export const HomeLead = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const mix = (c1: number[], c2: number[], t: number) =>
      `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`;
    const leadBg = (sp: number) => {
      // 무빙 강조 글로우 — 좌상(예배 사진)→우하(담임 사진)으로 이동.
      const gx = 26 + sp * 48;
      const gy = 38 + sp * 42;
      const glow = `radial-gradient(54% 60% at ${gx.toFixed(1)}% ${gy.toFixed(1)}%, rgba(240,162,82,0.95) 0%, rgba(236,150,68,0.42) 40%, rgba(236,150,68,0) 70%)`;
      // 전면 그라데이션 — 거의 수평이라 세로 위치와 무관하게 "문구 쪽이 밝다"가 유지된다.
      // 좌우 반전 레이아웃을 스톱 배정으로 흡수: 데스크톱은 가로, 모바일(세로 스택)은 세로.
      const base =
        window.innerWidth < 860
          ? `linear-gradient(180deg, ${mix(CREAM, NAVY, sp)} 0%, ${mix(AMBER, DKNAVY, sp)} 100%)`
          : `linear-gradient(94deg, ${mix(AMBER, NAVY, sp)} 0%, ${mix(CREAM, DKNAVY, sp)} 100%)`;
      return `${glow}, ${base}`;
    };

    let ticking = false;
    const update = () => {
      const el = rootRef.current;
      if (el) {
        const vh = window.innerHeight;
        const r = el.getBoundingClientRect();
        const sp = clamp(-r.top / Math.max(1, el.offsetHeight - vh), 0, 1);
        el.style.background = leadBg(sp);
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      document.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative z-0 text-white [box-shadow:0_-28px_64px_-8px_rgba(0,0,0,0.5)]"
      style={{ background: INITIAL_BG }}
    >
      {/* 예배 · 표어 — 사진 좌 / 문구 우 */}
      <section className="flex min-h-screen items-center px-[6vw] py-[9vh]">
        <div className="mx-auto flex w-full max-w-[1320px] flex-row-reverse items-center gap-[6%] max-[860px]:flex-col max-[860px]:gap-7">
          <div className="min-w-0 flex-1">
            <span className="b1-mono mb-5 inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.16em] text-[#7c3f12] uppercase">
              <span className="block h-1.5 w-1.5 rounded-full bg-[#7c3f12]" />
              예배 · 2026 표어
            </span>
            <h2 className="b1-brush text-[clamp(40px,5.4vw,76px)] leading-[1.15] text-[#2a1a0c] text-balance">
              새 사람을 입고
              <br />
              <span className="text-[#b5611a]">묵은 땅</span>을 기경하라
            </h2>
            <div className="b1-mono mt-[18px] text-[13px] tracking-[0.04em] text-[#3a2713]/65">
              엡 4:22–24 · 호 10:12
            </div>
          </div>
          <div className="min-w-0 flex-[1.35]">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[18px] shadow-[0_40px_80px_-28px_rgba(0,0,0,0.6)]">
              <Image
                src={worshipImg}
                alt="성복교회 예배"
                fill
                sizes="(min-width:860px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 담임목사 — 문구 좌 / 사진 우 */}
      <section className="flex min-h-screen items-center px-[6vw] py-[9vh]">
        <div className="mx-auto flex w-full max-w-[1320px] items-center gap-[6%] max-[860px]:flex-col max-[860px]:gap-7">
          <div className="min-w-0 flex-1">
            <p className="b1-brush text-[clamp(28px,3.2vw,44px)] leading-[1.15] text-[#ffcf96]">
              할렐루야!
            </p>
            <h2 className="mt-4 text-[clamp(30px,4vw,54px)] leading-[1.2] font-extrabold tracking-[-0.025em] text-white text-balance">
              예수님의 이름으로 환영합니다.
            </h2>
            <p className="mt-8 max-w-[560px] text-[clamp(15px,1.45vw,18px)] leading-[1.9] text-white/75 text-balance">
              언제나{' '}
              <span className="font-semibold whitespace-nowrap text-[#ffcf96]">
                하나님의 축복
              </span>
              과{' '}
              <span className="font-semibold whitespace-nowrap text-[#ffcf96]">
                예수님의 은혜
              </span>
              와{' '}
              <span className="font-semibold whitespace-nowrap text-[#ffcf96]">
                성령님의 평강
              </span>
              이 여러분들의 인생 가운데 온전히 임하시길 진심으로 기원합니다.
            </p>
            <div className="mt-10 flex items-center gap-3.5">
              <span className="b1-mono text-[15px] font-semibold tracking-[0.04em] text-white/95">
                성복교회 담임목사
              </span>
              <Image
                src={pastorSign}
                alt="이요셉"
                className="h-12 w-auto mix-blend-screen brightness-110 invert sepia saturate-150"
              />
            </div>
          </div>
          <div className="min-w-0 flex-[0.9]">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[18px] shadow-[0_40px_80px_-28px_rgba(0,0,0,0.6)]">
              <Image
                src={pastorImg}
                alt="담임목사"
                fill
                sizes="(min-width:860px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
