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
 * 합본 포커스 (O×T×Q 정석) — 풀블리드 오픈 별밭(카드 박스 0). T 자기장(근접 선택)+O 다층 심도/시차/별 사이즈
 * (부서 별도 시차로 디테일하게 움직임). 커서가 들어오면 Q 랙 포커스: 배경/비활성 별 blur+dim, 활성 별 강조,
 * 그 자리에 플로팅 카드. 클릭=잠금(가로챔 차단)+CTA. 상단 #0b0b0d → 하단 #f6fafe.
 */
const BG = 'linear-gradient(180deg,#0b0b0d 0% 8%,#121022 26%,#241a38 44%,#42305a 58%,#71527e 70%,#a87e9c 80%,#d8bcc6 88%,#f6fafe 95%,#f6fafe 100%)';
const FAR = starField(50, 13, 0.6, 1.9);
const MID = starField(24, 27, 1.1, 2.6);
const POS = [
  { x: 15, y: 34 }, { x: 29, y: 60 }, { x: 21, y: 80 }, { x: 41, y: 46 }, { x: 55, y: 64 },
  { x: 49, y: 28 }, { x: 67, y: 52 }, { x: 81, y: 38 }, { x: 88, y: 70 },
];

export const VariantFocus = () => {
  const lockedRef = useRef(false);
  const [locked, setLocked] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const { ref, glowRef, active, set } = useMagnetic(POS, { frozen: () => lockedRef.current });
  const a = ORDERED[active];
  const lock = (v: boolean) => { lockedRef.current = v; setLocked(v); };
  const focusOn = engaged || locked;

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
        <div className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em] text-[#b6a6ff]">{EYEBROW}</div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">{TITLE}</h2>
          <p className="m-0 max-w-[330px] text-[15px] leading-[1.8] text-white/65">커서를 움직이면 가장 가까운 별이 깨어나 정보가 떠오릅니다.</p>
        </div>
      </div>

      <div
        ref={ref}
        onPointerEnter={() => setEngaged(true)}
        onPointerLeave={() => setEngaged(false)}
        onClick={() => lock(true)}
        className="relative h-[88vh] min-h-[580px] w-full cursor-pointer select-none"
        style={{ touchAction: 'none' }}
      >
        {/* 랙 포커스 배경(별밭) — 커서 들어오면 blur+dim */}
        <div className="absolute inset-0 transition-[filter,opacity] duration-500" style={{ filter: focusOn ? 'blur(5px)' : 'none', opacity: focusOn ? 0.5 : 1 }}>
          <div className="pointer-events-none absolute inset-0" style={{ transform: px(7) }} aria-hidden>
            {FAR.map((s, i) => <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o * 0.75, animationDelay: `${s.d}s` }} />)}
          </div>
          <div className="pointer-events-none absolute inset-0" style={{ transform: px(15) }} aria-hidden>
            {MID.map((s, i) => <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o, boxShadow: '0 0 6px 1px rgba(255,255,255,0.5)', animationDelay: `${s.d}s` }} />)}
          </div>
        </div>

        <div ref={glowRef} className="pointer-events-none absolute top-0 left-0 h-[200px] w-[200px] rounded-full opacity-0 transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(170,150,255,0.22), transparent 70%)' }} aria-hidden />

        {/* 부서 별 레이어 (O 시차로 디테일하게 움직임) */}
        <div className="absolute inset-0" style={{ transform: px(30) }}>
          {ORDERED.map((m, i) => {
            const on = active === i;
            const dim = focusOn && !on;
            return (
              <span key={m.name} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%`, zIndex: on ? 5 : 2 }} aria-hidden>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300" style={{ width: on ? '38px' : '0', height: on ? '38px' : '0', borderColor: 'rgba(182,166,255,0.85)', opacity: on ? 1 : 0 }} />
                <span className="ng-twinkle block rounded-full transition-all duration-300" style={{ width: on ? '18px' : '15px', height: on ? '18px' : '15px', background: '#fff', boxShadow: on ? '0 0 20px 6px rgba(182,166,255,0.9)' : '0 0 11px 3px rgba(190,200,255,0.6)', opacity: dim ? 0.32 : 1 }} />
                <span className="b1-mono absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] transition-all duration-300" style={{ color: on ? '#fff' : 'rgba(255,255,255,0.6)', opacity: dim ? 0.3 : 1, fontWeight: on ? 700 : 400 }}>{m.name}</span>
              </span>
            );
          })}

          {/* 플로팅 카드 (활성 자리) */}
          {focusOn && (
            <FloatingCard m={a} idx={active} locked={locked} side={POS[active].x < 55 ? 'right' : 'left'} pos={POS[active]} />
          )}
        </div>

        {!focusOn && <div className="b1-mono pointer-events-none absolute right-[6vw] bottom-6 text-[10px] tracking-[0.14em] text-white/35">커서를 움직여 보세요</div>}
        {locked && <button type="button" onClick={(e) => { e.stopPropagation(); lock(false); }} aria-label="닫기" className="absolute top-5 right-[6vw] z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"><X size={18} /></button>}
      </div>
    </section>
  );
};

function FloatingCard({ m, idx, locked, side, pos }: { m: typeof ORDERED[number]; idx: number; locked: boolean; side: 'left' | 'right'; pos: { x: number; y: number } }) {
  return (
    <div className="absolute z-10 -translate-y-1/2" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
      <div className={`absolute top-1/2 w-[240px] -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15 bg-[#0c0b16]/70 shadow-[0_30px_70px_-28px_rgba(0,0,0,0.9)] backdrop-blur-xl ${side === 'right' ? 'left-7' : 'right-7'}`} style={{ animation: 'ng-bloom 0.3s ease-out' }}>
        <div className="relative aspect-[16/10] w-full">
          <Image src={m.image} alt={m.name} fill sizes="240px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        </div>
        <div className="p-4">
          <div className="b1-mono text-[10px] tracking-[0.1em] text-[#b6a6ff]">NG · {String(idx + 1).padStart(2, '0')} · {STAGE_OF[m.name]} · {m.age}</div>
          <div className="mt-1 text-[20px] font-bold tracking-[-0.01em] text-white">{m.name}</div>
          <div className="mt-0.5 text-[13px] leading-[1.6] text-white/70">{m.tone}</div>
          <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: locked ? '60px' : '0', opacity: locked ? 1 : 0 }}>
            <Link href={m.href} className="pointer-events-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-black no-underline transition-transform hover:translate-x-0.5">{m.name} 바로가기 <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
