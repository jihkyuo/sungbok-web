'use client';

import { Youtube } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { AmbientVideo } from './AmbientVideo';
import { YOUTH, YOUTH_CHANNEL_HREF } from './data';
import { useTurntable } from './useTurntable';
import { WaveRing } from './WaveRing';

type Disc = 'vinyl' | 'cd' | 'orb' | 'none';
type Wave = 'bars';
type Reflect = 'soft' | 'gloss';

interface Props {
  endW: number;
  endH: number;
  endRadiusPx: number;
  darkHex?: string;
  shiftLeftVmin?: number;
  caption?: boolean;
  tilt?: boolean;
  disc?: Disc;
  wave?: Wave;
  reflect?: Reflect;
}

const GROW_END = 0.2;
const SPIN_START = 0.03;
const TRIGGER = 0.55;
const COVER_D = 360;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const cl = (x: number) => Math.min(1, Math.max(0, x));

const GROOVE_BG = [
  'repeating-radial-gradient(circle at center, rgba(255,255,255,0.025) 0 0.5px, transparent 0.5px 2px)', // 미세 광 그루브
  'repeating-radial-gradient(circle at center, #050507 0 1px, #131319 1px 2.8px)', // 메인 그루브
  'repeating-radial-gradient(circle at center, transparent 0 13px, rgba(0,0,0,0.5) 13.5px 14.5px, transparent 15px 28px)', // 트랙 구분 밴드
  'radial-gradient(circle at center, #17171d 0 21%, #0c0c10 30%, #050506 100%)', // 깊이
].join(', ');

const reflFixed = (gloss: boolean) => {
  const g = gloss ? 1.6 : 1;
  return [
    `radial-gradient(circle at 30% 22%, rgba(255,255,255,${0.1 * g}), transparent 44%)`, // 상단 광원
    `radial-gradient(circle, transparent 87%, rgba(255,255,255,${0.08 * g}) 93.5%, transparent 97%)`, // 밝은 림
    `radial-gradient(circle, transparent 79%, rgba(0,0,0,0.5) 87%, transparent 92%)`, // 안쪽 베벨 섀도우
    `radial-gradient(circle, transparent 52%, rgba(0,0,0,0.42) 100%)`, // 깊이 비네트
  ].join(', ');
};

/** 회전 반사 — 마주보는 두 소프트 아크(클래식 바이닐 셔머) */
const wedgeBg = (b: number) =>
  `conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,${0.05 * b}) 58deg, rgba(255,255,255,${0.1 * b}) 90deg, rgba(255,255,255,${0.05 * b}) 122deg, transparent 168deg, transparent 238deg, rgba(255,255,255,${0.04 * b}) 268deg, rgba(255,255,255,${0.08 * b}) 290deg, rgba(255,255,255,${0.04 * b}) 312deg, transparent 348deg)`;

/** 스크롤 단계별 목표 회전 속도(deg/s) — 회전감 강하게: 시작도 빠르게, 최고조는 격렬하게 */
const targetVelOf = (q: number) => (q < SPIN_START ? 0 : q < 0.24 ? 280 : q < 0.4 ? 560 : 880);

/**
 * 턴테이블 스크롤 스테이지. 회전=rAF(스핀업 관성+미세 drift+고속 그루브 모션블러), 회전 소프트 반사 웨지,
 * 불균일 그루브·다크 라벨·깊은 섀도우. 파동=WaveRing(영상 가장자리에서 링을 이루는 오디오 파동).
 * 임계서 검은 원이 화면을 덮는 애플식 반전.
 */
export const TurntableStage = ({
  endW,
  endH,
  endRadiusPx,
  darkHex = '#0b0b0d',
  shiftLeftVmin = 0,
  caption = false,
  tilt = false,
  disc = 'vinyl',
  wave = 'bars',
  reflect = 'soft',
}: Props) => {
  const { ref, q } = useTurntable();
  const hasReflect = disc === 'vinyl' || disc === 'cd';

  let blackD: number;
  if (q < GROW_END) blackD = lerp(28, 56, q / GROW_END);
  else if (q < TRIGGER) blackD = lerp(56, 66, (q - GROW_END) / (TRIGGER - GROW_END));
  else blackD = lerp(66, COVER_D, (q - TRIGGER) / (1 - TRIGGER));

  const expand = cl((q - TRIGGER) / (1 - TRIGGER));
  const decoOp = 1 - cl((q - TRIGGER) / 0.16);
  const tiltDeg = tilt ? (1 - cl(q / 0.25)) * 20 : 0;

  const vBase = q < TRIGGER ? 0.32 * blackD : 0.32 * 66;
  const vw = lerp(vBase, endW, expand);
  const vh = lerp(vBase, endH, expand);
  const tx = -shiftLeftVmin * expand;
  const labelOp = cl((expand - 0.3) / 0.6);
  const reflBoost = 1 + cl((q - TRIGGER) / 0.12) * 0.8;

  const discRef = useRef<HTMLDivElement>(null);
  const groovesRef = useRef<HTMLDivElement>(null);
  const wedgeRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const reflAngleRef = useRef(0);
  const curVelRef = useRef(0);
  const targetVelRef = useRef(0);
  const tiltRef = useRef(0);
  const qRef = useRef(0);
  const boxRef = useRef({ hw: 0, hh: 0, cr: 0 });
  targetVelRef.current = targetVelOf(q);
  tiltRef.current = tiltDeg;
  qRef.current = q;
  const vminPx = typeof window !== 'undefined' ? Math.min(window.innerWidth, window.innerHeight) / 100 : 8;
  const gapPx = 1.4 * vminPx;
  boxRef.current = {
    hw: (vw / 2) * vminPx + gapPx,
    hh: (vh / 2) * vminPx + gapPx,
    cr: Math.max(endRadiusPx, (1 - expand) * 0.5 * Math.min(vw, vh) * vminPx) + gapPx,
  };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // 스핀업/다운 관성(이징)
      curVelRef.current += (targetVelRef.current - curVelRef.current) * (1 - Math.pow(0.5, dt * 3.2));
      const v = curVelRef.current;
      const drift = 1 + 0.004 * Math.sin(now * 0.0006);
      angleRef.current = (angleRef.current + v * drift * dt) % 360;
      reflAngleRef.current = (reflAngleRef.current + (14 + v * 0.3) * dt) % 360;
      if (discRef.current) discRef.current.style.transform = `rotateX(${tiltRef.current}deg) rotate(${angleRef.current}deg)`;
      if (wedgeRef.current) wedgeRef.current.style.transform = `translate(-50%,-50%) rotate(${reflAngleRef.current}deg)`;
      // 고속 시 그루브 모션블러(물리감)
      if (groovesRef.current) {
        const sb = Math.min(3.6, Math.max(0, (v - 180) / 240) * 3.6);
        groovesRef.current.style.filter = sb > 0.06 ? `blur(${sb}px)` : '';
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={ref} className="relative w-full" style={{ height: '320vh' }}>
      <div
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ perspective: tilt ? '1400px' : undefined }}
      >
        {/* 디스크 바디 */}
        <div
          ref={discRef}
          className="relative shrink-0 rounded-full will-change-transform"
          style={{
            width: `${blackD}vmin`,
            height: `${blackD}vmin`,
            backgroundColor: darkHex,
            // 균일(무방향) 그림자 — 회전해도 안 돌고, 정면으로 튀어나오는 입체
            boxShadow: expand < 0.5 ? '0 0 80px -4px rgba(0,0,0,0.55)' : 'none',
          }}
        >
          {decoOp > 0.02 && disc === 'vinyl' && (
            <>
              <div ref={groovesRef} className="absolute inset-0 rounded-full" style={{ opacity: decoOp, background: GROOVE_BG }} />
              {/* 다크 라벨(파란 UI 원 ❌) — 미세 동심 링 */}
              <div
                className="absolute top-1/2 left-1/2 aspect-square w-[40%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
                style={{ opacity: decoOp, background: 'radial-gradient(circle at 38% 34%, #20202a, #101016 72%)' }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'conic-gradient(from 0deg, rgba(255,255,255,0.05) 0 9%, transparent 9%)' }}
                />
                <div className="absolute inset-[16%] rounded-full border border-white/10" />
                <div className="absolute inset-[42%] rounded-full border border-white/12" />
              </div>
            </>
          )}
          {decoOp > 0.02 && disc === 'cd' && (
            <div
              className="absolute inset-0 rounded-full"
              style={{ opacity: decoOp, background: 'conic-gradient(from 0deg, #ff5fa2, #5fb0ff, #5fffc2, #ffe65f, #ff8a5f, #ff5fa2)' }}
            />
          )}
          {decoOp > 0.02 && disc === 'orb' && (
            <div
              className="absolute inset-0 rounded-full"
              style={{ opacity: decoOp, background: 'radial-gradient(circle at 38% 30%, #8fb6ff, #2a4fae 50%, #0a1733 100%)' }}
            />
          )}
        </div>

        {/* 회전 소프트 반사 웨지 (screen + blur, 천천히 sweep) */}
        {decoOp > 0.02 && hasReflect && (
          <div
            ref={wedgeRef}
            className="pointer-events-none absolute top-1/2 left-1/2 overflow-hidden rounded-full will-change-transform"
            style={{
              width: `${blackD}vmin`,
              height: `${blackD}vmin`,
              opacity: decoOp * Math.min(1, reflBoost),
              mixBlendMode: 'screen',
              filter: 'blur(13px)',
              background: wedgeBg(reflBoost),
            }}
            aria-hidden
          />
        )}

        {/* 고정 반사 + 림 + 비네트 */}
        {decoOp > 0.02 && hasReflect && (
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: `${blackD}vmin`, height: `${blackD}vmin`, opacity: decoOp, background: reflFixed(reflect === 'gloss') }}
            aria-hidden
          />
        )}

        {/* 재생 파동 — 영상 모양(원→카드) 추종 */}
        <WaveRing qRef={qRef} boxRef={boxRef} mode={wave} />

        {/* 중앙 영상 — 원형 → 카드 */}
        <div
          className="absolute top-1/2 left-1/2 z-20 overflow-hidden will-change-transform"
          style={{
            width: `${vw}vmin`,
            height: `${vh}vmin`,
            transform: `translate(calc(-50% + ${tx}vmin), -50%)`,
            borderRadius: `max(${endRadiusPx}px, ${(1 - expand) * 50}%)`,
            boxShadow: expand > 0.05 ? '0 40px 100px -30px rgba(0,0,0,0.75)' : 'none',
          }}
        >
          <AmbientVideo className="absolute inset-0 h-full w-full" />
          <div className="absolute right-5 bottom-5 left-5 text-white" style={{ opacity: caption ? 0 : labelOp }}>
            <div className="b1-mono text-[10px] tracking-[0.16em] opacity-85">● 청년 예배 · YOUTH WORSHIP</div>
            <div className="mt-1 text-[22px] font-bold md:text-[30px]">청년 예배</div>
          </div>
        </div>

        {/* 에디토리얼 캡션 */}
        {caption && (
          <div
            className="pointer-events-none absolute top-1/2 right-[8vw] z-20 max-w-[36vmin] -translate-y-1/2 text-white"
            style={{ opacity: cl((expand - 0.45) / 0.55) }}
          >
            <div className="b1-mono text-b1-accent2 text-[11px] font-semibold tracking-[0.18em]">YOUTH WORSHIP</div>
            <div className="mt-2 text-[28px] font-bold tracking-[-0.02em] md:text-[40px]">청년 예배</div>
            <div className="mt-2 text-[13px] text-white/70">
              {YOUTH.schedule} · {YOUTH.place}
            </div>
            <Link
              href={YOUTH_CHANNEL_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#FF0000] px-4 py-2 text-[12px] font-semibold text-white no-underline"
            >
              <Youtube size={15} /> 청년부 유튜브 채널
            </Link>
          </div>
        )}

        <div
          className="b1-mono text-b1-muted absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-[10px] tracking-[0.16em]"
          style={{ opacity: 1 - cl(q / 0.12) }}
        >
          SCROLL
        </div>
      </div>
    </section>
  );
};
