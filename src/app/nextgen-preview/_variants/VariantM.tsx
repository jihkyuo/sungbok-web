// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/shared/components/features/Reveal';

import { DAWN_ACCENT, DAWN_GRADIENT, EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';

/**
 * M · 은하 나선 (C 변형) — 별자리를 중심에서 바깥으로 감기는 나선 은하로 배치.
 * 가장 어린 영아부가 중심, 엘림가족부가 바깥. 희미한 나선팔 + 반짝임. 가리키면 카드가 뜬다.
 * 위(밤)→아래(여명) 배경 + 지평선 글로우로 교회소식 연결.
 */
const YK = 0.72;
const spiral = (t: number, turn: number, off: number) => {
  const a = t * Math.PI * turn + off;
  const r = 6 + t * 43;
  return { x: 50 + r * Math.cos(a), y: 50 + r * YK * Math.sin(a) };
};
const NODES = ORDERED.map((_, i) => spiral(i / 8, 3.0, 0));
const ARM = (off: number) =>
  Array.from({ length: 46 }, (_, k) => {
    const p = spiral(k / 45, 3.0, off);
    return `${p.x},${p.y}`;
  }).join(' ');

export const VariantM = () => (
  <section className="relative w-full overflow-hidden" style={{ background: DAWN_GRADIENT }}>
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
            중심에서 바깥으로, 하나의 은하로 감기는 아홉 세대.
          </p>
        </div>
      </Reveal>

      <div className="relative mx-auto h-[460px] max-w-[820px] sm:h-[540px] md:h-[600px]">
        {/* 나선팔 */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <polyline points={ARM(0)} fill="none" stroke="rgba(170,188,255,0.16)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
          <polyline points={ARM(Math.PI)} fill="none" stroke="rgba(202,166,200,0.14)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* 은하핵 */}
        <span
          className="ng-twinkle absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: '#fff', boxShadow: '0 0 20px 7px rgba(255,232,210,0.7), 0 0 50px 18px rgba(202,166,200,0.3)' }}
          aria-hidden
        />

        {NODES.map((p, i) => {
          const m = ORDERED[i];
          return (
            <div key={m.name} className="group absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}>
              <Link href={m.href} className="ng-float relative block no-underline" style={{ animationDelay: `${(i % 5) * 0.6}s` }}>
                <span
                  className="ng-twinkle block rounded-full transition-transform duration-300 group-hover:scale-150"
                  style={{
                    width: `${12 - i * 0.6}px`,
                    height: `${12 - i * 0.6}px`,
                    background: '#fff',
                    boxShadow: '0 0 9px 2px rgba(138,166,239,0.7)',
                    animationDelay: `${(i % 4) * 0.7}s`,
                  }}
                />
                <span className="b1-mono absolute top-4 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap text-white/60 transition-opacity duration-300 group-hover:opacity-0">
                  {m.name}
                </span>
                <span className="pointer-events-none absolute bottom-5 left-1/2 z-10 w-[168px] -translate-x-1/2 translate-y-1.5 overflow-hidden rounded-2xl opacity-0 ring-1 ring-white/15 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="relative block aspect-[16/10] w-full">
                    <Image src={m.image} alt={m.name} fill sizes="168px" className="object-cover [filter:brightness(0.85)]" />
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
          );
        })}
      </div>
    </div>
  </section>
);
