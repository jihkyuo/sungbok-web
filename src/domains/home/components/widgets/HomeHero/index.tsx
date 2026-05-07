import { Reveal } from '@/shared/components/features/Reveal';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const HomeHero = () => {
  return (
    <section className="relative flex min-h-[calc(100dvh-65px)] items-center overflow-hidden">
      {/* 떠다니는 그라디언트 블롭 — 히어로 영역에 한정 */}
      <div
        aria-hidden
        className="b1-blob-a pointer-events-none absolute -top-48 -right-40 -z-10 h-[600px] w-[600px] rounded-full"
      />
      <div
        aria-hidden
        className="b1-blob-b pointer-events-none absolute -bottom-40 -left-32 -z-10 h-[500px] w-[500px] rounded-full"
      />

      {/* 콘텐츠 컨테이너 — 헤더와 동일한 max-width + padding으로 좌측 정렬 일치 */}
      <div className="relative mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-7 lg:col-span-6">
            <Reveal>
              <div className="b1-mono text-b1-accent mb-7 inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase">
                <span className="block h-[6px] w-[6px] rounded-full bg-b1-accent" />
                SUNGBOK · 2026.05
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-b1-text m-0 text-[44px] leading-[1.0] tracking-[-0.035em] text-balance md:text-[88px]">
                <span className="text-b1-sub block font-extralight">처음 오신 분의</span>
                <span className="mt-1 block font-extrabold">
                  <span className="b1-hero-highlight text-b1-accent inline-block">자리</span>
                  <span>, 그대로.</span>
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-b1-sub mt-7 max-w-[480px] text-[16px] leading-[1.7]">
                대한예수교장로회 ○○ · 1979년 창립 · 동대문 장안동.
                <br />
                오늘 처음 와 보셔도, 자리는 비워두었습니다.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-9 flex flex-wrap items-center gap-2 md:gap-3">
                <Link
                  href="#worship"
                  className="bg-b1-accent text-b1-bg inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-[15px] font-bold shadow-[0_14px_30px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:opacity-95 active:scale-[0.97]"
                >
                  이번 주 예배 시간
                  <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
                <a
                  href="#location"
                  className="text-b1-text hover:border-b-b1-text inline-flex items-center gap-2 border-b-2 border-transparent px-2 py-4 text-[14px] font-semibold transition-colors"
                >
                  오시는 길
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
