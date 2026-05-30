// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import { ArrowUpRight, ChevronLeft, ChevronRight, X as XIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';
import { px, starField } from './sky';
import { useMagnetic } from './useMagnetic';

/**
 * 별의 현상(現像) — 풀블리드 오픈 별밭(카드 박스 없음). 다른 별은 깨끗한 점(가독 유지),
 * 커서가 가까운 활성 별만 그 자리에서 자기 사진으로 "현상"(점→발광 포토 오브). → 사진이 전체를
 * 안 덮어 다음 별 찾기 쉬움. 클릭 = 그 자리에서 대형 디테일로 만개(잠금·←→·Esc). 상단 #0b0b0d → 하단 #f6fafe.
 */
const BG = 'linear-gradient(180deg,#0b0b0d 0% 8%,#121022 26%,#241a38 44%,#42305a 58%,#71527e 70%,#a87e9c 80%,#d8bcc6 88%,#f6fafe 95%,#f6fafe 100%)';
const FAR = starField(54, 13, 0.6, 1.9);
const MID = starField(24, 27, 1.1, 2.6);
const POS = [
  { x: 15, y: 34 }, { x: 29, y: 60 }, { x: 21, y: 80 }, { x: 41, y: 46 }, { x: 55, y: 64 },
  { x: 49, y: 28 }, { x: 67, y: 52 }, { x: 81, y: 38 }, { x: 88, y: 70 },
];

export const VariantDevelop = () => {
  const [open, setOpen] = useState<number | null>(null);
  const openRef = useRef<number | null>(null);
  const { ref, glowRef, active, set } = useMagnetic(POS, { frozen: () => openRef.current !== null });
  const setOpenS = (v: number | null) => { openRef.current = v; setOpen(v); };

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
      {/* 타이틀 오버레이 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-[1320px] px-[6vw] pt-24 md:pt-28">
        <div className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em] text-[#b6a6ff]">{EYEBROW}</div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">{TITLE}</h2>
          <p className="m-0 max-w-[330px] text-[15px] leading-[1.8] text-white/65">커서가 닿는 별이 사진으로 깨어납니다. 누르면 활짝 펼쳐집니다.</p>
        </div>
      </div>

      {/* 풀블리드 필드 (박스 없음) */}
      <div ref={ref} className="relative h-[86vh] min-h-[560px] w-full" style={{ touchAction: 'none' }}>
        {/* 별밭(심도) */}
        <div className="pointer-events-none absolute inset-0" style={{ transform: px(6) }} aria-hidden>
          {FAR.map((s, i) => <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o * 0.75, animationDelay: `${s.d}s` }} />)}
        </div>
        <div className="pointer-events-none absolute inset-0" style={{ transform: px(13) }} aria-hidden>
          {MID.map((s, i) => <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o, boxShadow: '0 0 6px 1px rgba(255,255,255,0.5)', animationDelay: `${s.d}s` }} />)}
        </div>

        {/* 자기장 글로우 */}
        <div ref={glowRef} className="pointer-events-none absolute top-0 left-0 h-[200px] w-[200px] rounded-full opacity-0 transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(170,150,255,0.22), transparent 70%)' }} aria-hidden />

        {/* 부서 별 — 점 + 활성 시 사진 현상 */}
        {ORDERED.map((m, i) => {
          const on = active === i;
          return (
            <button key={m.name} type="button" onMouseEnter={() => set(i)} onClick={() => setOpenS(i)} aria-label={`${m.name} 펼치기`} className="group absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%`, zIndex: on ? 10 : 2 }}>
              {/* 점(비활성) */}
              <span className="ng-twinkle absolute block rounded-full transition-opacity duration-300" style={{ width: '10px', height: '10px', background: '#fff', boxShadow: '0 0 8px 2px rgba(190,200,255,0.6)', opacity: on ? 0 : 0.9 }} />
              {/* 사진 오브(활성) — 현상 */}
              <span className="absolute overflow-hidden rounded-full ring-2 ring-white/30 transition-all duration-[450ms] ease-out" style={{ width: on ? '146px' : '12px', height: on ? '146px' : '12px', opacity: on ? 1 : 0, boxShadow: on ? '0 0 40px 6px rgba(150,140,255,0.45)' : 'none' }}>
                <Image src={m.image} alt={m.name} fill sizes="160px" className="object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </span>
              <span className="b1-mono absolute top-[calc(50%+12px)] left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] transition-all duration-300" style={{ color: on ? '#fff' : 'rgba(255,255,255,0.55)', transform: on ? 'translate(-50%, 76px)' : 'translate(-50%, 0)', fontWeight: on ? 700 : 400 }}>{m.name}</span>
            </button>
          );
        })}

        {!open && <div className="b1-mono pointer-events-none absolute right-[6vw] bottom-6 text-[10px] tracking-[0.14em] text-white/35">별을 누르면 펼쳐집니다</div>}

        {/* 만개 디테일 */}
        {d && (
          <div className="absolute top-1/2 left-1/2 z-30 w-[min(720px,90vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/12 bg-[#0c0b16]/85 backdrop-blur-2xl" style={{ transformOrigin: `${POS[open!].x}% ${POS[open!].y}%`, animation: 'ng-bloom 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
            <div className="flex flex-col md:flex-row">
              <div className="relative h-56 w-full md:h-[340px] md:w-[55%]">
                <Image src={d.image} alt={d.name} fill sizes="(max-width:768px) 90vw, 400px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent md:bg-gradient-to-r" />
              </div>
              <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
                <div className="b1-mono text-[11px] tracking-[0.14em] text-[#b6a6ff]">NG · {String(open! + 1).padStart(2, '0')} · {STAGE_OF[d.name]}</div>
                <div className="mt-2 text-[30px] font-bold tracking-[-0.02em] text-white md:text-[38px]">{d.name}</div>
                <div className="b1-mono mt-1 text-[13px] text-white/55">{d.age}</div>
                <p className="mt-3 text-[14.5px] leading-[1.75] text-white/80">{d.tone}</p>
                <Link href={d.href} className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-black no-underline transition-transform hover:translate-x-0.5">{d.name} 바로가기 <ArrowUpRight size={16} /></Link>
                <div className="mt-5 flex items-center gap-2">
                  <button type="button" onClick={() => setOpenS((open! - 1 + ORDERED.length) % ORDERED.length)} aria-label="이전" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"><ChevronLeft size={16} /></button>
                  <button type="button" onClick={() => setOpenS((open! + 1) % ORDERED.length)} aria-label="다음" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"><ChevronRight size={16} /></button>
                  <span className="b1-mono ml-1 text-[11px] tracking-[0.1em] text-white/45">{String(open! + 1).padStart(2, '0')} / 09</span>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setOpenS(null)} aria-label="닫기" className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"><XIcon size={18} /></button>
          </div>
        )}
      </div>
    </section>
  );
};
