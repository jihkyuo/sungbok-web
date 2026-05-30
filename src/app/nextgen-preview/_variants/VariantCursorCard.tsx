// 임시 시안 — 확정 후 nextgen-preview 폴더째 삭제
'use client';

import { ArrowUpRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { EYEBROW, ORDERED, STAGE_OF, TITLE } from './data';
import { bandField, nebula, px, starField, type Star } from './sky';
import { useMagnetic } from './useMagnetic';

/**
 * Z · 커서 카드 (고도화) — O 심도 + T 밤하늘 + T 자기장 + 커서 추종 카드. blur 제거(배경 별 항상 또렷).
 * 5겹 심도 시차(dust/은하수/far/mid/near + 부서)로 깊이감, 별 분포·크기 다양·반짝임 속도 다양·은하수 띠로
 * 진짜 밤하늘. 커서 근처 별 자동 활성(강조: 링+블룸, 흐림 없음) + 정보 카드가 커서를 따라옴. 클릭=고정.
 * 상단 #0b0b0d → 하단 #f6fafe.
 */
const BG =
  'linear-gradient(180deg,#0b0b0d 0% 7%,#0b1030 22%,#15123c 38%,#271f4e 52%,#3e2e5c 63%,#6a4a72 73%,#a87e92 82%,#d8bcc6 90%,#f6fafe 96%,#f6fafe 100%)';
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

const dot = (s: Star, i: number, cls: string, extra?: React.CSSProperties) => (
  <span
    key={i}
    className={`${cls} absolute rounded-full bg-white`}
    style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: s.o, animationDelay: `${s.d}s`, animationDuration: `${s.dur}s`, ...extra }}
  />
);

export const VariantCursorCard = () => {
  const lockedRef = useRef(false);
  const [locked, setLocked] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const { ref, glowRef, active, set } = useMagnetic(POS, { frozen: () => lockedRef.current });
  const a = ORDERED[active];
  const lock = (v: boolean) => { lockedRef.current = v; setLocked(v); };
  const show = engaged || locked;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') lock(false);
      else if (locked && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) set((active + (e.key === 'ArrowRight' ? 1 : ORDERED.length - 1)) % ORDERED.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, active, set]);

  // 정적 밤하늘 배경 — active/engaged 변동에도 리렌더 안 되게 메모
  const backdrop = useMemo(
    () => (
      <>
        {/* cool 네뷸라 워시 (별 위에 blur 안 씌움, 별 뒤 소프트) */}
        <div className="absolute inset-0 [filter:blur(60px)]" style={{ transform: px(9), maskImage: 'linear-gradient(180deg,#000 0,#000 70%,transparent 92%)', WebkitMaskImage: 'linear-gradient(180deg,#000 0,#000 70%,transparent 92%)' }} aria-hidden>
          {NEB.map((b, i) => (
            <span key={i} className="absolute rounded-full" style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.size}vw`, height: `${b.size}vw`, background: `radial-gradient(circle, ${b.color}, transparent 70%)`, transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        {/* dust (가장 먼, 많고 작고 흐림) */}
        <div className="absolute inset-0" style={{ transform: px(3) }} aria-hidden>{DUST.map((s, i) => dot(s, i, 'ng-twinkle', { opacity: s.o * 0.55 }))}</div>
        {/* 은하수 띠 */}
        <div className="absolute inset-0" style={{ transform: px(5) }} aria-hidden>{WAY.map((s, i) => dot(s, i, 'ng-twinkle', { opacity: s.o * 0.7 }))}</div>
        {/* far */}
        <div className="absolute inset-0" style={{ transform: px(7) }} aria-hidden>{FAR.map((s, i) => dot(s, i, 'ng-twinkle', { opacity: s.o * 0.8 }))}</div>
        {/* mid */}
        <div className="absolute inset-0" style={{ transform: px(13) }} aria-hidden>{MID.map((s, i) => dot(s, i, 'ng-twinkle', { boxShadow: '0 0 6px 1px rgba(255,255,255,0.45)' }))}</div>
        {/* near (크고 밝게, 일부 스파클) */}
        <div className="absolute inset-0" style={{ transform: px(22) }} aria-hidden>{NEAR.map((s, i) => dot(s, i, i % 3 === 0 ? 'ng-sparkle' : 'ng-twinkle', { boxShadow: '0 0 10px 2px rgba(200,215,255,0.6)' }))}</div>
      </>
    ),
    [],
  );

  return (
    <section className="relative w-full overflow-hidden" style={{ background: BG }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto w-full max-w-[1320px] px-[6vw] pt-24 md:pt-28">
        <div className="b1-mono mb-3 text-[11px] font-semibold tracking-[0.16em] text-[#9fb6ff]">{EYEBROW}</div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="m-0 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-white md:text-[54px]">{TITLE}</h2>
          <p className="m-0 max-w-[330px] text-[15px] leading-[1.8] text-white/65">밤하늘을 훑으면 가장 가까운 별이 깨어나고, 정보 카드가 커서를 따라옵니다.</p>
        </div>
      </div>

      <div ref={ref} onPointerEnter={() => setEngaged(true)} onPointerLeave={() => setEngaged(false)} onClick={() => lock(true)} className="relative h-[88vh] min-h-[580px] w-full cursor-pointer select-none" style={{ touchAction: 'none' }}>
        {backdrop}

        {/* 부서 별 (가장 가까운 층, O급 크기·가장 디테일하게 움직임) */}
        <div className="absolute inset-0" style={{ transform: px(32) }}>
          {ORDERED.map((m, i) => {
            const on = active === i;
            return (
              <span key={m.name} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%`, zIndex: on ? 6 : 3 }} aria-hidden>
                {/* 활성 로컬 글로우 (흐림 대신 빛으로 강조) */}
                <span className="absolute top-1/2 left-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(159,182,255,0.22), transparent 68%)', opacity: on && show ? 1 : 0 }} />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300" style={{ width: on ? '42px' : '0', height: on ? '42px' : '0', borderColor: 'rgba(159,182,255,0.85)', opacity: on && show ? 1 : 0 }} />
                <span className="ng-twinkle block rounded-full transition-all duration-300" style={{ width: on ? '19px' : '15px', height: on ? '19px' : '15px', background: '#fff', boxShadow: on ? '0 0 22px 7px rgba(159,182,255,0.95)' : '0 0 12px 3px rgba(150,170,235,0.7)' }} />
                <span className="b1-mono absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] transition-all duration-300" style={{ color: on ? '#fff' : 'rgba(255,255,255,0.62)', fontWeight: on ? 700 : 400 }}>{m.name}</span>
              </span>
            );
          })}
        </div>

        {/* 커서 추종 글로우 + 카드 */}
        <div ref={glowRef} className="pointer-events-none absolute top-0 left-0 z-20 h-[200px] w-[200px]" aria-hidden={!show}>
          <span className="absolute top-1/2 left-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(159,182,255,0.18), transparent 70%)', opacity: show ? 1 : 0 }} />
          <div className="absolute top-[44px] left-[118px] w-[232px] overflow-hidden rounded-2xl border border-white/15 bg-[#0b0d1e]/78 shadow-[0_30px_70px_-28px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-200" style={{ opacity: show ? 1 : 0, transform: show ? 'scale(1)' : 'scale(0.94)' }}>
            <div className="relative aspect-[16/10] w-full">
              <Image src={a.image} alt={a.name} fill sizes="232px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
            </div>
            <div className="p-4">
              <div className="b1-mono text-[10px] tracking-[0.1em] text-[#9fb6ff]">NG · {String(active + 1).padStart(2, '0')} · {STAGE_OF[a.name]} · {a.age}</div>
              <div className="mt-1 text-[20px] font-bold tracking-[-0.01em] text-white">{a.name}</div>
              <div className="mt-0.5 text-[13px] leading-[1.6] text-white/70">{a.tone}</div>
              <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: locked ? '60px' : '0', opacity: locked ? 1 : 0 }}>
                <Link href={a.href} className="pointer-events-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-black no-underline transition-transform hover:translate-x-0.5">{a.name} 바로가기 <ArrowUpRight size={14} /></Link>
              </div>
            </div>
          </div>
        </div>

        {!show && <div className="b1-mono pointer-events-none absolute right-[6vw] bottom-6 text-[10px] tracking-[0.14em] text-white/35">밤하늘을 훑어 보세요</div>}
        {locked && <button type="button" onClick={(e) => { e.stopPropagation(); lock(false); }} aria-label="닫기" className="absolute top-5 right-[6vw] z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"><X size={18} /></button>}
      </div>
    </section>
  );
};
