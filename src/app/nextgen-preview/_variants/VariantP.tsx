// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/shared/components/features/Reveal';

import { DAWN_ACCENT, DAWN_GRADIENT, EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';

/**
 * P · 달 + 별자리 (C 변형) — 떠오르는 큰 달을 둘러 아홉 부서 별이 호를 그린다.
 * 가리키면 카드가 뜨고, 바닥은 달빛에서 여명(#f6fafe)으로 풀려 교회소식 연결. 위는 #0b0b0d(LP 연속).
 */
const POS = ORDERED.map((_, i) => {
  const a = ((192 + (i / 8) * 156) * Math.PI) / 180;
  return { x: 50 + 41 * Math.cos(a), y: 86 + 60 * Math.sin(a) };
});

export const VariantP = () => (
  <section className="relative w-full overflow-hidden" style={{ background: DAWN_GRADIENT }}>
    {/* 달무리 + 바닥 여명 */}
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
      style={{
        background:
          'radial-gradient(60% 50% at 50% 96%, rgba(226,232,246,0.4) 0%, rgba(226,232,246,0) 55%), radial-gradient(120% 70% at 50% 122%, rgba(255,224,196,0.45), rgba(255,224,196,0) 62%)',
      }}
      aria-hidden
    />

    <div className="relative mx-auto w-full max-w-[1320px] px-[6vw] pt-24 pb-28 md:pt-32 md:pb-36">
      <Reveal className="mb-8 md:mb-10">
        <div className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em]" style={{ color: DAWN_ACCENT }}>
          {EYEBROW}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">
            {TITLE}
          </h2>
          <p className="m-0 max-w-[330px] text-[15px] leading-[1.8] text-white/65">
            떠오르는 달을 둘러 둥글게 선 아홉 세대.
          </p>
        </div>
      </Reveal>

      <div className="relative h-[440px] sm:h-[520px] md:h-[580px]">
        {/* 달 */}
        <div
          className="ng-float absolute bottom-[-6%] left-1/2 h-[280px] w-[280px] -translate-x-1/2 rounded-full sm:h-[320px] sm:w-[320px] md:h-[360px] md:w-[360px]"
          style={{
            background:
              'radial-gradient(circle at 40% 36%, #fbfdff 0%, #e6ebf5 46%, #c7cfe0 74%, #aeb7cc 100%)',
            boxShadow: '0 0 80px 24px rgba(220,228,246,0.35), inset -18px -14px 40px rgba(120,130,160,0.4)',
          }}
          aria-hidden
        >
          <span className="absolute top-[26%] left-[30%] h-7 w-7 rounded-full bg-black/5" />
          <span className="absolute top-[52%] left-[58%] h-10 w-10 rounded-full bg-black/[0.06]" />
          <span className="absolute top-[64%] left-[34%] h-5 w-5 rounded-full bg-black/5" />
        </div>

        {ORDERED.map((m, i) => (
          <div key={m.name} className="group absolute" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%`, transform: 'translate(-50%, -50%)' }}>
            <Link href={m.href} className="ng-float relative block no-underline" style={{ animationDelay: `${(i % 5) * 0.6}s` }}>
              <span
                className="ng-twinkle block h-3.5 w-3.5 rounded-full transition-transform duration-300 group-hover:scale-150"
                style={{ background: '#fff', boxShadow: '0 0 10px 2px rgba(138,166,239,0.7), 0 0 22px 6px rgba(138,166,239,0.35)', animationDelay: `${(i % 4) * 0.7}s` }}
              />
              <span className="b1-mono absolute top-5 left-1/2 -translate-x-1/2 text-[11px] whitespace-nowrap text-white/70 transition-opacity duration-300 group-hover:opacity-0">
                {m.name}
              </span>
              <span className="pointer-events-none absolute bottom-6 left-1/2 z-10 w-[176px] -translate-x-1/2 translate-y-1.5 overflow-hidden rounded-2xl opacity-0 ring-1 ring-white/15 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="relative block aspect-[16/10] w-full">
                  <Image src={m.image} alt={m.name} fill sizes="176px" className="object-cover [filter:brightness(0.85)]" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                </span>
                <span className="absolute inset-x-0 bottom-0 block p-3">
                  <span className="b1-mono block text-[9px] tracking-[0.1em]" style={{ color: DAWN_ACCENT }}>
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
  </section>
);
