// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/shared/components/features/Reveal';

import { DAWN_ACCENT, DAWN_GRADIENT, EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';

/**
 * L · 궤도 성좌 (C 변형) — 별자리를 중심 코어 둘레의 동심 타원 궤도로 재구성.
 * 안쪽(어린)→바깥(자란) 세대가 궤도에 놓이고 미세하게 반짝/부유. 가리키면 카드가 뜬다.
 * 위(밤)→아래(여명) 배경 + 지평선 글로우로 교회소식 연결.
 */
const RINGS = [
  { rx: 19, ry: 13, members: [0, 1, 2], phase: 0 },
  { rx: 33, ry: 22, members: [3, 4, 5], phase: 40 },
  { rx: 47, ry: 31, members: [6, 7, 8], phase: 20 },
];
const NODES = RINGS.flatMap((ring) =>
  ring.members.map((idx, j) => {
    const a = ((ring.phase + j * (360 / ring.members.length)) * Math.PI) / 180;
    return { idx, x: 50 + ring.rx * Math.cos(a), y: 50 + ring.ry * Math.sin(a) };
  })
);

export const VariantL = () => (
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
            하나의 중심을 둘레로 도는 아홉 세대의 궤도.
          </p>
        </div>
      </Reveal>

      <div className="relative mx-auto h-[440px] max-w-[860px] sm:h-[520px] md:h-[600px]">
        {/* 궤도 + 코어 */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {RINGS.map((r, i) => (
            <ellipse key={i} cx="50" cy="50" rx={r.rx} ry={r.ry} fill="none" stroke="rgba(180,196,255,0.16)" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <span
          className="ng-twinkle absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: '#fff', boxShadow: '0 0 16px 5px rgba(255,224,196,0.7), 0 0 40px 14px rgba(255,224,196,0.3)' }}
          aria-hidden
        />

        {NODES.map(({ idx, x, y }, k) => {
          const m = ORDERED[idx];
          return (
            <div key={m.name} className="group absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
              <Link href={m.href} className="ng-float relative block no-underline" style={{ animationDelay: `${(k % 5) * 0.6}s` }}>
                <span
                  className="ng-twinkle block h-3 w-3 rounded-full transition-transform duration-300 group-hover:scale-150"
                  style={{ background: '#fff', boxShadow: '0 0 9px 2px rgba(138,166,239,0.7)', animationDelay: `${(k % 4) * 0.7}s` }}
                />
                <span className="b1-mono absolute top-4 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap text-white/65 transition-opacity duration-300 group-hover:opacity-0">
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
