// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/shared/components/features/Reveal';

import { EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';
import { nebula, px, starField } from './sky';
import { useParallax } from './useParallax';

/**
 * Q · 포커스 풀 성운 — 다층 시차를 시네마틱 피사계심도로. 성운·은하수·보케까지 6겹,
 * 먼 층은 blur로 아웃포커스. 별을 가리키면 배경이 더 흐려지고(랙 포커스) 그 별이
 * 글래스 도시에 카드로 개화한다. 상단 어둠(LP 연속) → 하단 코스믹 로즈 여명으로 밝아짐.
 * (포커스 반응은 page.tsx 의 .ng-qstage:has(...) 규칙으로 구동 — 리렌더 0)
 */
// 이음새 단차 = 기울기 불연속. → 색 변화를 섹션 안쪽(8~94%)에서 끝내고 양 끝에 이웃과 같은
// 평평한 색 띠를 둔다: 상단 #0b0b0d 평평(LP 어둠과 동일), 하단 #f6fafe 평평(교회소식과 동일).
const BG =
  'linear-gradient(180deg,#0b0b0d 0% 8%,#15111f 22%,#2c1a3a 37%,#4d2c54 50%,#7c3f6b 62%,#a96b80 72%,#cf9aa0 80%,#e7c2bb 87%,#f6fafe 94%,#f6fafe 100%)';

const DEEP = starField(48, 11, 0.6, 1.8);
const MID = starField(26, 23, 1.2, 2.6);
const NEB = nebula(7, ['rgba(120,80,220,0.5)', 'rgba(70,110,230,0.4)', 'rgba(220,90,150,0.4)', 'rgba(80,180,200,0.32)']);
const BOKEH = starField(6, 41, 10, 22);

const POS = [
  { x: 13, y: 32 },
  { x: 27, y: 60 },
  { x: 19, y: 80 },
  { x: 39, y: 42 },
  { x: 52, y: 66 },
  { x: 46, y: 24 },
  { x: 66, y: 50 },
  { x: 80, y: 34 },
  { x: 88, y: 64 },
];

export const VariantQ = () => {
  const ref = useParallax<HTMLDivElement>();

  return (
    <section className="relative w-full overflow-hidden" style={{ background: BG }}>
      <div className="relative mx-auto w-full max-w-[1320px] px-[6vw] pt-24 pb-28 md:pt-32 md:pb-36">
        <Reveal className="relative z-30 mb-8 md:mb-10">
          <div className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em] text-[#b9a6ff]">{EYEBROW}</div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">
              {TITLE}
            </h2>
            <p className="m-0 max-w-[330px] text-[15px] leading-[1.8] text-white/65">
              깊은 성운 속 아홉 개의 빛. 가리키면 그 자리에 초점이 맺힙니다.
            </p>
          </div>
        </Reveal>

        <div ref={ref} className="ng-qstage relative h-[480px] sm:h-[560px] md:h-[620px]">
          {/* 배경 천체 층 — 호버 시 통째로 흐려지고 가라앉음(랙 포커스). 섹션 그라데이션은 건드리지 않아 박스 경계가 안 생김 */}
          <div className="ng-qback absolute inset-0">
          {/* 먼 별 (아웃포커스) */}
          <div className="absolute inset-0 [filter:blur(1.4px)]" style={{ transform: px(5) }} aria-hidden>
            {DEEP.map((s, i) => (
              <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o * 0.7, animationDelay: `${s.d}s` }} />
            ))}
          </div>
          {/* 성운 */}
          <div className="absolute inset-0 [filter:blur(56px)]" style={{ transform: px(9) }} aria-hidden>
            {NEB.map((b, i) => (
              <span key={i} className="absolute rounded-full" style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.size}vw`, height: `${b.size}vw`, background: `radial-gradient(circle, ${b.color}, transparent 70%)`, transform: 'translate(-50%,-50%)' }} />
            ))}
          </div>
          {/* 은하수 띠 */}
          <div
            className="absolute -inset-x-10 top-[34%] h-[40%] -rotate-12 [filter:blur(28px)]"
            style={{ transform: px(7), background: 'linear-gradient(90deg, transparent, rgba(190,200,255,0.14) 35%, rgba(220,200,255,0.18) 55%, transparent)' }}
            aria-hidden
          />
          {/* 중간 별 */}
          <div className="absolute inset-0 [filter:blur(0.4px)]" style={{ transform: px(16) }} aria-hidden>
            {MID.map((s, i) => (
              <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o, boxShadow: '0 0 6px 1px rgba(255,255,255,0.5)', animationDelay: `${s.d}s` }} />
            ))}
          </div>
          {/* 보케 */}
          <div className="absolute inset-0 [filter:blur(9px)]" style={{ transform: px(22) }} aria-hidden>
            {BOKEH.map((b, i) => (
              <span key={i} className="absolute rounded-full" style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.s}px`, height: `${b.s}px`, background: 'radial-gradient(circle, rgba(200,180,255,0.4), transparent 70%)' }} />
            ))}
          </div>

          </div>
          {/* /ng-qback */}

          {/* 부서 별 (근경·또렷) */}
          <div className="absolute inset-0 z-30" style={{ transform: px(32) }}>
            {ORDERED.map((m, i) => {
              const right = POS[i].x < 55;
              return (
                <div key={m.name} className="group absolute" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%`, transform: 'translate(-50%, -50%)' }}>
                  <Link href={m.href} data-star className="ng-star relative block no-underline outline-none">
                    <span
                      className="ng-twinkle block h-3.5 w-3.5 rounded-full transition-transform duration-300 group-hover:scale-150 group-focus-visible:scale-150"
                      style={{ background: '#fff', boxShadow: '0 0 12px 3px rgba(170,150,255,0.85), 0 0 30px 9px rgba(140,120,255,0.4)' }}
                    />
                    <span className="b1-mono absolute top-5 left-1/2 -translate-x-1/2 text-[11px] whitespace-nowrap text-white/75 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0">
                      {m.name}
                    </span>

                    {/* 글래스 도시에 카드 (개화) */}
                    <span
                      className={`pointer-events-none absolute top-1/2 z-10 w-[232px] -translate-y-1/2 scale-95 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] opacity-0 shadow-[0_30px_70px_-28px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 ${right ? 'left-full ml-4' : 'right-full mr-4'}`}
                    >
                      <span className="relative block aspect-[16/10] w-full">
                        <Image src={m.image} alt={m.name} fill sizes="232px" className="object-cover" />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      </span>
                      <span className="block p-3.5">
                        <span className="b1-mono block text-[10px] tracking-[0.1em] text-[#b9a6ff]">
                          {STAGE_OF[m.name]} · {m.age}
                        </span>
                        <span className="mt-1 block text-[19px] font-bold tracking-[-0.01em] text-white">{m.name}</span>
                        <span className="mt-0.5 block text-[12.5px] text-white/70">{m.tone}</span>
                      </span>
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
