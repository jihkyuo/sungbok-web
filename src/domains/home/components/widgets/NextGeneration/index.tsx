'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';
import { bandField, nebula, px, starField, type Star } from './sky';
import { useMagnetic } from './useMagnetic';

/**
 * 다음세대 — O 심도(5겹 시차) + 밤하늘(은하수·반짝임) + 자기장 + 커서 추종 카드. 배경 별 항상 또렷(blur 없음).
 * 호버 카드에 바로가기 CTA 상시 표시, 클릭=즉시 페이지 이동. 커서↔활성 별 자기장 선.
 * 상단 #0b0b0d(LP 어둠 연속) → 하단 #f6fafe(여명). 다음 섹션으로 매끄럽게 잇는다.
 */
const BG =
  'linear-gradient(180deg,#0b0b0d 0% 6%,#0b0d22 12%,#121436 24%,#1c1842 38%,#2e2350 50%,#46315e 61%,#6b4a72 71%,#9a6e86 79%,#c89aa0 86%,#eccdc8 91%,#f1ebf4 95%,#f6fafe 100%)';
const DUST = starField(92, 71, 0.4, 1.1);
const WAY = bandField(86, 41);
const FAR = starField(56, 13, 0.6, 1.5);
const MID = starField(30, 27, 1.1, 2.3);
const NEAR = starField(12, 53, 2.2, 3.6);
const NEB = nebula(9, ['rgba(70,95,205,0.28)', 'rgba(120,90,210,0.24)', 'rgba(70,150,190,0.2)']);
const POS = [
  { x: 15, y: 34 }, { x: 29, y: 60 }, { x: 21, y: 80 }, { x: 41, y: 46 }, { x: 55, y: 64 },
  { x: 49, y: 28 }, { x: 67, y: 52 }, { x: 81, y: 38 }, { x: 88, y: 70 },
];

const starColor = (i: number) => (i % 6 === 0 ? '#cfe0ff' : i % 11 === 0 ? '#ffe7c4' : '#ffffff');
const dot = (s: Star, i: number, cls: string, color: string, extra?: React.CSSProperties) => (
  <span
    key={i}
    className={`${cls} absolute rounded-full`}
    style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o, backgroundColor: color, animationDelay: `${s.d}s`, animationDuration: `${s.dur}s`, ...extra }}
  />
);

export const NextGeneration = () => {
  const router = useRouter();
  const lineRef = useRef<SVGLineElement>(null);
  const [engaged, setEngaged] = useState(false);
  const { ref, glowRef, active, set } = useMagnetic(POS, { lineRef, lineFactor: 32 });
  const a = ORDERED[active];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        setEngaged(true);
        set((active + (e.key === 'ArrowRight' ? 1 : ORDERED.length - 1)) % ORDERED.length);
      } else if (e.key === 'Enter') router.push(a.href);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, a.href, set, router]);

  const backdrop = useMemo(
    () => (
      <>
        {/* cool 네뷸라 워시 (별 뒤 소프트, 별엔 blur 없음) */}
        <div className="absolute inset-0 [filter:blur(60px)]" style={{ transform: px(9), maskImage: 'linear-gradient(180deg,#000 0,#000 70%,transparent 92%)', WebkitMaskImage: 'linear-gradient(180deg,#000 0,#000 70%,transparent 92%)' }} aria-hidden>
          {NEB.map((b, i) => (
            <span key={i} className="absolute rounded-full" style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.size}vw`, height: `${b.size}vw`, background: `radial-gradient(circle, ${b.color}, transparent 70%)`, transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        {/* 은하수 코어 글로우 (띠를 따라 길게 늘어진 발광) */}
        <div className="absolute inset-0" style={{ transform: px(5) }} aria-hidden>
          <div className="absolute top-1/2 left-1/2 h-[42%] w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-[23deg] [filter:blur(46px)]" style={{ background: 'radial-gradient(60% 50% at 50% 50%, rgba(150,170,255,0.16), rgba(120,110,210,0.08) 50%, transparent 75%)' }} />
        </div>
        {/* dust */}
        <div className="absolute inset-0" style={{ transform: px(3) }} aria-hidden>{DUST.map((s, i) => dot(s, i, 'ng-twinkle', starColor(i), { opacity: s.o * 0.55 }))}</div>
        {/* 은하수 별 */}
        <div className="absolute inset-0" style={{ transform: px(5) }} aria-hidden>{WAY.map((s, i) => dot(s, i, 'ng-twinkle', starColor(i + 2), { opacity: s.o * 0.7 }))}</div>
        {/* far */}
        <div className="absolute inset-0" style={{ transform: px(7) }} aria-hidden>{FAR.map((s, i) => dot(s, i, 'ng-twinkle', starColor(i), { opacity: s.o * 0.8 }))}</div>
        {/* mid */}
        <div className="absolute inset-0" style={{ transform: px(13) }} aria-hidden>{MID.map((s, i) => dot(s, i, 'ng-twinkle', starColor(i + 1), { boxShadow: '0 0 6px 1px rgba(255,255,255,0.45)' }))}</div>
        {/* near + 일부 스파클 */}
        <div className="absolute inset-0" style={{ transform: px(22) }} aria-hidden>{NEAR.map((s, i) => dot(s, i, i % 3 === 0 ? 'ng-sparkle' : 'ng-twinkle', starColor(i + 3), { boxShadow: '0 0 10px 2px rgba(200,215,255,0.6)' }))}</div>
      </>
    ),
    [],
  );

  return (
    <section className="relative w-full overflow-hidden" style={{ background: BG }}>
      <style>{`
        @keyframes ng-twinkle { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
        .ng-twinkle { animation: ng-twinkle 3.2s ease-in-out infinite; }
        @keyframes ng-sparkle { 0%, 100% { opacity: 0.45; transform: scale(0.82); } 50% { opacity: 1; transform: scale(1.18); } }
        .ng-sparkle { animation: ng-sparkle 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ng-twinkle, .ng-sparkle { animation: none; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto w-full max-w-[1320px] px-[6vw] pt-24 md:pt-28">
        <div className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em] text-[#9fb6ff]">{EYEBROW}</div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">{TITLE}</h2>
          <p className="m-0 max-w-[330px] text-[15px] leading-[1.8] text-white/65">밤하늘을 훑으면 가장 가까운 별이 깨어나고, 정보 카드가 커서를 따라옵니다. 누르면 바로 이동합니다.</p>
        </div>
      </div>

      <div ref={ref} onClick={() => router.push(a.href)} onPointerEnter={() => setEngaged(true)} onPointerLeave={() => setEngaged(false)} className="relative h-[88vh] min-h-[580px] w-full cursor-pointer select-none" style={{ touchAction: 'none' }}>
        {backdrop}

        {/* 엣지 비네트 (깊이) */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(125% 90% at 50% 42%, transparent 55%, rgba(6,6,16,0.55) 100%)' }} aria-hidden />

        {/* 자기장 선 (커서 ↔ 활성 별) — 더 뚜렷 + 은은한 광 */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden style={{ filter: 'drop-shadow(0 0 3px rgba(159,182,255,0.85))' }}>
          <line ref={lineRef} x1="50" y1="50" x2={POS[0].x} y2={POS[0].y} stroke="rgba(176,196,255,0.85)" strokeWidth="0.34" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ opacity: 0, transition: 'opacity 0.3s' }} />
        </svg>

        {/* 부서 별 (가장 가까운 층, 가장 디테일하게 움직임) */}
        <div className="absolute inset-0" style={{ transform: px(32) }}>
          {ORDERED.map((m, i) => {
            const on = active === i;
            return (
              <span key={m.name} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%`, zIndex: on ? 6 : 3 }} aria-hidden>
                <span className="absolute top-1/2 left-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(159,182,255,0.34), transparent 66%)', opacity: on && engaged ? 1 : 0 }} />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-300" style={{ width: on ? '44px' : '0', height: on ? '44px' : '0', borderColor: 'rgba(176,196,255,0.95)', opacity: on && engaged ? 1 : 0 }} />
                <span className="ng-twinkle block rounded-full transition-all duration-300" style={{ width: on ? '20px' : '15px', height: on ? '20px' : '15px', background: '#fff', boxShadow: on ? '0 0 16px 4px #fff, 0 0 30px 10px rgba(159,182,255,0.95)' : '0 0 12px 3px rgba(150,170,235,0.7)' }} />
                <span className="b1-mono absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] transition-all duration-300" style={{ color: on ? '#fff' : 'rgba(255,255,255,0.62)', fontWeight: on ? 700 : 400 }}>{m.name}</span>
              </span>
            );
          })}
        </div>

        {/* 커서 추종 글로우 + 카드(CTA 상시) */}
        <div ref={glowRef} className="pointer-events-none absolute top-0 left-0 z-20 h-[200px] w-[200px]" aria-hidden={!engaged}>
          <span className="absolute top-1/2 left-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(159,182,255,0.3), transparent 70%)', opacity: engaged ? 1 : 0 }} />
          <div className="absolute top-[44px] left-[118px] w-[232px] overflow-hidden rounded-2xl border border-white/15 bg-[#0b0d1e]/80 shadow-[0_30px_70px_-28px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-200" style={{ opacity: engaged ? 1 : 0, transform: engaged ? 'scale(1)' : 'scale(0.94)' }}>
            <div className="relative aspect-[16/10] w-full">
              <Image src={a.image} alt={a.name} fill sizes="232px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
            </div>
            <div className="p-4">
              <div className="b1-mono text-[10px] tracking-[0.1em] text-[#9fb6ff]">NG · {String(active + 1).padStart(2, '0')} · {STAGE_OF[a.name]} · {a.age}</div>
              <div className="mt-1 text-[20px] font-bold tracking-[-0.01em] text-white">{a.name}</div>
              <div className="mt-0.5 text-[13px] leading-[1.6] text-white/70">{a.tone}</div>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-black">{a.name} 바로가기 <ArrowUpRight size={14} /></span>
            </div>
          </div>
        </div>

        {!engaged && <div className="b1-mono pointer-events-none absolute right-[6vw] bottom-6 text-[10px] tracking-[0.14em] text-white/35">밤하늘을 훑어 보세요 · 누르면 이동</div>}
      </div>
    </section>
  );
};
