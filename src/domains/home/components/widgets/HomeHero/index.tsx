/**
 * HomeHero — v8 (고정 전경 + 자동 일렁이는 블루 글로우 + 문 경계 그림자)
 *
 * 닫힌 첫 화면은 흰 배경 위로 테마 블루 글로우가 시간 기반으로 천천히 일렁인다(산뜻).
 * 스크롤하면 위아래 마스크가 열리며 전경 사진이 드러나고(열리는 경계선에 그림자),
 * 타이틀이 중앙→좌측으로 안착한다. 히어로는 `fixed -z-10`으로 고정되어 아래 콘텐츠
 * (HomeLead 등)가 위로 차고 올라와 덮는다.
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
  const glowRef = useRef<HTMLDivElement>(null);
  const edgeTopRef = useRef<HTMLDivElement>(null);
  const edgeBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const seg = (x: number, s: number, e: number) => clamp((x - s) / (e - s), 0, 1);
    const smooth = (x: number) => x * x * (3 - 2 * x);

    // 닫힘 배경: 흰 위로 블루 글로우 두 개가 천천히 일렁임
    const heroBg = (t: number) => {
      const x1 = 50 + 22 * Math.sin(t * 0.00017);
      const y1 = 42 + 18 * Math.sin(t * 0.00012 + 1.3);
      const x2 = 46 + 26 * Math.sin(t * 0.00011 + 2.1);
      const y2 = 58 + 20 * Math.sin(t * 0.00015 + 0.5);
      return (
        `radial-gradient(44% 50% at ${x1.toFixed(1)}% ${y1.toFixed(1)}%, rgba(37,99,235,0.20) 0%, rgba(37,99,235,0.07) 42%, transparent 70%),` +
        `radial-gradient(40% 46% at ${x2.toFixed(1)}% ${y2.toFixed(1)}%, rgba(91,127,224,0.16) 0%, rgba(91,127,224,0.05) 45%, transparent 72%)`
      );
    };

    let rafId = 0;
    const render = (t: number) => {
      const vh = window.innerHeight;
      const hp = clamp(window.scrollY / (vh * 1.1), 0, 1);
      const open = reduced ? 1 : smooth(seg(hp, 0.05, 0.85));
      const inset = (1 - open) * 50;

      if (wrapRef.current) {
        wrapRef.current.style.clipPath = `inset(${inset.toFixed(1)}% 0% ${inset.toFixed(1)}% 0%)`;
      }
      if (phRef.current) phRef.current.style.transform = `scale(${(1.08 - 0.08 * open).toFixed(3)})`;

      // 열리는 문 경계선 그림자 (클립 경계에 맞춤)
      const show = open > 0.02 && open < 0.999 ? '1' : '0';
      if (edgeTopRef.current) {
        edgeTopRef.current.style.top = `${inset.toFixed(1)}%`;
        edgeTopRef.current.style.opacity = show;
      }
      if (edgeBottomRef.current) {
        edgeBottomRef.current.style.bottom = `${inset.toFixed(1)}%`;
        edgeBottomRef.current.style.opacity = show;
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

      // 닫힘 글로우는 히어로가 보일 때만 갱신(열리면 잦아듦)
      if (glowRef.current) {
        if (!reduced && open < 0.999) {
          glowRef.current.style.background = heroBg(t);
          glowRef.current.style.opacity = (1 - open).toFixed(2);
        } else {
          glowRef.current.style.opacity = '0';
        }
      }
    };

    const loop = (t: number) => {
      if (!document.hidden) render(t);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <>
      <section aria-label="성복교회 전경" className="fixed inset-0 -z-10 overflow-hidden bg-[#f6fafe]">
        {/* 자동 일렁이는 블루 글로우 */}
        <div ref={glowRef} aria-hidden className="pointer-events-none absolute inset-0 z-[1]" />

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
          {/* 문 경계 그림자 (위/아래) */}
          <div
            ref={edgeTopRef}
            aria-hidden
            className="absolute inset-x-0 z-[3] h-[46px]"
            style={{ top: '50%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }}
          />
          <div
            ref={edgeBottomRef}
            aria-hidden
            className="absolute inset-x-0 z-[3] h-[46px]"
            style={{ bottom: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}
          />
        </div>

        {/* 타이틀 — 처음엔 중앙, 스크롤하면 좌측 안착 (처음부터 또렷) */}
        <div
          ref={copyRef}
          className="absolute top-1/2 left-[7%] z-[4] max-w-[560px] -translate-y-1/2 text-center will-change-transform"
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
          className="b1-mono text-b1-muted pointer-events-none absolute bottom-7 left-1/2 z-[5] flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.18em] transition-opacity duration-300"
        >
          <span>SCROLL</span>
          <span className="bg-b1-muted relative h-7 w-px overflow-hidden">
            <span className="b1-hero-scroll-drop absolute inset-x-0 -top-full h-[60%]" />
          </span>
        </div>
      </section>

      {/* 히어로가 점유하는 스크롤 거리 (투명) */}
      <div aria-hidden className="h-[180vh]" />
    </>
  );
};
