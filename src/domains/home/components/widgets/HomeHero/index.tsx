/**
 * HomeHero — v2 final (sketch 12: Stable Bleed + Text)
 *
 * 사진은 사방으로 화면 밖까지 흘러넘쳐 사각형 경계가 안 보이고, 좌측만
 * 부드러운 linear-gradient 마스크로 텍스트 영역으로 페이드. 4단계 스크롤
 * (외관 → 내부 → 예배 → 담임목사) 동안 사진과 텍스트 모두 같은 위치에서
 * blur 페이드로 전환. 활성 사진은 9초 Ken Burns 미세 줌. CTA는 위치 고정.
 *
 * 의존:
 *   - heroStages.ts (단계별 카피·이미지 데이터)
 *   - globals.css 의 .b1-hero-* 유틸
 */
'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { HERO_STAGES } from '@/domains/home/data/heroStages';

type Phase = 'entering' | 'active' | 'exiting';

function phaseOf(stage: number, active: number): Phase {
  if (stage === active) return 'active';
  if (stage < active) return 'exiting';
  return 'entering';
}

export const HomeHero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    let ticking = false;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const moved = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, moved / total));
      setActiveStage(Math.min(3, Math.floor(progress * 4)));
      setScrolled(progress > 0.05);
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

  const stages = useMemo(() => HERO_STAGES, []);

  return (
    <section ref={heroRef} className="relative h-[360vh]">
      <div className="sticky top-[65px] h-[calc(100dvh-65px)] overflow-hidden">
        {/* 진행 바 */}
        <div className="bg-b1-surface/80 border-b1-border absolute top-6 left-1/2 z-[5] flex -translate-x-1/2 items-center rounded-full border px-3 py-2 backdrop-blur-md">
          {stages.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`b1-mono flex items-center gap-2 px-2.5 py-1 text-[11px] tracking-[0.08em] transition-colors ${
                  i === activeStage
                    ? 'text-b1-accent font-bold'
                    : i < activeStage
                      ? 'text-b1-text'
                      : 'text-b1-muted'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    i === activeStage
                      ? 'bg-b1-accent shadow-[0_0_0_3px_rgba(37,99,235,0.18)]'
                      : i < activeStage
                        ? 'bg-b1-text'
                        : 'bg-b1-border'
                  }`}
                />
                <span>{s.label}</span>
              </div>
              {i < stages.length - 1 && <span className="bg-b1-border mx-0 h-px w-4" />}
            </div>
          ))}
        </div>

        {/* 사진 — 사방 흘러넘침 + 좌측 부드러운 페이드.
            모바일(≤1024)에서는 더 넓게 깔고 흐릿하게 낮춰 텍스트 가독성 확보 */}
        <div
          aria-hidden
          className="absolute top-[-22%] right-[-12%] bottom-[-10%] z-[2] w-[82%] max-[720px]:opacity-[0.35] max-lg:top-[-10%] max-lg:right-[-15%] max-lg:w-[130%] max-lg:opacity-50"
          style={{
            WebkitMaskImage:
              'linear-gradient(to left, black 0%, black 50%, rgba(0,0,0,0.92) 62%, rgba(0,0,0,0.75) 72%, rgba(0,0,0,0.5) 82%, rgba(0,0,0,0.22) 92%, transparent 100%)',
            maskImage:
              'linear-gradient(to left, black 0%, black 50%, rgba(0,0,0,0.92) 62%, rgba(0,0,0,0.75) 72%, rgba(0,0,0,0.5) 82%, rgba(0,0,0,0.22) 92%, transparent 100%)',
            filter: 'saturate(0.95)',
          }}
        >
          {stages.map((s, i) => (
            <PhotoLayer
              key={s.id}
              phase={phaseOf(i, activeStage)}
              image={s.image}
              placeholder={s.placeholder}
              label={s.label}
            />
          ))}
        </div>

        {/* 좌측 텍스트 — 위치 고정, 4단 blur 페이드 */}
        <div className="relative z-[3] mx-auto flex h-full w-full max-w-[1440px] items-center px-5 md:px-10">
          <div className="relative min-h-[380px] w-full md:w-[46%]">
            {stages.map((s, i) => (
              <CopyBlock key={s.id} stage={s} active={i === activeStage} />
            ))}
          </div>
        </div>

        {/* CTA — 위치 완전 고정 */}
        <div className="absolute bottom-[72px] left-5 z-[4] flex flex-wrap items-center gap-3 md:left-10">
          <Link
            href="#worship"
            className="bg-b1-accent text-b1-bg inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-[15px] font-bold shadow-[0_14px_30px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:opacity-95 active:scale-[0.97]"
          >
            이번 주 예배 시간
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
          <Link
            href="#location"
            className="text-b1-text hover:border-b-b1-text inline-flex items-center gap-2 border-b-2 border-transparent px-2 py-4 text-[14px] font-semibold transition-colors"
          >
            오시는 길
          </Link>
        </div>

        {/* 스크롤 큐 */}
        <div
          aria-hidden
          className={`b1-mono text-b1-muted pointer-events-none absolute bottom-7 left-1/2 z-[5] flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.18em] transition-opacity duration-300 ${
            scrolled ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span>SCROLL</span>
          <span className="bg-b1-muted relative h-7 w-px overflow-hidden">
            <span className="b1-hero-scroll-drop bg-b1-accent absolute inset-x-0 -top-full h-[60%]" />
          </span>
        </div>
      </div>
    </section>
  );
};

/* ── 사진 레이어: blur 디졸브 + Ken Burns ─────────────────────── */
function PhotoLayer({
  phase,
  image,
  placeholder,
  label,
}: {
  phase: Phase;
  image?: StaticImageData;
  placeholder?: 'interior' | 'worship' | 'pastor';
  label: string;
}) {
  const base = 'absolute inset-0 will-change-[opacity,filter,transform]';
  const transition =
    'transition-[opacity,filter,transform] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]';
  const states: Record<Phase, string> = {
    entering: 'opacity-0 [filter:blur(20px)] scale-[0.96]',
    exiting: 'opacity-0 [filter:blur(20px)] scale-[1.06]',
    active: 'opacity-100 [filter:blur(0px)] scale-100 b1-hero-kenburns',
  };
  return (
    <div className={`${base} ${transition} ${states[phase]}`}>
      {image ? (
        <Image
          src={image}
          alt={label}
          fill
          priority
          sizes="(min-width: 1024px) 82vw, 100vw"
          className="object-cover object-[55%_50%]"
        />
      ) : (
        <div
          className={`relative h-full w-full ${
            placeholder === 'interior'
              ? 'b1-hero-ph-interior'
              : placeholder === 'worship'
                ? 'b1-hero-ph-worship'
                : 'b1-hero-ph-pastor'
          }`}
        >
          <span className="b1-mono absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-black/30 px-3 py-1.5 text-[10px] tracking-[0.16em] text-white/70 uppercase backdrop-blur-md">
            {label} · 사진 미확보
          </span>
        </div>
      )}
    </div>
  );
}

/* ── 텍스트 블록: 같은 위치에서 blur 페이드 전환 ───────────────── */
function CopyBlock({ stage, active }: { stage: (typeof HERO_STAGES)[number]; active: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 transition-[opacity,filter,transform] duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        active
          ? 'pointer-events-auto scale-100 opacity-100 [filter:blur(0px)]'
          : 'scale-[1.02] opacity-0 [filter:blur(10px)]'
      }`}
    >
      <div className="b1-mono text-b1-accent mb-7 inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase">
        <span className="b1-pulse-dot bg-b1-accent block h-1.5 w-1.5 rounded-full" />
        SUNGBOK · {stage.label}
      </div>
      <h1 className="text-b1-text m-0 text-[44px] leading-[1.0] tracking-[-0.035em] text-balance md:text-[72px]">
        <span className="text-b1-sub block font-extralight">{stage.headlineTop}</span>
        <span className="mt-1 block font-extrabold">
          <span className="b1-hero-highlight text-b1-accent inline-block">
            {stage.headlineHighlight}
          </span>
          {stage.headlineRest}
        </span>
      </h1>
      <p className="text-b1-sub mt-7 max-w-[380px] text-[16px] leading-[1.7] whitespace-pre-line">
        {stage.sub}
      </p>
    </div>
  );
}
