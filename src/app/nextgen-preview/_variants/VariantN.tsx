// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/shared/components/features/Reveal';

import { DAWN_ACCENT, DAWN_GRADIENT, EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';

/**
 * N · 유성 라인드로잉 (C 변형) — 별자리 잇는 선이 그어지듯 그려지고(stroke-dashoffset),
 * 이따금 유성이 흐른다. 가리키면 카드가 뜬다. 위(밤)→아래(여명) 배경.
 * (ng-draw / ng-meteor keyframe 은 프리뷰 page.tsx 정의)
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
const METEORS = [
  { top: '6%', left: '78%', delay: '0s', dur: '3.6s' },
  { top: '2%', left: '46%', delay: '2.4s', dur: '4.2s' },
  { top: '14%', left: '92%', delay: '5s', dur: '3.2s' },
];

export const VariantN = () => (
  <section className="relative w-full overflow-hidden" style={{ background: DAWN_GRADIENT }}>
    {/* 유성 */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {METEORS.map((mt, i) => (
        <span
          key={i}
          className="ng-meteor absolute h-px w-[120px] -rotate-[28deg]"
          style={{
            top: mt.top,
            left: mt.left,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0))',
            animationDelay: mt.delay,
            animationDuration: mt.dur,
          }}
        />
      ))}
    </div>
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 122%, rgba(255,224,196,0.5), rgba(255,224,196,0) 60%)',
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
            한 점 한 점 이어 그리는 별자리. 가끔은 유성도 흐릅니다.
          </p>
        </div>
      </Reveal>

      <div className="relative h-[460px] sm:h-[540px] md:h-[600px]">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <polyline
            className="ng-draw"
            points={POS.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="rgba(190,205,255,0.45)"
            strokeWidth="0.3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {ORDERED.map((m, i) => (
          <div key={m.name} className="group absolute" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%`, transform: 'translate(-50%, -50%)' }}>
            <Link href={m.href} className="ng-float relative block no-underline" style={{ animationDelay: `${(i % 5) * 0.6}s` }}>
              <span
                className="ng-twinkle block h-3.5 w-3.5 rounded-full transition-transform duration-300 group-hover:scale-150"
                style={{ background: '#fff', boxShadow: '0 0 10px 2px rgba(138,166,239,0.7), 0 0 22px 6px rgba(138,166,239,0.35)', animationDelay: `${(i % 4) * 0.7}s` }}
              />
              <span className="b1-mono absolute top-5 left-1/2 -translate-x-1/2 text-[11px] whitespace-nowrap text-white/65 transition-opacity duration-300 group-hover:opacity-0">
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
