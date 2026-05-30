// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Reveal } from '@/shared/components/features/Reveal';

import { DAWN_ACCENT, DAWN_GRADIENT, EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';

/**
 * B · 스포트라이트 리스트 — 부서명을 대형 타이포 리스트로.
 * 한 행을 가리키면 그 부서 사진이 배경 스포트라이트로 떠오르고(상단 페이드,
 * 하단은 여명으로 비침) 나머지 행은 어둠으로 가라앉는다. 럭셔리·절제.
 */
export const VariantB = () => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: DAWN_GRADIENT }}
      onMouseLeave={() => setActive(null)}
    >
      {/* 호버 사진 스포트라이트 — 상단만 채우고 하단은 마스크로 여명 비침 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: 'linear-gradient(180deg, #000 0%, #000 58%, transparent 90%)',
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 58%, transparent 90%)',
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
            className="object-cover transition-opacity duration-700 ease-out [filter:brightness(0.42)_saturate(0.9)]"
            style={{ opacity: active === i ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/55" />
      </div>

      <div className="relative mx-auto w-full max-w-[1120px] px-[6vw] py-24 md:py-32">
        <Reveal className="mb-10 md:mb-16">
          <div
            className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em]"
            style={{ color: DAWN_ACCENT }}
          >
            {EYEBROW}
          </div>
          <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">
            {TITLE}
          </h2>
        </Reveal>

        <div className="border-t border-white/12">
          {ORDERED.map((m, i) => {
            const dim = active !== null && active !== i;
            return (
              <Reveal key={m.name} delay={i * 45}>
                <Link
                  href={m.href}
                  onMouseEnter={() => setActive(i)}
                  className="group flex items-center justify-between gap-4 border-b border-white/12 py-5 no-underline transition-colors duration-500 md:py-7"
                  style={{ opacity: dim ? 0.4 : 1 }}
                >
                  <div className="flex min-w-0 items-baseline gap-4 md:gap-7">
                    <span className="b1-mono shrink-0 text-[12px] text-white/45">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate text-[30px] leading-none font-bold tracking-[-0.02em] text-white transition-transform duration-500 ease-out group-hover:translate-x-1 md:text-[58px]">
                      {m.name}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 md:gap-6">
                    <span className="hidden text-right text-[13px] text-white/55 sm:block">
                      {m.tone}
                    </span>
                    <span
                      className="b1-mono hidden text-[11px] tracking-[0.08em] md:inline"
                      style={{ color: DAWN_ACCENT }}
                    >
                      {STAGE_OF[m.name]} · {m.age}
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 text-white transition-all duration-300 group-hover:bg-white group-hover:text-black">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
