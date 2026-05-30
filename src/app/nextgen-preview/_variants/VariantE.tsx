// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/shared/components/features/Reveal';

import { DAWN_ACCENT, DAWN_GRADIENT, EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';

/**
 * E · 오로라 글래스 — 어두운 오로라(블러 블롭, ng-aurora) 위에 프로스티드 글래스 카드가
 * 미세하게 떠 있고(ng-float) 사진은 유리 뒤. 하단은 여명(#f6fafe)으로 풀려 교회소식 연결.
 * 현대적·프리미엄. (keyframe 은 프리뷰 page.tsx 정의)
 */
const BLOBS = [
  { c: 'rgba(91,127,224,0.45)', s: '46vw', x: '-6%', y: '4%', d: '0s' },
  { c: 'rgba(181,111,176,0.4)', s: '40vw', x: '58%', y: '0%', d: '-6s' },
  { c: 'rgba(111,208,192,0.3)', s: '38vw', x: '24%', y: '30%', d: '-12s' },
];

export const VariantE = () => (
  <section className="relative w-full overflow-hidden" style={{ background: DAWN_GRADIENT }}>
    {/* 오로라 — 상단만(아래 여명 보존) */}
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        maskImage: 'linear-gradient(180deg, #000 0%, #000 55%, transparent 82%)',
        WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 55%, transparent 82%)',
      }}
      aria-hidden
    >
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className="ng-aurora absolute rounded-full blur-[80px]"
          style={{
            width: b.s,
            height: b.s,
            left: b.x,
            top: b.y,
            background: `radial-gradient(circle, ${b.c}, transparent 70%)`,
            animationDelay: b.d,
          }}
        />
      ))}
    </div>

    <div className="relative mx-auto w-full max-w-[1320px] px-[6vw] py-24 md:py-32">
      <Reveal className="mb-10 md:mb-14">
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
          <p className="m-0 max-w-[360px] text-[15px] leading-[1.8] text-white/65">
            어둠 위에 떠오른 빛처럼, 각 세대가 저마다의 자리에서 모입니다.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        {ORDERED.map((m, i) => (
          <Reveal key={m.name} delay={(i % 3) * 80}>
            <Link
              href={m.href}
              className="ng-float group block overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-2.5 no-underline shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 ease-out hover:border-white/35 hover:bg-white/[0.12] hover:shadow-[0_30px_70px_-28px_rgba(0,0,0,0.9)]"
              style={{ animationDelay: `${(i % 3) * 0.9}s` }}
            >
              <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl">
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover transition-all duration-700 ease-out [filter:brightness(0.68)_saturate(0.9)] group-hover:scale-[1.05] group-hover:[filter:brightness(1.02)_saturate(1.06)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              </div>
              <div className="flex items-end justify-between gap-3 px-3 pt-3.5 pb-2.5">
                <div>
                  <div className="b1-mono text-[10px] tracking-[0.1em]" style={{ color: DAWN_ACCENT }}>
                    {STAGE_OF[m.name]} · {m.age}
                  </div>
                  <div className="mt-1 text-[19px] font-bold tracking-[-0.01em] text-white">
                    {m.name}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-white/65">{m.tone}</div>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 text-white transition-all duration-300 group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight size={15} />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
