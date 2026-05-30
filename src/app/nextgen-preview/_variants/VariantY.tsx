// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Reveal } from '@/shared/components/features/Reveal';

import { EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';
import { px, starField } from './sky';
import { useMagnetic } from './useMagnetic';

/**
 * Y · 자기장 갤럭시 줌 — 호버(자기장)로 성좌를 훑다가 [클릭] 그 별로 카메라가 줌-인(주변 별이 뒤로
 * 흐르고 클릭 별이 중심) → 그 부서의 풀섹션 장면(대형 이미지·정보·CTA)으로 전개. "성좌로"로 줌-아웃.
 * 클릭=공간 진입이라 이동/가로챔 단계 없음. T의 심도/시차를 줌 축으로 확장. 상단 #0b0b0d → 하단 #f6fafe.
 */
const BG =
  'linear-gradient(180deg,#0b0b0d 0% 8%,#0f1024 26%,#191a3c 44%,#302a5a 58%,#574f86 70%,#8b86b4 80%,#cbc6dc 88%,#f6fafe 95%,#f6fafe 100%)';
const FAR = starField(48, 31, 0.6, 2);
const POS = [
  { x: 16, y: 32 },
  { x: 30, y: 60 },
  { x: 22, y: 82 },
  { x: 42, y: 44 },
  { x: 55, y: 66 },
  { x: 49, y: 26 },
  { x: 66, y: 52 },
  { x: 80, y: 36 },
  { x: 87, y: 70 },
];

export const VariantY = () => {
  const [zoom, setZoom] = useState<number | null>(null);
  const zoomRef = useRef<number | null>(null);
  const [origin, setOrigin] = useState('50% 50%');
  const { ref, glowRef, active, set } = useMagnetic(POS, { frozen: () => zoomRef.current !== null });
  const enter = (i: number) => {
    setOrigin(`${POS[i].x}% ${POS[i].y}%`);
    zoomRef.current = i;
    setZoom(i);
  };
  const exit = () => {
    zoomRef.current = null;
    setZoom(null);
  };

  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit();
      else if (e.key === 'ArrowRight') enter((zoom + 1) % ORDERED.length);
      else if (e.key === 'ArrowLeft') enter((zoom - 1 + ORDERED.length) % ORDERED.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  const z = zoom !== null ? ORDERED[zoom] : null;

  return (
    <section className="relative w-full overflow-hidden" style={{ background: BG }}>
      <div className="relative mx-auto w-full max-w-[1320px] px-[6vw] pt-24 pb-28 md:pt-32 md:pb-36">
        <Reveal className="mb-8 md:mb-10">
          <div className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em] text-[#a9a6ff]">{EYEBROW}</div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">{TITLE}</h2>
            <p className="m-0 max-w-[340px] text-[15px] leading-[1.8] text-white/65">별을 누르면 그 자리로 빨려 들어가 부서를 만납니다.</p>
          </div>
        </Reveal>

        <div ref={ref} className="relative h-[460px] overflow-hidden rounded-3xl ring-1 ring-white/10 sm:h-[540px] md:h-[600px]" style={{ touchAction: 'none' }}>
          {/* 성좌 맵 (줌-인 시 확대+페이드) */}
          <div className="absolute inset-0" style={{ transformOrigin: origin, transform: zoom !== null ? 'scale(4.4)' : 'scale(1)', opacity: zoom !== null ? 0 : 1, transition: 'transform 0.7s cubic-bezier(0.7,0,0.2,1), opacity 0.6s ease' }}>
            {/* 별밭(심도) */}
            <div className="pointer-events-none absolute inset-0" style={{ transform: px(7) }} aria-hidden>
              {FAR.map((s, i) => (
                <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o * 0.75, animationDelay: `${s.d}s` }} />
              ))}
            </div>
            {/* 자기장 글로우 */}
            <div ref={glowRef} className="pointer-events-none absolute top-0 left-0 h-[180px] w-[180px] rounded-full opacity-0 transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(150,170,255,0.24), transparent 70%)' }} aria-hidden />
            {/* 부서 별 */}
            {ORDERED.map((m, i) => {
              const on = active === i;
              return (
                <button key={m.name} type="button" onMouseEnter={() => set(i)} onClick={() => enter(i)} aria-label={`${m.name}로 진입`} className="group absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%` }}>
                  <span className="absolute rounded-full border transition-all duration-300" style={{ width: on ? '32px' : '0', height: on ? '32px' : '0', borderColor: 'rgba(169,166,255,0.85)', opacity: on ? 1 : 0 }} aria-hidden />
                  <span className="ng-twinkle block rounded-full transition-all duration-300 group-hover:scale-125" style={{ width: on ? '13px' : '9px', height: on ? '13px' : '9px', background: '#fff', boxShadow: on ? '0 0 16px 5px rgba(169,166,255,0.9)' : '0 0 7px 2px rgba(200,200,255,0.5)' }} />
                  <span className="b1-mono absolute top-[calc(50%+13px)] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10.5px] transition-colors duration-300" style={{ color: on ? '#fff' : 'rgba(255,255,255,0.5)' }}>{m.name}</span>
                </button>
              );
            })}
            {zoom === null && <div className="b1-mono pointer-events-none absolute right-4 bottom-3 text-[10px] tracking-[0.14em] text-white/35">별을 누르면 진입합니다</div>}
          </div>

          {/* 부서 풀섹션 장면 */}
          <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: zoom !== null ? 1 : 0, pointerEvents: zoom !== null ? 'auto' : 'none' }}>
            {z && (
              <>
                {ORDERED.map((m, i) => (
                  <Image key={m.name} src={m.image} alt="" fill sizes="100vw" className="object-cover transition-opacity duration-500" style={{ opacity: zoom === i ? 1 : 0 }} aria-hidden />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/55" />
                <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-12">
                  <div className="b1-mono text-[12px] tracking-[0.14em] text-[#bcb6ff]">NG · {String(zoom! + 1).padStart(2, '0')} · {STAGE_OF[z.name]} · {z.age}</div>
                  <div className="mt-2 text-[44px] leading-[1] font-bold tracking-[-0.03em] text-white md:text-[72px]">{z.name}</div>
                  <p className="mt-3 max-w-[520px] text-[15px] leading-[1.8] text-white/82 md:text-[17px]">{z.tone}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link href={z.href} className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-black no-underline transition-transform hover:translate-x-0.5">{z.name} 바로가기 <ArrowUpRight size={16} /></Link>
                    <button type="button" onClick={exit} className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"><ArrowLeft size={15} /> 성좌로</button>
                    <span className="ml-1 flex items-center gap-1">
                      <button type="button" onClick={() => enter((zoom! - 1 + ORDERED.length) % ORDERED.length)} aria-label="이전" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"><ChevronLeft size={16} /></button>
                      <button type="button" onClick={() => enter((zoom! + 1) % ORDERED.length)} aria-label="다음" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"><ChevronRight size={16} /></button>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
