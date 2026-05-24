/**
 * HomeLead — v8. 전경 히어로 다음, 위로 차오르는 두 섹션(예배·담임목사).
 *
 * 배경은 따뜻한 글로우가 스크롤에 따라 좌상(예배 사진)→우하(담임 사진)으로 대각선
 * 이동하고, 베이스가 앰버(예배) → 차분한 네이비(담임)로 전환한다(루트 1장에 깔린 그라데이션).
 * 예배 섹션은 그 위에 문구 전용 크림 워시(.b1-worship-wash)를 덮어 사진(앰버)과 대비를 키우고
 * 검은 텍스트로 가독성을 준다(밝은 키). 담임 섹션은 네이비 위 흰 텍스트(강한 대비).
 * 고정된 HomeHero 위로 차고 올라와 덮는다(page.tsx 의 불투명 래퍼가 스택 보장).
 *
 * 표어/담임목사 카피는 placeholder — 사무국 검수 필요.
 */
'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import pastorImg from '@/assets/images/main/pastor.jpg';
import worshipImg from '@/assets/images/main/worship.jpg';

// 예배(밝은 앰버) → 담임목사(네이비). 좌상단 A, 우하단 B.
const A0 = [222, 146, 72];
const A1 = [40, 52, 100];
const B0 = [104, 52, 22];
const B1 = [14, 20, 46];
const INITIAL_BG =
  'radial-gradient(54% 60% at 26.0% 38.0%, rgba(240,162,82,0.95) 0%, rgba(236,150,68,0.42) 40%, rgba(236,150,68,0) 70%),' +
  'linear-gradient(120deg, rgb(222,146,72) 0%, rgb(104,52,22) 100%)';

export const HomeLead = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const mix = (c1: number[], c2: number[], t: number) =>
      `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`;
    const leadBg = (sp: number) => {
      const gx = 26 + sp * 48;
      const gy = 38 + sp * 42; // 좌상→우하 대각선
      const glow = `radial-gradient(54% 60% at ${gx.toFixed(1)}% ${gy.toFixed(1)}%, rgba(240,162,82,0.95) 0%, rgba(236,150,68,0.42) 40%, rgba(236,150,68,0) 70%)`;
      const base = `linear-gradient(120deg, ${mix(A0, A1, sp)} 0%, ${mix(B0, B1, sp)} 100%)`;
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
      <section
        data-snap="worship"
        className="b1-worship-wash flex min-h-screen items-center px-[6vw] py-[9vh]"
      >
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
      <section data-snap="pastor" className="flex min-h-screen items-center px-[6vw] py-[9vh]">
        <div className="mx-auto flex w-full max-w-[1320px] items-center gap-[6%] max-[860px]:flex-col max-[860px]:gap-7">
          <div className="min-w-0 flex-1">
            <span className="b1-mono mb-5 inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.16em] text-[#ffd9a8] uppercase">
              <span className="block h-1.5 w-1.5 rounded-full bg-[#ffd9a8]" />
              담임목사
            </span>
            <h2 className="text-[clamp(28px,3.4vw,48px)] leading-[1.2] font-extrabold tracking-[-0.025em] text-white text-balance">
              <span className="text-[#ffcf96]">기다리는</span> 자리
            </h2>
            <p className="mt-[18px] max-w-[420px] text-[16px] leading-[1.7] text-white/80">
              ○○○ 담임목사 · 1985년부터 함께.
            </p>
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
