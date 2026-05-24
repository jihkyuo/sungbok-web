/**
 * HomeHero — v8 (일방향 문열림 인트로 + 능동 스크롤 보정)
 *
 * 문 열림·CTA·타이틀은 단조 래치 `introMax`로 구동된다. 즉 한 번 열리면 스크롤을
 * 올려도 닫히지 않고 open+CTA 화면을 유지하며, 닫힘에서 시작하는 건 오직 "최상단에서
 * 로드"될 때뿐(신규 진입/최상단 새로고침). 중간 위치 새로고침은 즉시 open+CTA.
 *
 * 능동 스크롤 보정(JS): 최상단에서 아래로 스크롤하면 문 개방+CTA 지점까지 자동으로
 * 이어주고, 이어서 예배/담임 지점으로 부드럽게 유도한다. 빠른 스크롤은 통과.
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

    // 닫힘 배경: 블루 글로우 세 개가 서로 다른 모서리에서 시작해 다른 축·방향·속도로 일렁임
    const heroBg = (t: number) => {
      // glow1 — 좌상에서 주로 가로(좌↔우)로 쓸림
      const x1 = 28 + 32 * Math.sin(t * 0.00016);
      const y1 = 30 + 12 * Math.sin(t * 0.00010 + 1.0);
      // glow2 — 우하에서 주로 세로(상↔하)로 쓸림
      const x2 = 74 + 14 * Math.sin(t * 0.00009 + 2.0);
      const y2 = 66 + 26 * Math.sin(t * 0.00013 + 0.4);
      // glow3 — 좌하 ↔ 우상 대각선으로 이동(가장 느림)
      const p3 = Math.sin(t * 0.00007 + 4.0);
      const x3 = 42 + 32 * p3;
      const y3 = 64 - 28 * p3;
      return (
        `radial-gradient(44% 50% at ${x1.toFixed(1)}% ${y1.toFixed(1)}%, rgba(37,99,235,0.20) 0%, rgba(37,99,235,0.07) 42%, transparent 70%),` +
        `radial-gradient(40% 46% at ${x2.toFixed(1)}% ${y2.toFixed(1)}%, rgba(91,127,224,0.16) 0%, rgba(91,127,224,0.05) 45%, transparent 72%),` +
        `radial-gradient(38% 44% at ${x3.toFixed(1)}% ${y3.toFixed(1)}%, rgba(120,170,255,0.16) 0%, rgba(120,170,255,0.05) 46%, transparent 72%)`
      );
    };

    const WRAP_TOP = -0.12; // 사진 bleed 박스 top (-12%)
    const WRAP_H = 1.24; // 높이 124%
    const EDGE_H = 32; // 경계 그림자 높이(가볍게)

    // 단조 래치: 최상단 로드(scrollY≈0)만 닫힘에서 시작, 그 외(조금이라도 내려옴)는 즉시 완전 open
    let introMax = window.scrollY > 4 ? 1 : 0;
    // 인트로 자동재생 중에는 문 열림을 scrollY가 아니라 "시간 기반 진행도"로 구동(일정 속도로 서서히).
    let introOverride: number | null = null;
    let t0 = 0;
    let rafId = 0;
    const render = (t: number) => {
      if (!t0) t0 = t;
      const vh = window.innerHeight;
      // 인트로 진행도: 문 완전 개방 + CTA 등장이 ~1.0vh 에서 완료
      const intro = clamp(window.scrollY / (vh * 1.0), 0, 1);
      introMax = Math.max(introMax, intro);
      const eff = reduced ? 1 : introOverride !== null ? introOverride : introMax;
      const open = reduced ? 1 : smooth(seg(eff, 0.04, 0.7));
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

      // 타이틀 — 중앙(SSR) → 열리며 좌측 도크로 (introMax 기반이라 비가역)
      const copy = copyRef.current;
      if (copy) {
        const blockW = copy.offsetWidth;
        const dockShift = blockW / 2 - window.innerWidth * 0.43;
        const tx = reduced ? dockShift : dockShift * open;
        const sc = reduced ? 1 : 1.1 - 0.1 * open;
        copy.style.transform = `translate(calc(-50% + ${tx.toFixed(1)}px), -50%) scale(${sc.toFixed(3)})`;
      }

      // CTA 단계 — 문이 열린 뒤 (introMax 0.62→0.96) 아래에서 페이드인
      if (ctaRef.current) {
        const ctaP = reduced ? 1 : clamp((eff - 0.68) / 0.32, 0, 1);
        ctaRef.current.style.opacity = ctaP.toFixed(2);
        ctaRef.current.style.transform = `translateY(${((1 - ctaP) * 14).toFixed(1)}px)`;
        ctaRef.current.style.pointerEvents = ctaP > 0.4 ? 'auto' : 'none';
      }

      // 한번 열리면 큐는 다시 안 보이게
      if (cueRef.current) cueRef.current.style.opacity = introMax > 0.02 ? '0' : '1';

      // 닫힘 글로우: 인트로 램프 후 일렁임, 문 열리며 잦아듦
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

    // ── 인트로 자동재생만 ────────────────────────────────────────
    // 최상단에서 아래로 스크롤하면 입력을 막고 문을 천천히 열며 CTA 지점(restY)까지 자동 스크롤.
    // CTA 아래(예배·담임 등)는 보정/스냅 없이 일반 스크롤.
    let lastY = window.scrollY;
    let dir = 1;
    let snapTimer = 0;
    let scrollAnim = 0;
    let programmatic = false;
    let playing = false;
    let introPlayed = window.scrollY > 4; // 중간 위치 로드면 인트로 이미 끝난 것으로
    let touchStartY = 0;
    const loadGuardUntil = performance.now() + 400;

    const restY = () => window.innerHeight * 0.98;

    // 인트로 자동재생 — 문 열림을 시간 기반 "선형" 진행도로 구동해 일정 속도로 천천히 보이게.
    // (scrollY 도 함께 restY 로 이동하지만 히어로는 고정이라, 보이는 건 introOverride 가 여는 문)
    const playIntro = () => {
      if (reduced || playing || introPlayed) return;
      playing = true;
      introPlayed = true;
      cancelAnimationFrame(scrollAnim);
      const fromY = window.scrollY;
      const toY = restY();
      const D = 1800; // 전체 인트로 길이(문 열림은 약 0~70% 구간 = ~1.26초). 튜닝값.
      const start = performance.now();
      programmatic = true;
      const step = (now: number) => {
        const q = clamp((now - start) / D, 0, 1);
        introOverride = q; // 선형 → 문이 일정 속도로 서서히 열림(렌더의 smooth가 양 끝만 완만하게)
        window.scrollTo(0, Math.round(fromY + (toY - fromY) * q));
        if (q < 1) {
          scrollAnim = requestAnimationFrame(step);
        } else {
          introOverride = null;
          introMax = 1;
          programmatic = false;
          playing = false;
        }
      };
      scrollAnim = requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      if (reduced) return;
      if (playing) {
        e.preventDefault(); // 인트로 재생 중 입력 차단
        return;
      }
      if (introPlayed) return; // 인트로 끝나면 일반 스크롤(예배·담임 보정 없음)
      if (e.deltaY > 0 && window.scrollY < restY()) {
        e.preventDefault();
        playIntro();
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (reduced) return;
      if (playing) {
        e.preventDefault();
        return;
      }
      if (introPlayed) return;
      if (window.scrollY < restY()) {
        const dy = touchStartY - (e.touches[0]?.clientY ?? 0); // >0 = 아래로 스크롤
        if (dy > 6) {
          e.preventDefault();
          playIntro();
        }
      }
    };

    // 비휠 입력(스크롤바/키보드) 폴백: 최상단에서 아래로 내려가면 인트로 재생
    const onScrollEnd = () => {
      if (reduced || programmatic || playing || introPlayed) return;
      if (performance.now() < loadGuardUntil) return;
      if (dir > 0 && window.scrollY > 24 && window.scrollY < restY()) playIntro();
    };
    const onScroll = () => {
      const y = window.scrollY;
      dir = y >= lastY ? 1 : -1;
      lastY = y;
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(onScrollEnd, 140);
    };
    if (!reduced) {
      document.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
    }

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(scrollAnim);
      document.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.clearTimeout(snapTimer);
    };
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

        {/* 타이틀 — SSR 중앙(닫힘 상태), 열리며 좌측 안착. 문 열린 뒤 CTA 페이드인 */}
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

      {/* 히어로 점유 스크롤(240vh). pointer-events-none 라 뒤쪽 고정 히어로 CTA 클릭 가능 */}
      <div aria-hidden className="pointer-events-none h-[240vh]" />
    </>
  );
};
