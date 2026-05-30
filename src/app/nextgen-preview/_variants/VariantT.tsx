// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Reveal } from '@/shared/components/features/Reveal';

import { EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';
import { nebula, px, starField } from './sky';

/**
 * T · 자기장 성도 — [조준 해결] 커서가 맵 어디에 있든 가장 가까운 별이 자동 활성(근접 판정).
 * 정밀 조준 불필요, 맵 전체가 타깃. 커서를 따라 자기장 글로우 + 활성 별로 가는 가는 선.
 * [정보 해결] 우측에 큰 도시에 패널 상주(대형 이미지+부서명+생애주기·연령+설명+CTA), 근접 따라 크로스페이드.
 * 상단 #0b0b0d(LP 연속) → 하단 #f6fafe(교회소식). 배경 별/성운만 미세 시차.
 */
const BG =
  'linear-gradient(180deg,#0b0b0d 0% 8%,#141022 26%,#2a1c3e 44%,#48305a 58%,#7b4f72 70%,#b07e90 80%,#dcb6b6 88%,#f6fafe 95%,#f6fafe 100%)';
const FAR = starField(44, 13, 0.6, 1.8);
const MID = starField(22, 27, 1.2, 2.6);
const NEB = nebula(5, ['rgba(90,120,220,0.4)', 'rgba(150,100,210,0.36)', 'rgba(80,170,200,0.3)']);
const POS = [
  { x: 16, y: 32 },
  { x: 30, y: 60 },
  { x: 22, y: 82 },
  { x: 43, y: 44 },
  { x: 55, y: 66 },
  { x: 50, y: 24 },
  { x: 67, y: 52 },
  { x: 80, y: 34 },
  { x: 87, y: 70 },
];

export const VariantT = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const a = ORDERED[active];

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const tick = () => {
      raf = 0;
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      el.style.setProperty('--px', (cx / w - 0.5).toFixed(4));
      el.style.setProperty('--py', (cy / h - 0.5).toFixed(4));
      if (glowRef.current) glowRef.current.style.transform = `translate(${cx - 90}px, ${cy - 90}px)`;
      if (lineRef.current) {
        lineRef.current.setAttribute('x1', ((cx / w) * 100).toFixed(2));
        lineRef.current.setAttribute('y1', ((cy / h) * 100).toFixed(2));
      }
      if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) raf = requestAnimationFrame(tick);
    };
    const pick = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      const mx = (tx / r.width) * 100;
      const my = (ty / r.height) * 100;
      let best = 0;
      let bd = 1e9;
      for (let i = 0; i < POS.length; i++) {
        const dx = POS[i].x - mx;
        const dy = POS[i].y - my;
        const d = dx * dx + dy * dy;
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      if (best !== activeRef.current) {
        activeRef.current = best;
        setActive(best);
        if (lineRef.current) {
          lineRef.current.setAttribute('x2', POS[best].x.toFixed(2));
          lineRef.current.setAttribute('y2', POS[best].y.toFixed(2));
        }
      }
      if (glowRef.current) glowRef.current.style.opacity = '1';
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      if (glowRef.current) glowRef.current.style.opacity = '0';
    };
    el.addEventListener('pointermove', pick, { passive: true });
    el.addEventListener('pointerdown', pick, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', pick);
      el.removeEventListener('pointerdown', pick);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ background: BG }}>
      <div className="relative mx-auto w-full max-w-[1320px] px-[6vw] pt-24 pb-28 md:pt-32 md:pb-36">
        <Reveal className="mb-8 md:mb-10">
          <div className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em] text-[#9fb6ff]">{EYEBROW}</div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">
              {TITLE}
            </h2>
            <p className="m-0 max-w-[340px] text-[15px] leading-[1.8] text-white/65">
              커서를 움직이면 가장 가까운 별이 깨어납니다. 굳이 별을 맞히지 않아도 됩니다.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_360px] md:gap-8">
          {/* 자기장 맵 */}
          <div
            ref={mapRef}
            className="relative h-[420px] overflow-hidden rounded-3xl ring-1 ring-white/10 sm:h-[500px] md:h-[560px]"
            style={{ touchAction: 'none' }}
          >
            {/* 성운 */}
            <div className="absolute inset-0 [filter:blur(54px)]" style={{ transform: px(10) }} aria-hidden>
              {NEB.map((b, i) => (
                <span key={i} className="absolute rounded-full" style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.size}vw`, height: `${b.size}vw`, background: `radial-gradient(circle, ${b.color}, transparent 70%)`, transform: 'translate(-50%,-50%)' }} />
              ))}
            </div>
            {/* 먼 별 */}
            <div className="absolute inset-0" style={{ transform: px(6) }} aria-hidden>
              {FAR.map((s, i) => (
                <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o * 0.75, animationDelay: `${s.d}s` }} />
              ))}
            </div>
            {/* 중간 별 */}
            <div className="absolute inset-0" style={{ transform: px(13) }} aria-hidden>
              {MID.map((s, i) => (
                <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o, boxShadow: '0 0 6px 1px rgba(255,255,255,0.5)', animationDelay: `${s.d}s` }} />
              ))}
            </div>

            {/* 자기장 글로우(커서 추종) */}
            <div ref={glowRef} className="pointer-events-none absolute top-0 left-0 h-[180px] w-[180px] rounded-full opacity-0 transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(150,180,255,0.25), transparent 70%)' }} aria-hidden />
            {/* 자기장 선 */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <line ref={lineRef} x1="50" y1="50" x2={POS[0].x} y2={POS[0].y} stroke="rgba(159,182,255,0.5)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* 부서 별 */}
            {ORDERED.map((m, i) => {
              const on = active === i;
              return (
                <div key={m.name} className="pointer-events-none absolute" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%`, transform: 'translate(-50%, -50%)' }}>
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300" style={{ width: on ? '34px' : '0px', height: on ? '34px' : '0px', borderColor: 'rgba(159,182,255,0.8)', opacity: on ? 1 : 0 }} />
                  <span className="ng-twinkle block rounded-full transition-all duration-300" style={{ width: on ? '13px' : '9px', height: on ? '13px' : '9px', background: '#fff', boxShadow: on ? '0 0 16px 5px rgba(159,182,255,0.9)' : '0 0 8px 2px rgba(180,200,255,0.55)' }} />
                  <span className="b1-mono absolute top-4 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap transition-colors duration-300" style={{ color: on ? '#dfe7ff' : 'rgba(255,255,255,0.5)' }}>
                    {m.name}
                  </span>
                </div>
              );
            })}

            <div className="b1-mono pointer-events-none absolute right-4 bottom-3 text-[10px] tracking-[0.14em] text-white/35">커서를 움직여 보세요</div>
          </div>

          {/* 큰 도시에 패널 */}
          <div className="relative md:self-stretch">
            <div className="overflow-hidden rounded-3xl border border-white/12 bg-white/[0.06] backdrop-blur-xl md:sticky md:top-24">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {ORDERED.map((m, i) => (
                  <Image key={m.name} src={m.image} alt={m.name} fill sizes="380px" className="object-cover transition-opacity duration-500" style={{ opacity: active === i ? 1 : 0 }} />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="b1-mono absolute top-3 left-3 rounded-full bg-black/40 px-2 py-1 text-[10px] tracking-[0.12em] text-[#9fb6ff] backdrop-blur-sm">
                  NG · {String(active + 1).padStart(2, '0')}
                </div>
              </div>
              <div className="p-5 md:p-6">
                <div className="b1-mono text-[11px] tracking-[0.12em] text-[#9fb6ff]">{STAGE_OF[a.name]} · {a.age}</div>
                <div className="mt-1.5 text-[28px] font-bold tracking-[-0.02em] text-white">{a.name}</div>
                <p className="mt-2.5 text-[14.5px] leading-[1.7] text-white/72">{a.tone}</p>
                <Link href={a.href} className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-white hover:text-black">
                  {a.name} 자세히 보기 <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
