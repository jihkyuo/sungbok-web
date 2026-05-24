/**
 * HomeHero — v5 (고정 전경 + 차오르는 섹션)
 *
 * 첫 화면은 완전히 닫힌 상태(위아래 마스크)에서 중앙 타이틀만 보이고, 스크롤하면
 * 위아래로 문이 열리며 전경 사진이 드러나고 타이틀이 좌측으로 안착한다. 히어로는
 * `fixed -z-10`으로 고정되어, 아래 콘텐츠(HomeLead 등)가 위로 차고 올라와 덮는다.
 *
 * 뒤따르는 표어·담임목사 섹션은 HomeLead 가 담당. globals.css 의 .b1-hero-scroll-drop
 * (스크롤 큐)·.b1-lead-gradient(차오르는 배경) 와 짝.
 */
'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import mainExterior from '@/assets/images/main/main01.jpg';

export const HomeHero = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const phRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const seg = (x: number, s: number, e: number) => clamp((x - s) / (e - s), 0, 1);
    const smooth = (x: number) => x * x * (3 - 2 * x);

    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      // 첫 ~1.1vh 동안 문 열림
      const hp = clamp(window.scrollY / (vh * 1.1), 0, 1);
      const open = reduced ? 1 : smooth(seg(hp, 0.05, 0.85));

      const inset = (1 - open) * 50;
      if (wrapRef.current) {
        wrapRef.current.style.clipPath = `inset(${inset.toFixed(1)}% 0% ${inset.toFixed(1)}% 0%)`;
      }
      if (phRef.current) {
        phRef.current.style.transform = `scale(${(1.08 - 0.08 * open).toFixed(3)})`;
      }
      const copy = copyRef.current;
      if (copy) {
        const blockW = copy.offsetWidth;
        const tx0 = window.innerWidth * 0.5 - (window.innerWidth * 0.07 + blockW / 2);
        const tx = reduced ? 0 : tx0 * (1 - open);
        const sc = reduced ? 1 : 1.1 - 0.1 * open;
        copy.style.transform = `translate(${tx.toFixed(1)}px, -50%) scale(${sc.toFixed(3)})`;
      }
      if (cueRef.current) cueRef.current.style.opacity = hp > 0.04 ? '0' : '1';
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
    <>
      <section
        aria-label="성복교회 전경"
        className="fixed inset-0 -z-10 overflow-hidden"
        style={{
          background:
            'radial-gradient(120% 90% at 72% 26%, var(--color-b1-surface) 0%, var(--color-b1-bg) 52%, #e3e8ef 100%)',
        }}
      >
        {/* 전경 사진 — 우측 흘러넘침 + 좌측 페이드, 스크롤로 위아래 열림 */}
        <div
          ref={wrapRef}
          aria-hidden
          className="absolute -top-[12%] -right-[12%] -bottom-[12%] z-[2] w-[84%] overflow-hidden"
          style={{
            WebkitMaskImage:
              'linear-gradient(to left, black 0%, black 50%, rgba(0,0,0,0.7) 72%, rgba(0,0,0,0.18) 90%, transparent 100%)',
            maskImage:
              'linear-gradient(to left, black 0%, black 50%, rgba(0,0,0,0.7) 72%, rgba(0,0,0,0.18) 90%, transparent 100%)',
            clipPath: 'inset(50% 0% 50% 0%)',
          }}
        >
          <div ref={phRef} className="absolute inset-0 will-change-transform">
            <Image
              src={mainExterior}
              alt="성복교회 전경"
              fill
              priority
              sizes="84vw"
              className="object-cover object-[55%_50%]"
            />
          </div>
        </div>

        {/* 타이틀 — 처음엔 중앙, 스크롤하면 좌측 안착 (처음부터 또렷) */}
        <div
          ref={copyRef}
          className="absolute top-1/2 left-[7%] z-[3] max-w-[560px] -translate-y-1/2 text-center will-change-transform"
          style={{ transformOrigin: 'center center' }}
        >
          <span className="text-b1-text mb-[18px] block text-[clamp(16px,1.7vw,21px)] font-bold tracking-[0.02em]">
            대한예수교장로회 성복교회
          </span>
          <h1 className="text-b1-text text-[clamp(32px,4.4vw,62px)] leading-[1.12] font-extrabold tracking-[-0.03em] text-balance">
            삶에 <span className="text-b1-accent">기쁨</span>과 <span className="text-b1-accent">소망</span>을
            <br />
            주는 교회
          </h1>
        </div>

        {/* 스크롤 큐 */}
        <div
          ref={cueRef}
          aria-hidden
          className="b1-mono text-b1-muted pointer-events-none absolute bottom-7 left-1/2 z-[4] flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.18em] transition-opacity duration-300"
        >
          <span>SCROLL</span>
          <span className="bg-b1-muted relative h-7 w-px overflow-hidden">
            <span className="b1-hero-scroll-drop absolute inset-x-0 -top-full h-[60%]" />
          </span>
        </div>
      </section>

      {/* 히어로가 점유하는 스크롤 거리 (투명) — 이 구간 동안 문이 열린다 */}
      <div aria-hidden className="h-[180vh]" />
    </>
  );
};
