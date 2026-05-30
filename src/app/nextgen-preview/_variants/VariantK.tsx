// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Reveal } from '@/shared/components/features/Reveal';

import { DAWN_ACCENT, DAWN_GRADIENT, EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';

/**
 * K · 별자리 × 스포트라이트 (C 발전형) — C의 밤하늘 별자리 위에 B의 호버 효과를 얹는다.
 * 빛점을 가리키면 그 부서 사진이 배경 전면 스포트라이트로 떠오르고(상단 채움·하단 여명 비침)
 * 나머지 빛점은 가라앉는다. 진입부 #0b0b0d(LP 연속), 하단 지평선 여명으로 교회소식 연결.
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

export const VariantK = () => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: DAWN_GRADIENT }}
      onMouseLeave={() => setActive(null)}
    >
      {/* B 호버 스포트라이트 — 별자리(≤70%)까지 덮고, 하단은 마스크로 여명(#f6fafe) 비침 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: 'linear-gradient(180deg, #000 0%, #000 74%, transparent 94%)',
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 74%, transparent 94%)',
        }}
        aria-hidden
      >
        {ORDERED.map((m, i) => (
          <Image
            key={m.name}
            src={m.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover transition-opacity duration-700 ease-out [filter:brightness(0.4)_saturate(0.9)]"
            style={{ opacity: active === i ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/65" />
      </div>

      {/* 지평선 여명 글로우 + #f6fafe 인계 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 122%, rgba(255,224,196,0.5), rgba(255,224,196,0) 60%)',
        }}
        aria-hidden
      />

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
              밤하늘의 한 점을 가리키면, 그 자리의 얼굴들이 떠오릅니다.
            </p>
          </div>
        </Reveal>

        {/* 별자리 무대 */}
        <div className="relative h-[460px] sm:h-[540px] md:h-[600px]">
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

          {ORDERED.map((m, i) => {
            const dim = active !== null && active !== i;
            return (
              <div
                key={m.name}
                className="group absolute"
                style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <Link
                  href={m.href}
                  onMouseEnter={() => setActive(i)}
                  className="ng-float relative block no-underline transition-opacity duration-500"
                  style={{ animationDelay: `${(i % 5) * 0.6}s`, opacity: dim ? 0.35 : 1 }}
                >
                  <span
                    className="ng-twinkle block h-3.5 w-3.5 rounded-full transition-transform duration-300 group-hover:scale-150"
                    style={{
                      background: '#fff',
                      boxShadow: `0 0 10px 2px rgba(138,166,239,0.7), 0 0 22px 6px rgba(138,166,239,0.35)`,
                      animationDelay: `${(i % 4) * 0.7}s`,
                    }}
                  />
                  <span
                    className="absolute top-5 left-1/2 -translate-x-1/2 text-center whitespace-nowrap transition-all duration-300"
                    style={{ opacity: active === i ? 1 : 0.6 }}
                  >
                    <span className="block text-[14px] font-bold text-white">{m.name}</span>
                    <span
                      className="b1-mono block text-[9px] tracking-[0.08em] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ color: DAWN_ACCENT }}
                    >
                      {STAGE_OF[m.name]} · {m.age}
                    </span>
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
