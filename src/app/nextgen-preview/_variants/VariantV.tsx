// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Reveal } from '@/shared/components/features/Reveal';

import { EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';
import { px, starField } from './sky';
import { useParallax } from './useParallax';

/**
 * V · 성문 — [조준 해결] 각 별에 넉넉한 투명 히트존(~60px)+라벨로 클릭이 쉽고, 자동 투어 스포트라이트가
 * 부서를 천천히 순회(입력 없이도 발견성↑, 호버 시 일시정지). [정보 해결] 클릭하면 거의 풀블리드 대형
 * 몰입 디테일로 확장(별→패널 모핑: 큰 이미지+부서명+설명+생애주기·연령+CTA), Esc/닫기, ←→ 전환.
 * 상단 #0b0b0d(LP 연속) → 하단 #f6fafe(교회소식).
 */
const BG =
  'linear-gradient(180deg,#0b0b0d 0% 8%,#101020 26%,#1c1838 44%,#33285a 58%,#5a4a86 70%,#8e86b4 80%,#cdc6dc 88%,#f6fafe 95%,#f6fafe 100%)';
const FAR = starField(46, 31, 0.6, 1.9);
const POS = [
  { x: 14, y: 30 },
  { x: 28, y: 58 },
  { x: 20, y: 80 },
  { x: 41, y: 42 },
  { x: 54, y: 64 },
  { x: 48, y: 24 },
  { x: 66, y: 50 },
  { x: 80, y: 34 },
  { x: 88, y: 70 },
];

export const VariantV = () => {
  const ref = useParallax<HTMLDivElement>();
  const [focus, setFocus] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const reduceRef = useRef(false);

  useEffect(() => {
    reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // 자동 투어 — 호버/열림/감속모션이면 정지
  useEffect(() => {
    if (hovering || open !== null || reduceRef.current) return;
    const id = setInterval(() => setFocus((f) => (f + 1) % ORDERED.length), 3200);
    return () => clearInterval(id);
  }, [hovering, open]);

  // 디테일 열림 시 키보드
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      else if (e.key === 'ArrowRight') setOpen((o) => (o === null ? 0 : (o + 1) % ORDERED.length));
      else if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? 0 : (o - 1 + ORDERED.length) % ORDERED.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const d = open !== null ? ORDERED[open] : null;

  return (
    <section className="relative w-full overflow-hidden" style={{ background: BG }}>
      <div className="relative mx-auto w-full max-w-[1320px] px-[6vw] pt-24 pb-28 md:pt-32 md:pb-36">
        <Reveal className="mb-8 md:mb-10">
          <div className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em] text-[#b3a6ff]">{EYEBROW}</div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">
              {TITLE}
            </h2>
            <p className="m-0 max-w-[340px] text-[15px] leading-[1.8] text-white/65">
              빛이 머무는 별을 누르면 그 자리가 활짝 열립니다.
            </p>
          </div>
        </Reveal>

        {/* 별 맵 */}
        <div ref={ref} className="relative h-[460px] overflow-hidden rounded-3xl ring-1 ring-white/10 sm:h-[540px] md:h-[600px]">
          <div className="absolute inset-0 transition-[filter,opacity] duration-500" style={{ filter: open !== null ? 'blur(8px)' : 'none', opacity: open !== null ? 0.4 : 1 }}>
            {/* 먼 별 */}
            <div className="absolute inset-0" style={{ transform: px(7) }} aria-hidden>
              {FAR.map((s, i) => (
                <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o * 0.75, animationDelay: `${s.d}s` }} />
              ))}
            </div>

            {/* 부서 별 — 넉넉한 히트존 */}
            {ORDERED.map((m, i) => {
              const on = focus === i;
              return (
                <button
                  key={m.name}
                  type="button"
                  onMouseEnter={() => { setFocus(i); setHovering(true); }}
                  onMouseLeave={() => setHovering(false)}
                  onFocus={() => { setFocus(i); setHovering(true); }}
                  onBlur={() => setHovering(false)}
                  onClick={() => setOpen(i)}
                  aria-label={`${m.name} 자세히 보기`}
                  className="group absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none"
                  style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%` }}
                >
                  {/* 스포트라이트(자동 투어/호버) */}
                  <span className="absolute h-16 w-16 rounded-full transition-all duration-500" style={{ background: 'radial-gradient(circle, rgba(160,150,255,0.35), transparent 70%)', opacity: on ? 1 : 0, transform: on ? 'scale(1.4)' : 'scale(0.6)' }} aria-hidden />
                  <span className="absolute rounded-full border transition-all duration-300" style={{ width: on ? '30px' : '0', height: on ? '30px' : '0', borderColor: 'rgba(179,166,255,0.8)', opacity: on ? 1 : 0 }} aria-hidden />
                  <span className="ng-twinkle block rounded-full transition-all duration-300 group-hover:scale-125" style={{ width: on ? '12px' : '9px', height: on ? '12px' : '9px', background: '#fff', boxShadow: on ? '0 0 16px 5px rgba(179,166,255,0.9)' : '0 0 8px 2px rgba(200,200,255,0.55)' }} />
                  <span className="b1-mono absolute top-[calc(50%+14px)] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10.5px] transition-colors duration-300" style={{ color: on ? '#e3dcff' : 'rgba(255,255,255,0.55)' }}>{m.name}</span>
                </button>
              );
            })}

            <div className="b1-mono pointer-events-none absolute right-4 bottom-3 text-[10px] tracking-[0.14em] text-white/35">별을 누르면 열립니다</div>
          </div>

          {/* 몰입 디테일 (성문 열림) */}
          {d && (
            <div className="absolute inset-0 z-10 flex flex-col overflow-hidden md:flex-row" style={{ animation: 'ng-gate 0.45s cubic-bezier(0.16,1,0.3,1)' }}>
              <div className="relative h-1/2 w-full md:h-full md:w-[58%]">
                <Image src={d.image} alt={d.name} fill sizes="(max-width:768px) 100vw, 55vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
              </div>
              <div className="relative flex flex-1 flex-col justify-center bg-[#0c0b16]/85 p-7 backdrop-blur-xl md:p-10">
                <div className="b1-mono text-[11px] tracking-[0.14em] text-[#b3a6ff]">NG · {String(open! + 1).padStart(2, '0')} · {STAGE_OF[d.name]}</div>
                <div className="mt-2 text-[34px] font-bold tracking-[-0.02em] text-white md:text-[44px]">{d.name}</div>
                <div className="b1-mono mt-1 text-[13px] text-white/55">{d.age}</div>
                <p className="mt-4 max-w-[420px] text-[15px] leading-[1.8] text-white/78">{d.tone}</p>
                <Link href={d.href} className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-black no-underline transition-transform hover:translate-x-0.5">
                  {d.name} 바로가기 <ArrowUpRight size={16} />
                </Link>

                {/* 컨트롤 */}
                <div className="mt-7 flex items-center gap-2">
                  <button type="button" onClick={() => setOpen((o) => (o! - 1 + ORDERED.length) % ORDERED.length)} aria-label="이전" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"><ChevronLeft size={18} /></button>
                  <button type="button" onClick={() => setOpen((o) => (o! + 1) % ORDERED.length)} aria-label="다음" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"><ChevronRight size={18} /></button>
                  <span className="b1-mono ml-1 text-[11px] tracking-[0.1em] text-white/45">{String(open! + 1).padStart(2, '0')} / {String(ORDERED.length).padStart(2, '0')}</span>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(null)} aria-label="닫기" className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"><X size={18} /></button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
