// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import { ArrowUpRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';
import { px, starField } from './sky';
import { useMagnetic } from './useMagnetic';

/**
 * 피사계심도 (O×T×Q, 흐림을 '깊이'로) — "주변 흐릿"을 균일 dim이 아니라 깊이 기반 보케로: 활성=초점면(또렷),
 * 먼 별일수록 더 blur(원경 강하게, 중경 약하게). T 자기장 + O 시차/별 사이즈 + Q 카드. 상단 #0b0b0d → 하단 #f6fafe.
 */
const BG = 'linear-gradient(180deg,#0b0b0d 0% 8%,#0f1320 26%,#172238 44%,#2c3450 58%,#4e5878 70%,#8090a4 80%,#c4ccd6 88%,#f6fafe 95%,#f6fafe 100%)';
const FAR = starField(54, 23, 0.8, 2.4);
const MID = starField(24, 37, 1.1, 2.6);
const POS = [
  { x: 15, y: 34 }, { x: 29, y: 60 }, { x: 21, y: 80 }, { x: 41, y: 46 }, { x: 55, y: 64 },
  { x: 49, y: 28 }, { x: 67, y: 52 }, { x: 81, y: 38 }, { x: 88, y: 70 },
];

export const VariantDof = () => {
  const lockedRef = useRef(false);
  const [locked, setLocked] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const { ref, glowRef, active, set } = useMagnetic(POS, { frozen: () => lockedRef.current });
  const a = ORDERED[active];
  const lock = (v: boolean) => { lockedRef.current = v; setLocked(v); };
  const on = engaged || locked;
  const side = POS[active].x < 55 ? 'right' : 'left';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') lock(false);
      else if (locked && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) set((active + (e.key === 'ArrowRight' ? 1 : ORDERED.length - 1)) % ORDERED.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, active, set]);

  return (
    <section className="relative w-full overflow-hidden" style={{ background: BG }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto w-full max-w-[1320px] px-[6vw] pt-24 md:pt-28">
        <div className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em]" style={{ color: '#9fb6cf' }}>{EYEBROW}</div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">{TITLE}</h2>
          <p className="m-0 max-w-[330px] text-[15px] leading-[1.8] text-white/65">초점이 맞은 별만 또렷하고, 먼 별일수록 부드럽게 풀어집니다.</p>
        </div>
      </div>

      <div ref={ref} onPointerEnter={() => setEngaged(true)} onPointerLeave={() => setEngaged(false)} onClick={() => lock(true)} className="relative h-[88vh] min-h-[580px] w-full cursor-pointer select-none" style={{ touchAction: 'none' }}>
        {/* 원경(가장 흐림) */}
        <div className="pointer-events-none absolute inset-0 transition-[filter,opacity] duration-500" style={{ transform: px(7), filter: on ? 'blur(9px)' : 'blur(1.5px)', opacity: on ? 0.45 : 0.85 }} aria-hidden>
          {FAR.map((s, i) => <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o * 0.8, animationDelay: `${s.d}s` }} />)}
        </div>
        {/* 중경(약한 흐림) */}
        <div className="pointer-events-none absolute inset-0 transition-[filter,opacity] duration-500" style={{ transform: px(15), filter: on ? 'blur(3px)' : 'none', opacity: on ? 0.7 : 1 }} aria-hidden>
          {MID.map((s, i) => <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o, boxShadow: '0 0 6px 1px rgba(255,255,255,0.5)', animationDelay: `${s.d}s` }} />)}
        </div>

        <div ref={glowRef} className="pointer-events-none absolute top-0 left-0 h-[200px] w-[200px] rounded-full opacity-0 transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(150,180,210,0.2), transparent 70%)' }} aria-hidden />

        {/* 부서 별 = 초점면(또렷) */}
        <div className="absolute inset-0" style={{ transform: px(30) }}>
          {ORDERED.map((m, i) => {
            const act = active === i;
            return (
              <span key={m.name} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%`, zIndex: act ? 5 : 2 }} aria-hidden>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300" style={{ width: act ? '40px' : '0', height: act ? '40px' : '0', borderColor: 'rgba(170,200,230,0.85)', opacity: act ? 1 : 0 }} />
                <span className="ng-twinkle block rounded-full transition-all duration-300" style={{ width: act ? '18px' : '15px', height: act ? '18px' : '15px', background: '#fff', boxShadow: act ? '0 0 20px 6px rgba(170,200,235,0.9)' : '0 0 11px 3px rgba(200,215,235,0.6)', filter: on && !act ? 'blur(1.5px)' : 'none', opacity: on && !act ? 0.6 : 1 }} />
                <span className="b1-mono absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] transition-all duration-300" style={{ color: act ? '#fff' : 'rgba(255,255,255,0.6)', opacity: on && !act ? 0.45 : 1, fontWeight: act ? 700 : 400 }}>{m.name}</span>
              </span>
            );
          })}

          {on && (
            <div className="absolute z-10 -translate-y-1/2" style={{ left: `${POS[active].x}%`, top: `${POS[active].y}%` }}>
              <div className={`absolute top-1/2 w-[240px] -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15 bg-[#0b0e14]/72 shadow-[0_30px_70px_-28px_rgba(0,0,0,0.9)] backdrop-blur-xl ${side === 'right' ? 'left-7' : 'right-7'}`} style={{ animation: 'ng-bloom 0.3s ease-out' }}>
                <div className="relative aspect-[16/10] w-full"><Image src={a.image} alt={a.name} fill sizes="240px" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" /></div>
                <div className="p-4">
                  <div className="b1-mono text-[10px] tracking-[0.1em] text-[#9fb6cf]">NG · {String(active + 1).padStart(2, '0')} · {STAGE_OF[a.name]} · {a.age}</div>
                  <div className="mt-1 text-[20px] font-bold tracking-[-0.01em] text-white">{a.name}</div>
                  <div className="mt-0.5 text-[13px] leading-[1.6] text-white/70">{a.tone}</div>
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: locked ? '60px' : '0', opacity: locked ? 1 : 0 }}>
                    <Link href={a.href} className="pointer-events-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-black no-underline transition-transform hover:translate-x-0.5">{a.name} 바로가기 <ArrowUpRight size={14} /></Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!on && <div className="b1-mono pointer-events-none absolute right-[6vw] bottom-6 text-[10px] tracking-[0.14em] text-white/35">커서를 움직여 보세요</div>}
        {locked && <button type="button" onClick={(e) => { e.stopPropagation(); lock(false); }} aria-label="닫기" className="absolute top-5 right-[6vw] z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"><X size={18} /></button>}
      </div>
    </section>
  );
};
