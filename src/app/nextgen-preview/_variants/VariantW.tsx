// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import { ArrowUpRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Reveal } from '@/shared/components/features/Reveal';

import { EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';
import { px, starField } from './sky';
import { useMagnetic } from './useMagnetic';

/**
 * W · 자기장 풀블리드 — [정보=섹션] 활성 부서 사진이 스테이지 배경으로 풀블리드(별밭은 그 위 유지,
 * 사진은 듀오톤/디밍). 부서명·정보는 대형 타이포로 섹션 위에. 자기장 호버로 배경+타이포가 그 자리에서
 * 크로스페이드(이동 불필요). [클릭] 커밋 → 사진이 원색으로 선명해지고 설명·CTA가 떠오르며 자기장 잠금
 * (마우스 이동 중 가로챔 제거). Esc/닫기로 해제. 상단 #0b0b0d → 하단 #f6fafe.
 */
const BG =
  'linear-gradient(180deg,#0b0b0d 0% 8%,#141022 26%,#2a1c3e 44%,#48305a 58%,#7b4f72 70%,#b07e90 80%,#dcb6b6 88%,#f6fafe 95%,#f6fafe 100%)';
const FAR = starField(40, 13, 0.6, 1.8);
const MID = starField(20, 27, 1.2, 2.6);
const POS = [
  { x: 14, y: 30 },
  { x: 27, y: 58 },
  { x: 20, y: 80 },
  { x: 40, y: 44 },
  { x: 54, y: 64 },
  { x: 48, y: 26 },
  { x: 66, y: 50 },
  { x: 80, y: 36 },
  { x: 86, y: 70 },
];
const PHOTO_MASK = 'linear-gradient(180deg, transparent 0%, #000 13%, #000 84%, transparent 100%)';

export const VariantW = () => {
  const lockedRef = useRef(false);
  const [locked, setLocked] = useState(false);
  const { ref, glowRef, active, set } = useMagnetic(POS, { frozen: () => lockedRef.current });
  const a = ORDERED[active];

  const lock = (v: boolean) => {
    lockedRef.current = v;
    setLocked(v);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') lock(false);
      else if (locked && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        set((active + (e.key === 'ArrowRight' ? 1 : ORDERED.length - 1)) % ORDERED.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, active, set]);

  return (
    <section className="relative w-full overflow-hidden" style={{ background: BG }}>
      <div className="relative mx-auto w-full max-w-[1320px] px-[6vw] pt-24 pb-28 md:pt-32 md:pb-36">
        <Reveal className="relative z-20 mb-6">
          <div className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em] text-[#9fb6ff]">{EYEBROW}</div>
          <h2 className="m-0 text-[30px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white/90 md:text-[40px]">{TITLE}</h2>
        </Reveal>

        {/* 스테이지 = 풀블리드 캔버스 */}
        <div
          ref={ref}
          onClick={() => lock(true)}
          className="relative h-[460px] cursor-pointer overflow-hidden rounded-3xl ring-1 ring-white/10 select-none sm:h-[540px] md:h-[600px]"
          style={{ touchAction: 'none' }}
        >
          {/* 배경 부서 사진 (풀블리드, 듀오톤→클릭 시 선명) */}
          {ORDERED.map((m, i) => (
            <div key={m.name} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: active === i ? 1 : 0, maskImage: PHOTO_MASK, WebkitMaskImage: PHOTO_MASK }} aria-hidden>
              <Image src={m.image} alt="" fill sizes="100vw" className="object-cover transition-[filter] duration-700" style={{ filter: locked ? 'brightness(0.82) saturate(1.02)' : 'brightness(0.34) saturate(0.55)' }} />
            </div>
          ))}
          {/* 가독 스크림 */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

          {/* 별밭 (심도 유지) */}
          <div className="pointer-events-none absolute inset-0" style={{ transform: px(6) }} aria-hidden>
            {FAR.map((s, i) => (
              <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o * 0.7, animationDelay: `${s.d}s` }} />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0" style={{ transform: px(13) }} aria-hidden>
            {MID.map((s, i) => (
              <span key={i} className="ng-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o, boxShadow: '0 0 6px 1px rgba(255,255,255,0.5)', animationDelay: `${s.d}s` }} />
            ))}
          </div>

          {/* 자기장 글로우 */}
          <div ref={glowRef} className="pointer-events-none absolute top-0 left-0 h-[180px] w-[180px] rounded-full opacity-0 transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(150,180,255,0.22), transparent 70%)' }} aria-hidden />

          {/* 부서 별 */}
          {ORDERED.map((m, i) => {
            const on = active === i;
            return (
              <span key={m.name} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%` }} aria-hidden>
                <span className="ng-twinkle block rounded-full transition-all duration-300" style={{ width: on ? '12px' : '7px', height: on ? '12px' : '7px', background: '#fff', boxShadow: on ? '0 0 16px 5px rgba(159,182,255,0.9)' : '0 0 6px 2px rgba(180,200,255,0.5)' }} />
              </span>
            );
          })}

          {/* 대형 타이포 정보 (섹션 위) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 md:p-9">
            <div className="b1-mono mb-2 text-[12px] tracking-[0.14em] text-[#bcd0ff]">{STAGE_OF[a.name]} · {a.age}</div>
            <div className="text-[44px] leading-[1] font-bold tracking-[-0.03em] text-white md:text-[68px]">{a.name}</div>

            {/* 커밋 시 2차 정보 */}
            <div className="overflow-hidden transition-all duration-500" style={{ maxHeight: locked ? '160px' : '0px', opacity: locked ? 1 : 0 }}>
              <p className="mt-3 max-w-[520px] text-[15px] leading-[1.7] text-white/80 md:text-[16.5px]">{a.tone}</p>
              <Link href={a.href} className="pointer-events-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-black no-underline transition-transform hover:translate-x-0.5">
                {a.name} 바로가기 <ArrowUpRight size={16} />
              </Link>
            </div>
            {!locked && <div className="b1-mono mt-3 text-[11px] tracking-[0.12em] text-white/55">커서로 부서를 고르고 · 클릭하면 자세히</div>}
          </div>

          {/* 닫기(커밋 해제) */}
          {locked && (
            <button type="button" onClick={(e) => { e.stopPropagation(); lock(false); }} aria-label="닫기" className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60">
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
