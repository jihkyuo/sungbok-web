// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/shared/components/features/Reveal';

import { DAWN_ACCENT, DAWN_GRADIENT, EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';

/**
 * C · 별자리 → 지평선 여명 — 부서를 밤하늘의 빛점으로 흩뿌리고 '자라남' 경로로 잇는다.
 * 빛점은 미세하게 반짝이고, 가리키면 카드가 떠오른다. 섹션 하단 지평선이 여명으로
 * 타오르며 밝음(#f6fafe)으로 인계. (ng-twinkle / ng-float keyframe 은 프리뷰 page.tsx 정의)
 */
const POS = [
  { x: 9, y: 70 },
  { x: 20, y: 50 },
  { x: 31, y: 63 },
  { x: 43, y: 39 },
  { x: 54, y: 55 },
  { x: 66, y: 33 },
  { x: 77, y: 49 },
  { x: 87, y: 29 },
  { x: 95, y: 44 },
];

export const VariantC = () => (
  <section className="relative w-full overflow-hidden" style={{ background: DAWN_GRADIENT }}>
    <div className="relative mx-auto w-full max-w-[1320px] px-[6vw] pt-24 pb-28 md:pt-32 md:pb-36">
      <Reveal className="mb-8 md:mb-10">
        <div
          className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em]"
          style={{ color: DAWN_ACCENT }}
        >
          {EYEBROW}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">
            {TITLE}
          </h2>
          <p className="m-0 max-w-[340px] text-[15px] leading-[1.8] text-white/65">
            저마다의 자리에서 빛나는 한 사람들. 가장 어린 자리에서 시작해 점점이 이어집니다.
          </p>
        </div>
      </Reveal>

      {/* 별자리 무대 */}
      <div className="relative h-[460px] sm:h-[540px] md:h-[600px]">
        {/* 자라남 경로 */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <polyline
            points={POS.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="rgba(180,196,255,0.28)"
            strokeWidth="0.25"
            strokeDasharray="1.2 1.4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {ORDERED.map((m, i) => (
          <div
            key={m.name}
            className="group absolute"
            style={{
              left: `${POS[i].x}%`,
              top: `${POS[i].y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Link
              href={m.href}
              className="ng-float relative block no-underline"
              style={{ animationDelay: `${(i % 5) * 0.6}s` }}
            >
              {/* 빛점 */}
              <span
                className="ng-twinkle block h-3.5 w-3.5 rounded-full transition-transform duration-300 group-hover:scale-125"
                style={{
                  background: '#fff',
                  boxShadow: `0 0 10px 2px rgba(138,166,239,0.7), 0 0 22px 6px rgba(138,166,239,0.35)`,
                  animationDelay: `${(i % 4) * 0.7}s`,
                }}
              />
              {/* 평상시 라벨 */}
              <span className="b1-mono absolute top-5 left-1/2 -translate-x-1/2 text-[11px] whitespace-nowrap text-white/65 transition-opacity duration-300 group-hover:opacity-0">
                {m.name}
              </span>

              {/* 호버 카드 */}
              <span className="pointer-events-none absolute bottom-6 left-1/2 z-10 w-[176px] -translate-x-1/2 translate-y-1.5 overflow-hidden rounded-2xl opacity-0 ring-1 ring-white/15 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="relative block aspect-[16/10] w-full">
                  <Image
                    src={m.image}
                    alt={m.name}
                    fill
                    sizes="176px"
                    className="object-cover [filter:brightness(0.85)]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                </span>
                <span className="absolute inset-x-0 bottom-0 block p-3">
                  <span
                    className="b1-mono block text-[9px] tracking-[0.1em]"
                    style={{ color: DAWN_ACCENT }}
                  >
                    {STAGE_OF[m.name]} · {m.age}
                  </span>
                  <span className="mt-0.5 block text-[15px] font-bold text-white">{m.name}</span>
                </span>
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>

    {/* 지평선 여명 글로우 */}
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 120%, rgba(255,224,196,0.55), rgba(255,224,196,0) 60%)',
      }}
      aria-hidden
    />
  </section>
);
