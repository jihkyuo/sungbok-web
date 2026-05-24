/**
 * HomeHero — v8 (고정 전경 문열림 + 자동 일렁이는 블루 글로우 + CTA 단계)
 *
 * 닫힌 첫 화면: 흰 배경 위 블루 글로우가 작은 점에서 서서히 퍼지며 등장(인트로),
 * 이후 시간 기반으로 천천히 일렁인다. 스크롤하면 위아래 마스크가 열리며(가벼운 경계
 * 그림자, 풀폭) 전경 사진이 드러나고 타이틀이 중앙→좌측으로 안착한다. 문이 다 열린
 * 뒤 한 단계 더 — CTA가 타이틀 아래에서 페이드인. 그 다음에야 아래 콘텐츠(HomeLead)가
 * 차오른다. 히어로는 `fixed -z-10` 고정.
 *
 * 회귀 금지 불변식은 .md/domains/home.md "HomeHero — 회귀 방지 불변식" 참조.
 */
'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import mainExterior from '@/assets/images/main/main01.jpg';

export const HomeHero = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const phRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
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

    const WRAP_TOP = -0.12; // 사진 bleed 박스 top (-12%)
    const WRAP_H = 1.24; // 높이 124%
    const EDGE_H = 32; // 경계 그림자 높이(가볍게)

    let t0 = 0;
    let rafId = 0;
    const render = (t: number) => {
      if (!t0) t0 = t;
      const vh = window.innerHeight;
      // 문 열림: 첫 ~0.65vh 동안 완료 (이후 CTA 단계 → 그 다음 콘텐츠 차오름)
      const hp = clamp(window.scrollY / (vh * 0.7), 0, 1);
      const open = reduced ? 1 : smooth(seg(hp, 0.05, 0.9));
      const inset = (1 - open) * 50;

      if (wrapRef.current) {
        wrapRef.current.style.clipPath = `inset(${inset.toFixed(1)}% 0% ${inset.toFixed(1)}% 0%)`;
      }
      if (phRef.current) phRef.current.style.transform = `scale(${(1.08 - 0.08 * open).toFixed(3)})`;

      // 가벼운 문 경계 그림자 — 풀폭, 사진 클립 경계의 뷰포트 y 에 배치
      const show = open > 0.02 && open < 0.999 ? '1' : '0';
      const topY = (WRAP_TOP + (inset / 100) * WRAP_H) * vh;
      const botY = (WRAP_TOP + WRAP_H - (inset / 100) * WRAP_H) * vh;
      if (edgeTopRef.current) {
        edgeTopRef.current.style.top = `${topY.toFixed(1)}px`;
        edgeTopRef.current.style.opacity = show;
      }
      if (edgeBottomRef.current) {
        edgeBottomRef.current.style.top = `${(botY - EDGE_H).toFixed(1)}px`;
        edgeBottomRef.current.style.opacity = show;
      }

      // 타이틀 — 중앙(SSR) → 스크롤하면 좌측 도크로 보간
      const copy = copyRef.current;
      if (copy) {
        const blockW = copy.offsetWidth;
        const dockShift = blockW / 2 - window.innerWidth * 0.43;
        const tx = reduced ? dockShift : dockShift * open;
        const sc = reduced ? 1 : 1.1 - 0.1 * open;
        copy.style.transform = `translate(calc(-50% + ${tx.toFixed(1)}px), -50%) scale(${sc.toFixed(3)})`;
      }

      // CTA 단계 — 문이 열린 뒤 [0.65vh, 1.0vh] 구간에서 아래에서 페이드인
      if (ctaRef.current) {
        const ctaP = reduced ? 1 : clamp((window.scrollY - vh * 0.65) / (vh * 0.35), 0, 1);
        ctaRef.current.style.opacity = ctaP.toFixed(2);
        ctaRef.current.style.transform = `translateY(${((1 - ctaP) * 14).toFixed(1)}px)`;
        ctaRef.current.style.pointerEvents = ctaP > 0.4 ? 'auto' : 'none';
      }

      if (cueRef.current) cueRef.current.style.opacity = hp > 0.04 ? '0' : '1';

      // 닫힘 글로우: 인트로(작은 점→퍼짐, 페이드인) 후 일렁임, 문 열리며 잦아듦
      if (glowRef.current) {
        if (!reduced && open < 0.999) {
          const introEase = smooth(clamp((t - t0) / 700, 0, 1));
          glowRef.current.style.background = heroBg(t);
          glowRef.current.style.opacity = ((1 - open) * introEase).toFixed(2);
          glowRef.current.style.transform = `scale(${(0.7 + 0.3 * introEase).toFixed(3)})`;
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
      <section aria-label="성복교회 전경" className="fixed inset-0 z-0 overflow-hidden bg-[#f6fafe]">
        {/* 자동 일렁이는 블루 글로우 (인트로: 작은 점에서 서서히 퍼짐) */}
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ opacity: 0, transform: 'scale(0.7)' }}
        />

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
              quality={85}
              sizes="(max-width: 768px) 96vw, 84vw"
              className="object-cover object-[55%_50%]"
            />
          </div>
        </div>

        {/* 가벼운 문 경계 그림자 (위/아래) — 마스크 밖 풀폭, 경계선이 화면 전체로 연속 */}
        <div
          ref={edgeTopRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-[3] h-[32px]"
          style={{ top: '50%', opacity: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.22), transparent)' }}
        />
        <div
          ref={edgeBottomRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-[3] h-[32px]"
          style={{ top: '50%', opacity: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.22), transparent)' }}
        />

        {/* 타이틀 — SSR 중앙(닫힘 상태), 스크롤하면 좌측 안착. 문 열린 뒤 CTA 페이드인 */}
        <div
          ref={copyRef}
          className="absolute top-1/2 left-1/2 z-[4] max-w-[560px] text-center will-change-transform"
          style={{ transformOrigin: 'center center', transform: 'translate(-50%, -50%) scale(1.1)' }}
        >
          <span className="text-b1-text mb-[18px] block text-[clamp(16px,1.7vw,21px)] font-bold tracking-[0.02em]">
            대한예수교장로회 성복교회
          </span>
          <h1 className="text-b1-text text-[clamp(32px,4.4vw,62px)] leading-[1.12] font-extrabold tracking-[-0.03em] text-balance">
            삶에 <span className="text-b1-accent">기쁨</span>과 <span className="text-b1-accent">소망</span>을
            <br />
            주는 교회
          </h1>

          {/* CTA — 문 열린 뒤 아래에서 페이드인 (카피·링크는 검수 대상) */}
          <div
            ref={ctaRef}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ opacity: 0, transform: 'translateY(14px)' }}
          >
            <Link
              href="#worship"
              className="bg-b1-accent text-b1-bg inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14px] font-bold shadow-[0_14px_30px_-10px_rgba(37,99,235,0.5)] transition-transform duration-300 ease-out hover:-translate-y-0.5"
            >
              이번 주 예배 시간
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            <Link
              href="#location"
              className="text-b1-text hover:border-b-b1-text inline-flex items-center border-b-2 border-transparent px-2 py-3 text-[14px] font-semibold transition-colors"
            >
              오시는 길
            </Link>
          </div>
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

      {/* 히어로 점유 스크롤(240vh) — 중간에 "휴지" 스냅 마커. pointer-events-none 라
          뒤쪽 고정 히어로의 CTA가 클릭 가능하다. */}
      <div aria-hidden className="pointer-events-none">
        <div className="h-[100vh]" />
        <div className="h-0" style={{ scrollSnapAlign: 'start' }} />
        <div className="h-[140vh]" />
      </div>
    </>
  );
};
