// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { Reveal } from '@/shared/components/features/Reveal';

import { DAWN_ACCENT, DAWN_GRADIENT, EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';

/**
 * O · 심도 성단 (C 변형) — 여러 겹의 별이 깊이를 이루고, 커서를 따라 시차(parallax)로 움직인다.
 * 가까운 층의 아홉 부서 별을 가리키면 카드가 뜬다. 위(밤)→아래(여명) 배경.
 */
const FAR = Array.from({ length: 26 }, (_, k) => ({
  x: (k * 37) % 100,
  y: (k * 61 + 13) % 100,
  s: 1 + (k % 3) * 0.6,
}));
const MID = Array.from({ length: 16 }, (_, k) => ({
  x: (k * 53 + 7) % 100,
  y: (k * 29 + 41) % 100,
  s: 1.6 + (k % 2),
}));
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

export const VariantO = () => {
  const [p, setP] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setP({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };
  const layer = (f: number) => ({ transform: `translate3d(${p.x * f}px, ${p.y * f}px, 0)`, transition: 'transform 0.18s ease-out' });

  return (
    <section className="relative w-full overflow-hidden" style={{ background: DAWN_GRADIENT }}>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
        style={{ background: 'radial-gradient(120% 80% at 50% 122%, rgba(255,224,196,0.5), rgba(255,224,196,0) 60%)' }}
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
              깊이를 가진 밤하늘. 커서를 따라 별들이 살며시 움직입니다.
            </p>
          </div>
        </Reveal>

        <div ref={ref} onMouseMove={onMove} className="relative h-[460px] sm:h-[540px] md:h-[600px]">
          {/* 먼 별 */}
          <div className="absolute inset-0" style={layer(6)} aria-hidden>
            {FAR.map((s, i) => (
              <span
                key={i}
                className="ng-twinkle absolute rounded-full bg-white/70"
                style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, animationDelay: `${(i % 5) * 0.5}s` }}
              />
            ))}
          </div>
          {/* 중간 별 */}
          <div className="absolute inset-0" style={layer(16)} aria-hidden>
            {MID.map((s, i) => (
              <span
                key={i}
                className="ng-twinkle absolute rounded-full bg-white"
                style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, boxShadow: '0 0 6px 1px rgba(255,255,255,0.5)', animationDelay: `${(i % 4) * 0.7}s` }}
              />
            ))}
          </div>
          {/* 가까운 별 = 부서 */}
          <div className="absolute inset-0" style={layer(30)}>
            {ORDERED.map((m, i) => (
              <div key={m.name} className="group absolute" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%`, transform: 'translate(-50%, -50%)' }}>
                <Link href={m.href} className="relative block no-underline">
                  <span
                    className="ng-twinkle block h-4 w-4 rounded-full transition-transform duration-300 group-hover:scale-150"
                    style={{ background: '#fff', boxShadow: '0 0 12px 3px rgba(138,166,239,0.8), 0 0 26px 8px rgba(138,166,239,0.35)', animationDelay: `${(i % 4) * 0.7}s` }}
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
      </div>
    </section>
  );
};
