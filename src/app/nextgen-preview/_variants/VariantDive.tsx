// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';
import { px, starField } from './sky';
import { useMagnetic } from './useMagnetic';

/**
 * 몰입 확장 (O×T×Q + 깊은 정보) — 호버=Q 카드 미리보기 + 랙 포커스(배경 blur+dim). 클릭=그 카드가 대형
 * 인플레이스 몰입 디테일로 모핑(풍부 정보), 잠금·←→·Esc. T 자기장 + O 시차/별 사이즈. 상단 #0b0b0d → 하단 #f6fafe.
 */
const BG = 'linear-gradient(180deg,#0b0b0d 0% 8%,#121022 26%,#231a3a 44%,#3e2c56 58%,#67498a 70%,#9784b4 80%,#cdc4dc 88%,#f6fafe 95%,#f6fafe 100%)';
const FAR = starField(50, 43, 0.6, 1.9);
const MID = starField(24, 47, 1.1, 2.6);
const POS = [
  { x: 15, y: 34 }, { x: 29, y: 60 }, { x: 21, y: 80 }, { x: 41, y: 46 }, { x: 55, y: 64 },
  { x: 49, y: 28 }, { x: 67, y: 52 }, { x: 81, y: 38 }, { x: 88, y: 70 },
];

export const VariantDive = () => {
  const openRef = useRef<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [engaged, setEngaged] = useState(false);
  const { ref, glowRef, active, set } = useMagnetic(POS, { frozen: () => openRef.current !== null });
  const a = ORDERED[active];
  const setOpenS = (v: number | null) => { openRef.current = v; setOpen(v); };
  const side = POS[active].x < 55 ? 'right' : 'left';
  const focusOn = engaged && open === null;

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenS(null);
      else if (e.key === 'ArrowRight') setOpenS((open + 1) % ORDERED.length);
      else if (e.key === 'ArrowLeft') setOpenS((open - 1 + ORDERED.length) % ORDERED.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const d = open !== null ? ORDERED[open] : null;

  return (
    <section className="relative w-full overflow-hidden" style={{ background: BG }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto w-full max-w-[1320px] px-[6vw] pt-24 transition-opacity duration-300 md:pt-28" style={{ opacity: open === null ? 1 : 0 }}>
        <div className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em] text-[#b6a6ff]">{EYEBROW}</div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">{TITLE}</h2>
          <p className="m-0 max-w-[330px] text-[15px] leading-[1.8] text-white/65">가까운 별을 미리 보고, 누르면 그 자리에서 크게 펼쳐집니다.</p>
        </div>
      </div>

      <div ref={ref} onPointerEnter={() => setEngaged(true)} onPointerLeave={() => setEngaged(false)} onClick={() => setOpenS(active)} className="relative h-[88vh] min-h-[580px] w-full cursor-pointer select-none" style={{ touchAction: 'none' }}>
        {/* 랙 포커스 배경 */}
        <div className="absolute inset-0 transition-[filter,opacity] duration-500" style={{ filter: focusOn || open !== null ? 'blur(5px)' : 'none', opacity: focusOn || open !== null ? 0.5 : 1 }}>
          <div className="pointer-events-none absolute inset-0" style={{ transform: px(7) }} aria-hidden>
            {FAR.map((s, i) => <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o * 0.75, animationDelay: `${s.d}s` }} />)}
          </div>
          <div className="pointer-events-none absolute inset-0" style={{ transform: px(15) }} aria-hidden>
            {MID.map((s, i) => <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o, boxShadow: '0 0 6px 1px rgba(255,255,255,0.5)', animationDelay: `${s.d}s` }} />)}
          </div>
        </div>

        <div ref={glowRef} className="pointer-events-none absolute top-0 left-0 h-[200px] w-[200px] rounded-full opacity-0 transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(170,150,255,0.22), transparent 70%)' }} aria-hidden />

        {/* 부서 별 + 미리보기 카드 */}
        <div className="absolute inset-0" style={{ transform: px(30), opacity: open === null ? 1 : 0, transition: 'opacity 0.3s' }}>
          {ORDERED.map((m, i) => {
            const act = active === i;
            const dim = focusOn && !act;
            return (
              <span key={m.name} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%`, zIndex: act ? 5 : 2 }} aria-hidden>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300" style={{ width: act ? '40px' : '0', height: act ? '40px' : '0', borderColor: 'rgba(182,166,255,0.85)', opacity: act ? 1 : 0 }} />
                <span className="ng-twinkle block rounded-full transition-all duration-300" style={{ width: act ? '18px' : '15px', height: act ? '18px' : '15px', background: '#fff', boxShadow: act ? '0 0 20px 6px rgba(182,166,255,0.9)' : '0 0 11px 3px rgba(190,200,255,0.6)', opacity: dim ? 0.32 : 1 }} />
                <span className="b1-mono absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] transition-all duration-300" style={{ color: act ? '#fff' : 'rgba(255,255,255,0.6)', opacity: dim ? 0.3 : 1, fontWeight: act ? 700 : 400 }}>{m.name}</span>
              </span>
            );
          })}

          {focusOn && (
            <div className="absolute z-10 -translate-y-1/2" style={{ left: `${POS[active].x}%`, top: `${POS[active].y}%` }}>
              <div className={`absolute top-1/2 w-[230px] -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15 bg-[#0c0b16]/72 shadow-[0_30px_70px_-28px_rgba(0,0,0,0.9)] backdrop-blur-xl ${side === 'right' ? 'left-7' : 'right-7'}`} style={{ animation: 'ng-bloom 0.3s ease-out' }}>
                <div className="relative aspect-[16/10] w-full"><Image src={a.image} alt={a.name} fill sizes="230px" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /></div>
                <div className="p-4">
                  <div className="b1-mono text-[10px] tracking-[0.1em] text-[#b6a6ff]">{STAGE_OF[a.name]} · {a.age}</div>
                  <div className="mt-1 text-[19px] font-bold tracking-[-0.01em] text-white">{a.name}</div>
                  <div className="mt-1 text-[11px] tracking-[0.04em] text-white/45">누르면 자세히 ↗</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 클릭 몰입 디테일 */}
        {d && (
          <div className="absolute inset-3 z-20 flex flex-col overflow-hidden rounded-3xl border border-white/12 md:inset-6 md:flex-row" style={{ transformOrigin: `${POS[open!].x}% ${POS[open!].y}%`, animation: 'ng-bloom 0.45s cubic-bezier(0.16,1,0.3,1)' }}>
            <div className="relative h-1/2 w-full md:h-full md:w-[56%]">
              <Image src={d.image} alt={d.name} fill sizes="(max-width:768px) 100vw, 55vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent md:bg-gradient-to-r" />
            </div>
            <div className="relative flex flex-1 flex-col justify-center bg-[#0c0b16]/88 p-7 backdrop-blur-2xl md:p-10">
              <div className="b1-mono text-[11px] tracking-[0.14em] text-[#b6a6ff]">NG · {String(open! + 1).padStart(2, '0')} · {STAGE_OF[d.name]}</div>
              <div className="mt-2 text-[34px] font-bold tracking-[-0.02em] text-white md:text-[44px]">{d.name}</div>
              <div className="b1-mono mt-1 text-[13px] text-white/55">{d.age}</div>
              <p className="mt-4 max-w-[420px] text-[15px] leading-[1.8] text-white/80">{d.tone}</p>
              <Link href={d.href} className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-black no-underline transition-transform hover:translate-x-0.5">{d.name} 바로가기 <ArrowUpRight size={16} /></Link>
              <div className="mt-6 flex items-center gap-2">
                <button type="button" onClick={(e) => { e.stopPropagation(); setOpenS((open! - 1 + ORDERED.length) % ORDERED.length); }} aria-label="이전" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"><ChevronLeft size={18} /></button>
                <button type="button" onClick={(e) => { e.stopPropagation(); setOpenS((open! + 1) % ORDERED.length); }} aria-label="다음" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"><ChevronRight size={18} /></button>
                <span className="b1-mono ml-1 text-[11px] tracking-[0.1em] text-white/45">{String(open! + 1).padStart(2, '0')} / 09</span>
              </div>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); setOpenS(null); }} aria-label="닫기" className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"><X size={18} /></button>
          </div>
        )}

        {!focusOn && open === null && <div className="b1-mono pointer-events-none absolute right-[6vw] bottom-6 text-[10px] tracking-[0.14em] text-white/35">커서를 움직이고 · 누르면 펼쳐집니다</div>}
      </div>
    </section>
  );
};
