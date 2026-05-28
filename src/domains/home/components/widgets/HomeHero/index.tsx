/**
 * HomeHero — 메시+키네틱 DockSlide (시안 B 적용, 잠정).
 *
 * 파스텔 메시(웜화이트) 배경 + 키네틱 그라데 타이틀 + 우측 전경(좌측 경계가 메시로 자연 페이드).
 * 최상단: 문구가 화면 중앙, 전경은 안 보임. 스크롤하면 문구가 좌측으로 도킹되며 전경이 우측에서
 * 서서히 등장(opacity 0→1)하고 선명해진다(scale 1.08→1). transform/opacity 만 — 잔카 없음.
 * sticky 200vh 트랙(핀 ~85vh). prefers-reduced-motion 이면 트랙 없이 정적 최종상태로 렌더.
 *
 * 시안 비교 종료(2026-05-28) — 프리뷰 hero-preview/ · _variants/ 제거. 토큰화 + ADR 0004 추후.
 */
'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import mainExterior from '@/assets/images/main/main01.jpg';

const PHOTO_MASK =
  'linear-gradient(to left,#000 0%,#000 50%,rgba(0,0,0,0.55) 74%,rgba(0,0,0,0.12) 90%,transparent 100%)';

const KEYFRAMES = `
  @keyframes hh-mesh1 {0%{transform:translate(-8%,-6%) scale(1)}50%{transform:translate(10%,8%) scale(1.2)}100%{transform:translate(-8%,-6%) scale(1)}}
  @keyframes hh-mesh2 {0%{transform:translate(8%,10%) scale(1.1)}50%{transform:translate(-10%,-4%) scale(1)}100%{transform:translate(8%,10%) scale(1.1)}}
  @keyframes hh-mesh3 {0%{transform:translate(-4%,6%) scale(1.05)}50%{transform:translate(8%,-8%) scale(1.18)}100%{transform:translate(-4%,6%) scale(1.05)}}
  @keyframes hh-grad {0%{background-position:0% 50%}100%{background-position:200% 50%}}
  .hh-acc{background-image:linear-gradient(90deg,#2563eb,#7fb8ff,#5b7fe0,#2563eb);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:hh-grad 7s linear infinite}
`;

const Mesh = () => (
  <>
    <style>{KEYFRAMES}</style>
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-[15%] -left-[5%] h-[65vh] w-[65vh] rounded-full opacity-70 blur-[90px]" style={{ background: '#bcd3f5', animation: 'hh-mesh1 24s ease-in-out infinite', willChange: 'transform' }} />
      <div className="absolute top-[25%] right-[-8%] h-[70vh] w-[70vh] rounded-full opacity-60 blur-[100px]" style={{ background: '#f3d9c0', animation: 'hh-mesh2 30s ease-in-out infinite', willChange: 'transform' }} />
      <div className="absolute bottom-[-12%] left-[28%] h-[55vh] w-[55vh] rounded-full opacity-55 blur-[90px]" style={{ background: '#d8c8ec', animation: 'hh-mesh3 34s ease-in-out infinite', willChange: 'transform' }} />
    </div>
  </>
);

const Copy = () => (
  <>
    <span className="text-b1-sub mb-5 block text-[clamp(15px,1.6vw,20px)] font-bold tracking-[0.02em]">
      대한예수교장로회 성복교회
    </span>
    <h1 className="font-extrabold tracking-[-0.03em] text-[#2a3556]" style={{ fontSize: 'clamp(32px,4.4vw,66px)', lineHeight: 1.08 }}>
      삶에 <span className="hh-acc">기쁨</span>과 <span className="hh-acc">소망</span>을<br className="md:hidden" /> 주는 교회
    </h1>
    <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/55 px-5 py-2.5 text-[13px] font-semibold text-[#3a4252] shadow-[0_10px_30px_-12px_rgba(15,23,42,0.25)] backdrop-blur-md">
      <span className="bg-b1-accent h-2 w-2 rounded-full" />
      주일예배 오전 11:30 · 1~5부
    </div>
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
  </>
);

const Photo = ({ refEl, hidden }: { refEl?: React.Ref<HTMLDivElement>; hidden?: boolean }) => (
  <div
    ref={refEl}
    aria-hidden
    className="absolute top-0 right-0 bottom-0 w-[74%] will-change-transform"
    style={{ opacity: hidden ? 0 : 1, WebkitMaskImage: PHOTO_MASK, maskImage: PHOTO_MASK }}
  >
    <Image src={mainExterior} alt="성복교회 전경" fill priority quality={85} sizes="(max-width:768px) 96vw, 74vw" className="object-cover object-[55%_50%]" />
  </div>
);

export const HomeHero = () => {
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const photoRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);
    let blockW = copyRef.current?.offsetWidth ?? 480;
    const measure = () => {
      if (copyRef.current) blockW = copyRef.current.offsetWidth;
    };
    measure();
    window.addEventListener('resize', measure);

    let raf = 0;
    const render = () => {
      const e = ease(clamp(window.scrollY / (0.85 * window.innerHeight), 0, 1));
      const dock = blockW / 2 - window.innerWidth * 0.42;
      if (copyRef.current) copyRef.current.style.transform = `translate(calc(-50% + ${(dock * e).toFixed(1)}px), -50%)`;
      if (photoRef.current) {
        photoRef.current.style.opacity = e.toFixed(2);
        photoRef.current.style.transform = `translateX(${((1 - e) * 44).toFixed(1)}%) scale(${(1.08 - 0.08 * e).toFixed(3)})`;
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [reduced]);

  // 접근성: 모션 최소화 시 트랙 없이 정적 최종상태(카피 좌측 + 전경 노출).
  if (reduced) {
    return (
      <section aria-label="성복교회" className="relative min-h-[100svh] w-full overflow-hidden bg-[#f7f4ee]">
        <Mesh />
        <Photo />
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1240px] items-center px-6 md:px-[clamp(24px,5vw,72px)]">
          <div className="max-w-[540px] text-center">
            <Copy />
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="relative" style={{ height: '200vh' }}>
      <section aria-label="성복교회" className="sticky top-0 h-[100svh] overflow-hidden bg-[#f7f4ee]">
        <Mesh />
        <Photo refEl={photoRef} hidden />
        <div ref={copyRef} className="absolute top-1/2 left-1/2 z-10 w-[88%] max-w-[540px] text-center will-change-transform" style={{ transform: 'translate(-50%, -50%)' }}>
          <Copy />
        </div>
      </section>
    </div>
  );
};
