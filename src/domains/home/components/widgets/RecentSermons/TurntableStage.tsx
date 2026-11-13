'use client';

import { ArrowUpRight, Volume2, VolumeX } from 'lucide-react';
import { YoutubeIcon } from '@/shared/components/brand/YoutubeIcon';
import { Photo } from '@/shared/components/features/Photo';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import allLiveLogo from '@/assets/icons/allLive-team-logo.png';
import { useAudioFocus } from '@/shared/lib/audioFocus';
import { useNearViewport } from '@/shared/lib/hooks/useNearViewport';
import { usePrefersReducedMotion } from '@/shared/lib/hooks/usePrefersReducedMotion';

import { POSTER, YOUTH, YOUTH_CHANNEL_HREF, YOUTH_VIDEO_EMBED } from './data';
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
  // 유튜브 임베드(플레이어 JS 수백 KB·요청 수십 개)는 첫 로딩에서 빼고, 섹션이 1.5화면 앞까지 오면 붙인다.
  // 회전 rAF 도 그때부터 돈다 — 화면 밖에서 메인 스레드를 쓰지 않게.
  const near = useNearViewport(ref, '150% 0px');
  // 동작 줄이기면 임베드를 붙이지 않고 포스터만 둔다(자동재생 금지 — DESIGN.md §3). 영상은 채널 칩 링크로 본다.
  // (LiveStage·광고 릴은 대신 네이티브 컨트롤로 재생하게 한다 — 실제 청년 예배 영상으로 바꿀 때 같은 방식 검토)
  const reduced = usePrefersReducedMotion();
  const playing = near && !reduced;
  const hasReflect = disc === 'vinyl' || disc === 'cd';
  // 임베드 로드 직후 잠깐 노출되는 YouTube 재생 컨트롤을 가리는 포스터.
  // 섹션이 가까워져 임베드가 붙는 시점부터 영상은 자동재생되고, 컨트롤이 사라질 즈음 페이드아웃 →
  // 사용자가 스크롤로 턴테이블에 도달할 땐 이미 깨끗한 재생 상태.
  const [posterFaded, setPosterFaded] = useState(false);
  // 유튜브 플레이어가 명령(mute/unMute)을 받을 준비가 됐는지 — iframe 이 보내는 onReady 메시지로 안다.
  const [playerReady, setPlayerReady] = useState(false);
  // 8초 안에 준비 신호가 없으면(느린 망·확장 프로그램 등) 기다리지 않고 예전처럼 그대로 띄운다 — 포스터 걷고 버튼도 켠다.
  const [gaveUp, setGaveUp] = useState(false);
  const embedUsable = playerReady || gaveUp;
  // 재생이 멈추면(페이지를 연 채 동작 줄이기 전환) 포스터·준비 상태를 처음으로 — 다음에 붙는 iframe 은 새 플레이어다.
  const [wasPlaying, setWasPlaying] = useState(playing);
  if (playing !== wasPlaying) {
    setWasPlaying(playing);
    if (!playing) {
      setPosterFaded(false);
      setPlayerReady(false);
      setGaveUp(false);
    }
  }

  // 무음 자동재생이 기본 — 버튼(=사용자 제스처)으로만 소리 토글. enablejsapi 임베드에
  // postMessage 명령을 보내 mute/unMute. (클릭 시점이라 unMute 가 정책상 허용됨)
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // 채널 칩: 호버 또는 자동 펄스로 펼침 (호버 우선)
  const [hovered, setHovered] = useState(false);
  const [autoExpanded, setAutoExpanded] = useState(false);
  const expanded = hovered || autoExpanded;
  // 홈 단일 소리 규칙: 소리를 켜면 주인을 가져오고(claim), 다른 영상이 켜져 주인을 뺏기면 스스로 음소거.
  const audio = useAudioFocus('lp');
  const muted = !audio.active; // 음소거 상태 = 소리 주인 아님
  const sendMute = (func: 'mute' | 'unMute') =>
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      'https://www.youtube.com'
    );
  const toggleMute = () => {
    if (muted) {
      audio.claim();
      sendMute('unMute');
    } else {
      audio.release();
      sendMute('mute');
    }
  };
  // 다른 영상이 소리를 가져가면 임베드를 음소거한다(외부 시스템 동기화).
  useEffect(() => {
    if (!audio.active) sendMute('mute');
  }, [audio.active]);
  // 임베드가 빠지면 소리 주인 자리도 내놓는다 — 새 iframe 은 음소거로 시작하므로 «켜짐» 표시가 남지 않게.
  const releaseAudio = audio.release;
  useEffect(() => {
    if (!playing) releaseAudio();
  }, [playing, releaseAudio]);
  // 플레이어 준비 신호 — 공식 IFrame API 와 같은 규약: 응답이 올 때까지 250ms 마다 'listening' 을 보내고,
  // 처음 붙으면 onReady·initialDelivery, 이미 초기화된 뒤 다시 물으면 alreadyInitialized 가 온다. 셋 다 «준비됨».
  // 리스너를 먼저 걸고 보내므로 응답을 놓치지 않는다. 버튼은 준비 전 disabled 라 그 사이 소리 명령은 없다.
  // 끝내 답이 없으면 8초에 묻기를 멈추고 대체 표시로 넘어간다(gaveUp).
  useEffect(() => {
    if (!playing || embedUsable) return;
    const READY = new Set(['onReady', 'initialDelivery', 'alreadyInitialized']);
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow || typeof e.data !== 'string') return;
      try {
        if (READY.has(JSON.parse(e.data)?.event)) setPlayerReady(true);
      } catch {
        // 유튜브가 아닌 문자열 메시지
      }
    };
    window.addEventListener('message', onMessage);
    const listen = () =>
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: 'lp', channel: 'widget' }),
        'https://www.youtube.com'
      );
    listen();
    const retry = setInterval(listen, 250);
    const giveUp = setTimeout(() => setGaveUp(true), 8000);
    return () => {
      window.removeEventListener('message', onMessage);
      clearInterval(retry);
      clearTimeout(giveUp);
    };
  }, [playing, embedUsable]);

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
  // YouTube iframe 은 object-cover 가 없으므로, 원형(≈1:1)→카드(16:9) 모핑 컨테이너를
  // 매 프레임 덮도록 16:9 iframe 크기를 계산해 중앙 정렬·클립한다.
  const AR = 16 / 9;
  const coverW = vw / vh >= AR ? vw : vh * AR;
  const coverH = vw / vh >= AR ? vw / AR : vh;
  const labelOp = cl((expand - 0.3) / 0.6);
  // 확장 마지막 구간(expand 0.7→1)에서 페이드·상승하며 등장하는 레이어드 카드
  const layeredOp = cl((expand - 0.7) / 0.3);
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
  const chipVisibleRef = useRef(false);
  const hoveredEverRef = useRef(false);
  const boxRef = useRef({ hw: 0, hh: 0, cr: 0 });
  // rAF 루프(회전·파동)·칩 타이머가 읽을 최신 스크롤 값 — 렌더 중이 아니라 커밋 직후(페인트 전)에 넘긴다.
  useLayoutEffect(() => {
    targetVelRef.current = targetVelOf(q);
    tiltRef.current = tiltDeg;
    qRef.current = q;
    chipVisibleRef.current = layeredOp > 0.9;
    const vminPx = Math.min(window.innerWidth, window.innerHeight) / 100;
    const gapPx = 1.4 * vminPx;
    boxRef.current = {
      hw: (vw / 2) * vminPx + gapPx,
      hh: (vh / 2) * vminPx + gapPx,
      cr: Math.max(endRadiusPx, (1 - expand) * 0.5 * Math.min(vw, vh) * vminPx) + gapPx,
    };
  });

  useEffect(() => {
    // 모션 줄이기면 연속 회전을 돌리지 않는다(정지 디스크) — DESIGN.md §3 reduced-motion 가드.
    if (!near || reduced) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // 스핀업/다운 관성(이징)
      curVelRef.current +=
        (targetVelRef.current - curVelRef.current) * (1 - Math.pow(0.5, dt * 3.2));
      const v = curVelRef.current;
      const drift = 1 + 0.004 * Math.sin(now * 0.0006);
      angleRef.current = (angleRef.current + v * drift * dt) % 360;
      reflAngleRef.current = (reflAngleRef.current + (14 + v * 0.3) * dt) % 360;
      if (discRef.current)
        discRef.current.style.transform = `rotateX(${tiltRef.current}deg) rotate(${angleRef.current}deg)`;
      if (wedgeRef.current)
        wedgeRef.current.style.transform = `translate(-50%,-50%) rotate(${reflAngleRef.current}deg)`;
      // 고속 시 그루브 모션블러(물리감)
      if (groovesRef.current) {
        const sb = Math.min(3.6, Math.max(0, (v - 180) / 240) * 3.6);
        groovesRef.current.style.filter = sb > 0.06 ? `blur(${sb}px)` : '';
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [near, reduced]);

  // 포스터는 플레이어가 준비된 뒤 재생 컨트롤이 사라질 즈음 걷는다 — 느린 망에서 로딩 화면이 드러나지 않게.
  // 준비 신호를 포기했으면(이미 8초 지남) 바로 걷는다.
  useEffect(() => {
    if (!embedUsable) return;
    const t = setTimeout(() => setPosterFaded(true), playerReady ? 2500 : 0);
    return () => clearTimeout(t);
  }, [embedUsable, playerReady]);

  // 채널 칩 1회 자동 열림 — 칩 첫 등장 후 3초간 호버가 없으면 열고, 열린 뒤 4초 후 닫음(반복 없음).
  // 3초 내 호버한 적 있으면 자동열림 취소 → 호버/타이머 액션 충돌 방지.
  useEffect(() => {
    let openT: ReturnType<typeof setTimeout> | undefined;
    let closeT: ReturnType<typeof setTimeout> | undefined;
    const wait = setInterval(() => {
      if (!chipVisibleRef.current) return;
      clearInterval(wait);
      openT = setTimeout(() => {
        if (hoveredEverRef.current) return;
        setAutoExpanded(true);
        closeT = setTimeout(() => setAutoExpanded(false), 4000);
      }, 3000);
    }, 200);
    return () => {
      clearInterval(wait);
      if (openT) clearTimeout(openT);
      if (closeT) clearTimeout(closeT);
    };
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
              <div
                ref={groovesRef}
                className="absolute inset-0 rounded-full"
                style={{ opacity: decoOp, background: GROOVE_BG }}
              />
              {/* 다크 라벨(파란 UI 원 ❌) — 미세 동심 링 */}
              <div
                className="absolute top-1/2 left-1/2 aspect-square w-[40%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
                style={{
                  opacity: decoOp,
                  background: 'radial-gradient(circle at 38% 34%, #20202a, #101016 72%)',
                }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'conic-gradient(from 0deg, rgba(255,255,255,0.05) 0 9%, transparent 9%)',
                  }}
                />
                <div className="absolute inset-[16%] rounded-full border border-white/10" />
                <div className="absolute inset-[42%] rounded-full border border-white/12" />
              </div>
            </>
          )}
          {decoOp > 0.02 && disc === 'cd' && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                opacity: decoOp,
                background:
                  'conic-gradient(from 0deg, #ff5fa2, #5fb0ff, #5fffc2, #ffe65f, #ff8a5f, #ff5fa2)',
              }}
            />
          )}
          {decoOp > 0.02 && disc === 'orb' && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                opacity: decoOp,
                background:
                  'radial-gradient(circle at 38% 30%, #8fb6ff, #2a4fae 50%, #0a1733 100%)',
              }}
            />
          )}
        </div>

        {/* 회전 소프트 반사 웨지 (screen + blur, 천천히 sweep) */}
        {decoOp > 0.02 && hasReflect && (
          <div
            ref={wedgeRef}
            className="pointer-events-none absolute top-1/2 left-1/2 overflow-hidden rounded-full will-change-transform"
            style={{
              // 가운데 맞춤은 마크업이 책임진다 — 모션 줄이기면 rAF 가 돌지 않아 회전 transform 이 안 들어온다.
              // 값이 렌더마다 같아 React 가 다시 쓰지 않으므로, rAF 가 넣는 회전을 덮지 않는다.
              transform: 'translate(-50%,-50%)',
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
            style={{
              width: `${blackD}vmin`,
              height: `${blackD}vmin`,
              opacity: decoOp,
              background: reflFixed(reflect === 'gloss'),
            }}
            aria-hidden
          />
        )}

        {/* 재생 파동 — 영상 모양(원→카드) 추종 */}
        {!reduced && <WaveRing qRef={qRef} boxRef={boxRef} mode={wave} running={near} />}

        {/* 중앙 영상 — 원형 → 카드 */}
        <div
          className="absolute top-1/2 left-1/2 z-20 overflow-hidden bg-black will-change-transform"
          style={{
            width: `${vw}vmin`,
            height: `${vh}vmin`,
            transform: `translate(calc(-50% + ${tx}vmin), -50%)`,
            borderRadius: `max(${endRadiusPx}px, ${(1 - expand) * 50}%)`,
            boxShadow: expand > 0.05 ? '0 40px 100px -30px rgba(0,0,0,0.75)' : 'none',
          }}
        >
          {playing && (
            <iframe
              ref={iframeRef}
              src={`${YOUTH_VIDEO_EMBED}&enablejsapi=1`}
              title="청년 예배"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
              style={{ width: `${coverW}vmin`, height: `${coverH}vmin` }}
              tabIndex={-1}
              aria-hidden
            />
          )}
          {/* 로드 직후 컨트롤 노출 구간을 가리는 포스터 — 자동재생 안정화 후 페이드아웃 */}
          {/* next/image 지연 로딩 — 첫 로딩에서 빠지고, 브라우저가 화면 근처에서 폭에 맞는 크기로 먼저 받아 임베드보다 앞선다 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-700"
            style={{ opacity: playing && posterFaded ? 0 : 1 }}
          >
            <Photo src={POSTER} alt="" fill sizes="80vmin" className="object-cover" />
          </div>
          <div
            className="absolute right-5 bottom-5 left-5 text-white"
            style={{ opacity: caption ? 0 : labelOp }}
          >
            <div className="b1-mono text-caption tracking-[0.16em] opacity-85">
              ● 청년 예배 · YOUTH WORSHIP
            </div>
            <div className="mt-1 text-[22px] font-bold md:text-[30px]">청년 예배</div>
          </div>
        </div>

        {/* 청년부 유튜브 채널 — 카드 우측하단 모서리에 흰 원형 배지(검은 로고)로 고정.
            호버/자동열림 시 로고는 모서리에 둔 채 라벨이 왼쪽으로 펼쳐져 채널 링크로 이동 */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 z-30"
          style={{
            width: `${vw}vmin`,
            height: `${vh}vmin`,
            transform: `translate(calc(-50% + ${tx}vmin), -50%)`,
            opacity: layeredOp,
          }}
          aria-hidden={layeredOp < 0.5}
        >
          <Link
            href={YOUTH_CHANNEL_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => {
              setHovered(true);
              hoveredEverRef.current = true;
            }}
            onMouseLeave={() => setHovered(false)}
            aria-label="청년부 유튜브 채널"
            className="absolute right-2 -bottom-2 flex items-center rounded-full bg-white p-1.5 text-slate-900 no-underline shadow-[0_12px_34px_-12px_rgba(0,0,0,0.65)]"
            style={{
              transform: `translateY(${(1 - layeredOp) * 14}px)`,
              pointerEvents: layeredOp > 0.5 ? 'auto' : 'none',
            }}
          >
            <span className="relative flex h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white">
              <Photo
                src={allLiveLogo}
                alt="AllLive 올리브워십"
                fill
                sizes="44px"
                className="object-contain"
              />
            </span>
            <span
              className="text-caption flex items-center gap-1.5 overflow-hidden font-semibold tracking-[-0.01em] whitespace-nowrap transition-all duration-500 ease-out"
              style={{
                maxWidth: expanded ? '13rem' : 0,
                opacity: expanded ? 1 : 0,
                marginLeft: expanded ? '0.6rem' : 0,
                marginRight: expanded ? '0.4rem' : 0,
              }}
            >
              청년부 유튜브 채널
              <ArrowUpRight size={15} className="shrink-0" />
            </span>
          </Link>
        </div>

        {/* 에디토리얼 캡션 */}
        {caption && (
          <div
            className="pointer-events-none absolute top-1/2 right-[8vw] z-20 max-w-[36vmin] -translate-y-1/2 text-white"
            style={{ opacity: cl((expand - 0.45) / 0.55) }}
          >
            <div className="b1-mono text-b1-accent2 text-eyebrow font-semibold tracking-[0.18em]">
              YOUTH WORSHIP
            </div>
            <div className="mt-2 text-[28px] font-bold tracking-[-0.02em] md:text-[40px]">
              청년 예배
            </div>
            <div className="text-caption mt-2 text-white/70">
              {YOUTH.schedule} · {YOUTH.place}
            </div>
            <Link
              href={YOUTH_CHANNEL_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caption pointer-events-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#FF0000] px-4 py-2 font-semibold text-white no-underline"
            >
              <YoutubeIcon size={15} /> 청년부 유튜브 채널
            </Link>
          </div>
        )}

        <div
          className="b1-mono text-b1-muted text-eyebrow absolute bottom-6 left-1/2 z-20 -translate-x-1/2 tracking-[0.16em]"
          style={{ opacity: 1 - cl(q / 0.12) }}
        >
          SCROLL
        </div>

        {/* 음소거 토글 — 클릭(제스처)으로만 소리 on/off. 위치/디자인 임시(우하단).
            영상이 붙어 있을 때만 두고, 플레이어가 준비된 뒤(onReady, 또는 8초 대기 포기 뒤)부터 누를 수 있다 —
            준비 전 명령은 유튜브가 버려 «켜짐» 표시만 남는다. */}
        {playing && (
          <button
            type="button"
            onClick={toggleMute}
            disabled={!embedUsable}
            aria-label={muted ? '소리 켜기' : '소리 끄기'}
            className="pointer-events-auto absolute right-6 bottom-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/60 focus-visible:outline-none disabled:opacity-40 disabled:hover:bg-black/40"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        )}
      </div>
    </section>
  );
};
