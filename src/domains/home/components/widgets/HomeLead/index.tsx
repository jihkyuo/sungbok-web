/**
 * HomeLead — 히어로 → 사진 띠 → 표어 → 담임 (시안 P 승격, 2026-10-19). HomeHero 를 안에 품는다.
 *
 * 170svh 트랙 + 100svh sticky 무대. 무대에는 상단 왼쪽 표어(정적)와 항상 흐르는 세 줄 사진 띠(아래로 갈수록 얇아지고,
 * 줄마다 방향·속도·위상을 달리해 세로 정렬을 피함)가 깔려 있고,
 * 첫 화면에서는 전체화면 히어로(MorphFrame)가 그 위를 덮고 있다. 스크롤하면 히어로가 줄어들며 윗줄의 빈 칸에
 * 전경 사진 그대로 내려앉고(사진 교체 없음), 안착 순간 실제 타일에 핸드오프한 뒤 핀이 풀려 PastorStatic 으로 이어진다.
 *
 * 역스크롤 보정: 윗줄 표시 오프셋 = 자유 흐름 + (1-q)·(화면 중앙까지 최단 거리). 히어로가 전체화면이면 빈 칸이 중앙에
 * 대기하고, 올라올 땐 카드가 어디까지 떠내려갔든 중앙으로 되감겨 히어로가 그 위에서 커진다(화면 밖에서 튀지 않음).
 * 시계는 무대가 화면에 있을 때만 돈다. 프레임당 레이아웃 읽기는 트랙 rect 1회(칸 기하는 리사이즈 때만 측정).
 * reduced-motion: 띠 자율 흐름만 정지(정지 띠), 스크롤 연동은 유지. 셋째 줄은 모바일(<768px)에서 숨김(표어가 길게 꺾여 100svh 초과).
 *
 * 표어 카피는 placeholder — 사무국 검수 필요.
 */
'use client';

import Image from 'next/image';
import { Fragment, useEffect, useRef } from 'react';

import mainExterior from '@/assets/images/main/main01.jpg';

import { FLOW_PHOTOS, THIRD_PHOTOS } from './flowPhotos';
import { EXT_G, MorphFrame, type MorphFrameHandle } from './MorphFrame';
import { fullRect, mixRect, seg, shortest, smooth, wrap } from './morphMath';
import { PastorStatic } from './PastorStatic';

/** 줄별 높이(svh 비율)·흐름 방향·속도(px/s)·시작 오프셋(한 벌 너비 비율, 윗줄은 착지 칸 중앙이 우선). 간격·모서리(px), 가장자리 페이드(%), 히어로가 내려앉는 윗줄 칸 */
const ROWS = [
  { h: 0.18, dir: -1, speed: 30, offset: 0 },
  { h: 0.16, dir: 1, speed: 24, offset: 0.37 },
  { h: 0.14, dir: -1, speed: 36, offset: 0.71 },
];
const GAP = 14;
const RADIUS = 16;
const EDGE = 6;
const HERO_AT = 2;
const ASPECT = 1.6;
/** 트랙당 벌 수 — 끊김 없는 조건은 (벌 수 - 1) × 한 벌 폭 ≥ 뷰포트 폭. 얇은 셋째 줄은 21:9·낮은 창에서 2벌로 모자람 */
const COPIES = 3;

const CSS = `
  .hl-hero .hl-land{opacity:0}
  .is-landed .hl-hero .hl-land{opacity:1}
`;

type Tile = { src?: (typeof FLOW_PHOTOS)[number]; hero?: boolean };
const TOP: Tile[] = [
  ...FLOW_PHOTOS.slice(0, HERO_AT).map((src): Tile => ({ src })),
  { hero: true },
  ...FLOW_PHOTOS.slice(HERO_AT).map((src): Tile => ({ src })),
];
const BOTTOM: Tile[] = [...FLOW_PHOTOS.slice(5), ...FLOW_PHOTOS.slice(0, 5)].map(src => ({ src }));
const THIRD: Tile[] = THIRD_PHOTOS.map(src => ({ src }));
const TILES = [TOP, BOTTOM, THIRD];
const MASK = `linear-gradient(to right, transparent, #000 ${EDGE}%, #000 ${100 - EDGE}%, transparent)`;

export const HomeLead = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frame = useRef<MorphFrameHandle>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rows = Array.from(stage.querySelectorAll<HTMLElement>('.hl-row'));
    const tracks = rows.map(r => r.querySelector<HTMLElement>('.hl-track')!);
    const slot = rows[0].querySelector<HTMLElement>('.hl-hero')!;
    let period = rows.map(() => 0);
    let slotLeft = 0;
    let slotW = 0;
    let slotTop = 0;
    let slotH = 0;
    let centerOff = 0;
    const measure = () => {
      period = rows.map(r => r.querySelector<HTMLElement>('.hl-copy')!.offsetWidth);
      slotLeft = slot.offsetLeft;
      slotW = slot.offsetWidth;
      slotH = slot.offsetHeight;
      slotTop = rows[0].getBoundingClientRect().top - stage.getBoundingClientRect().top;
      centerOff = wrap(slotLeft + slotW / 2 - window.innerWidth / 2, period[0]);
    };
    measure();
    // 줄마다 시작 오프셋을 어긋나게(세로 정렬 회피). 윗줄은 착지 칸 중앙.
    const flow = ROWS.map((r, i) => (i === 0 ? centerOff : period[i] * r.offset));

    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const r = track.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = seg(-r.top / Math.max(1, track.offsetHeight - vh), [0, 1]);
      const q = smooth(seg(p, [0.05, 0.8]));
      for (let i = 0; i < rows.length; i++) {
        if (!period[i]) continue; // 숨겨진 줄(모바일)
        const v = reduce ? 0 : ROWS[i].speed;
        flow[i] = wrap(flow[i] - ROWS[i].dir * v * dt, period[i]);
      }
      if (q === 0) flow[0] = centerOff;
      const display0 = flow[0] + (1 - q) * shortest(flow[0], centerOff, period[0]);
      tracks[0].style.transform = `translate3d(${(-display0).toFixed(2)}px,0,0)`;
      for (let i = 1; i < rows.length; i++) {
        tracks[i].style.transform = `translate3d(${(-flow[i]).toFixed(2)}px,0,0)`;
      }

      // 안착 목표 — 여러 벌의 빈 칸 중 화면 중앙에 가까운 것
      const cx0 = slotLeft + slotW / 2 - display0;
      let cx = cx0;
      for (let k = 1; k < COPIES; k++) {
        const c = cx0 + k * period[0];
        if (Math.abs(c - vw / 2) < Math.abs(cx - vw / 2)) cx = c;
      }
      const target = { w: slotW, h: slotH, cx, cy: slotTop + slotH / 2 };
      const landed = q >= 1;
      frame.current?.update({
        rect: mixRect(fullRect(vw, vh), target, q),
        q,
        f1: seg(p, [0.05, 0.3]),
        copy: 1 - seg(p, [0.04, 0.12]),
        visible: !landed,
      });
      stage.classList.toggle('is-landed', landed);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const row = (items: Tile[], i: number) => {
    const h = ROWS[i].h;
    // 셋째 줄은 모바일 숨김 — 줄과 앞 간격을 함께 숨긴다
    const hide = i === 2 ? 'max-md:hidden' : '';
    const copy = (k: number) => (
      <div key={k} className="hl-copy flex shrink-0" style={{ gap: GAP, paddingRight: GAP }}>
        {items.map((it, j) => (
          <div
            key={j}
            className={`relative shrink-0 overflow-hidden ${it.hero ? 'hl-hero' : ''}`}
            style={{
              height: `${h * 100}svh`,
              width: `calc(${h * 100}svh * ${ASPECT})`,
              borderRadius: RADIUS,
            }}
          >
            {it.hero ? (
              <div
                className="hl-land absolute inset-y-0 right-0"
                style={{ left: `${-EXT_G * 100}%` }}
              >
                <Image
                  src={mainExterior}
                  alt="성복교회 전경"
                  fill
                  sizes="60vw"
                  className="object-cover object-[55%_50%]"
                />
              </div>
            ) : (
              it.src && <Image src={it.src} alt="" fill sizes="40vw" className="object-cover" />
            )}
          </div>
        ))}
      </div>
    );
    return (
      <Fragment key={i}>
        {i > 0 && <div className={hide} style={{ height: GAP }} />}
        <div
          aria-hidden
          className={`hl-row w-full overflow-hidden ${hide}`}
          style={{ WebkitMaskImage: MASK, maskImage: MASK }}
        >
          <div className="hl-track flex w-max will-change-transform">
            {Array.from({ length: COPIES }, (_, k) => copy(k))}
          </div>
        </div>
      </Fragment>
    );
  };

  return (
    <>
      <div ref={trackRef} className="bg-b1-bg relative h-[170svh]">
        <style>{CSS}</style>
        <div
          ref={stageRef}
          className="sticky top-0 flex h-[100svh] w-full flex-col justify-center overflow-hidden pt-16"
        >
          {/* 표어 — 정적. 히어로가 걷히며 드러난다. 무대 pt-16 = 헤더 높이(낮은 뷰포트에서 세 줄이 헤더 밑으로 밀리지 않게) */}
          <div className="mx-auto w-full max-w-[1320px] px-[6vw] pb-[4vh]">
            <span className="text-b1-sub inline-flex items-center gap-2 text-[14px] font-semibold">
              <span className="bg-b1-accent block h-1.5 w-1.5 rounded-full" />
              2026년 표어
            </span>
            <h2 className="text-b1-text mt-3 text-[clamp(34px,5vw,76px)] leading-[1.08] font-extrabold tracking-[-0.04em] text-balance">
              새 사람을 입고
              <br />
              <span className="text-b1-accent">묵은 땅</span>을 기경하라
            </h2>
            <p className="b1-mono text-b1-sub mt-4 text-[14px]">에베소서 4:22–24 · 호세아 10:12</p>
          </div>
          {TILES.map(row)}
          {/* 히어로 — 전체화면에서 윗줄 빈 칸으로 변형 */}
          <MorphFrame ref={frame} className="absolute inset-0 z-10" radius={RADIUS} />
        </div>
      </div>
      <PastorStatic />
    </>
  );
};
