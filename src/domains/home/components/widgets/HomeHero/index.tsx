/**
 * HomeHero — 정적 히어로(시안 D4 승격, 2026-10-11). 첫 화면은 준비되는 대로 표시한다.
 *
 * 첫 화면의 문구와 사진은 준비되는 대로 표시한다. 전체 등장 안무의 지연·숨김 상태를 두지 않는다.
 * HomeLead 의 변형 무대 안에서 렌더되며, copyClassName 으로 카피·소속 문장 래퍼에 퇴장용 클래스를 얹는다.
 *
 * 파스텔 메시(웜화이트) 배경 + 키네틱 그라데 타이틀 + 우측 전경(좌측 경계가 메시로 자연 페이드).
 * 이전의 200vh sticky 스크롤 트랙(중앙 카피 → 좌측 도킹 + 전경 등장)은 폐기 — 도킹 완료 상태를 첫 화면으로 고정.
 * 카피 블록은 왼쪽 정렬·왼쪽 배치(전경과의 겹침 최소화), eyebrow 앞에 합동 심볼, 예배 시간 알약은 제거.
 * 교단 소속 문장은 lg 이상에서 히어로 하단 왼쪽(블록과 같은 기준선), 그 미만에서는 CTA 아래 본문 흐름.
 */

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import mainExterior from '@/assets/images/main/main01.webp';
import { GapckSymbol } from '@/shared/components/brand/GapckSymbol';
import { HERO_IMAGE_QUALITY, HERO_IMAGE_SIZES } from './imageConfig';

const PHOTO_MASK =
  'linear-gradient(to left,#000 0%,#000 50%,rgba(0,0,0,0.55) 74%,rgba(0,0,0,0.12) 90%,transparent 100%)';

const AFFILIATION = '성복교회는 대한예수교장로회 합동교단(총신대학교)에 소속되어 있습니다.';

const KEYFRAMES = `
  @keyframes hh-mesh1 {0%{transform:translate(-8%,-6%) scale(1)}50%{transform:translate(10%,8%) scale(1.2)}100%{transform:translate(-8%,-6%) scale(1)}}
  @keyframes hh-mesh2 {0%{transform:translate(8%,10%) scale(1.1)}50%{transform:translate(-10%,-4%) scale(1)}100%{transform:translate(8%,10%) scale(1.1)}}
  @keyframes hh-mesh3 {0%{transform:translate(-4%,6%) scale(1.05)}50%{transform:translate(8%,-8%) scale(1.18)}100%{transform:translate(-4%,6%) scale(1.05)}}
  @keyframes hh-grad {0%{background-position:0% 50%}100%{background-position:200% 50%}}
  .hh-acc{background-image:linear-gradient(90deg,#2563eb,#7fb8ff,#5b7fe0,#2563eb);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:hh-grad 7s linear infinite}
  @media (prefers-reduced-motion: reduce){.hh-acc,.hh-mesh{animation:none!important}}
`;

const Mesh = () => (
  <>
    <style>{KEYFRAMES}</style>
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="hh-mesh absolute -top-[15%] -left-[5%] h-[65vh] w-[65vh] rounded-full opacity-70 blur-[90px]"
        style={{
          background: '#bcd3f5',
          animation: 'hh-mesh1 24s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        className="hh-mesh absolute top-[25%] right-[-8%] h-[70vh] w-[70vh] rounded-full opacity-60 blur-[100px]"
        style={{
          background: '#f3d9c0',
          animation: 'hh-mesh2 30s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        className="hh-mesh absolute bottom-[-12%] left-[28%] h-[55vh] w-[55vh] rounded-full opacity-55 blur-[90px]"
        style={{
          background: '#d8c8ec',
          animation: 'hh-mesh3 34s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
    </div>
  </>
);

const Affiliation = ({ className }: { className?: string }) => (
  <p className={`text-b1-sub text-body-sm leading-[1.7] text-pretty ${className ?? ''}`}>
    {AFFILIATION}
  </p>
);

/** copyClassName: 카피 블록·소속 문장 래퍼에 얹을 클래스(HomeLead 변형 무대가 스크롤로 퇴장시킬 때 사용) */
export const HomeHero = ({ copyClassName }: { copyClassName?: string } = {}) => (
  <section
    aria-label="성복교회"
    className="relative min-h-[100svh] w-full overflow-hidden bg-[#f7f4ee]"
  >
    <Mesh />
    {/* 전경 — 우측 74%, 좌측 경계는 메시로 페이드 */}
    <div
      aria-hidden
      className="absolute top-0 right-0 bottom-0 w-[74%]"
      style={{ WebkitMaskImage: PHOTO_MASK, maskImage: PHOTO_MASK }}
    >
      <Image
        src={mainExterior}
        alt="성복교회 전경"
        fill
        preload
        quality={HERO_IMAGE_QUALITY}
        sizes={HERO_IMAGE_SIZES}
        className="object-cover object-[55%_50%]"
      />
    </div>

    {/* 카피 블록 — 왼쪽 정렬·왼쪽 배치 */}
    <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1320px] items-center px-6 md:px-[clamp(24px,4vw,56px)]">
      <div className={`max-w-[520px] text-left ${copyClassName ?? ''}`}>
        <span className="text-b1-sub mb-5 inline-flex items-center gap-2.5 text-[clamp(15px,1.6vw,20px)] font-semibold tracking-[0.02em]">
          <GapckSymbol decorative className="h-[1.25em] w-auto shrink-0" />
          대한예수교장로회 성복교회
        </span>
        <h1
          className="font-extrabold tracking-[-0.03em] text-[#2a3556]"
          style={{ fontSize: 'clamp(32px,4.4vw,66px)', lineHeight: 1.08 }}
        >
          <span className="block">
            삶에 <span className="hh-acc">기쁨</span>과
          </span>
          <span className="block">
            <span className="hh-acc">소망</span>을 주는 교회
          </span>
        </h1>
        <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
          <Link
            href="#worship"
            className="bg-b1-accent text-b1-bg text-label inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-bold shadow-[0_14px_30px_-10px_rgba(37,99,235,0.5)] transition-transform duration-300 ease-out hover:-translate-y-0.5"
          >
            이번 주 예배 시간
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
          <Link
            href="#location"
            className="text-b1-text hover:border-b-b1-text text-label inline-flex items-center border-b-2 border-transparent px-2 py-3 font-semibold transition-colors"
          >
            오시는 길
          </Link>
        </div>
        {/* lg 미만(모바일·태블릿·가로모드 폰): 소속 문장은 본문 흐름 — 플로팅 버튼·CTA 와의 충돌 회피 */}
        <Affiliation className="mt-10 lg:hidden" />
      </div>
    </div>

    {/* lg 이상: 소속 문장을 히어로 하단 왼쪽에 — 카피 블록과 같은 좌측 기준선 */}
    <div className={`absolute inset-x-0 bottom-0 z-10 hidden lg:block ${copyClassName ?? ''}`}>
      <div className="mx-auto max-w-[1320px] px-[clamp(24px,4vw,56px)] pb-12">
        <div className="max-w-[520px]">
          <Affiliation />
        </div>
      </div>
    </div>
  </section>
);
