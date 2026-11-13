'use client';
// 도입부 — 시안 라운드 1 «들어서기»의 도입부를 사용자 확정(2026-11-02) 그대로 가져온 것(ADR 0007).
// 1440: 전폭 사진(100svh 핀)이 스크롤로 왼쪽 카드로 물러나고 오른쪽에 사실줄→소개→담당→안내 한 줄이 떠오른다.
// 390: 사진이 뒤에 서 있고 흰 시트가 그 위로 올라오며 정보를 싣는다.
// children(사진 쇼케이스)은 시트 안, 정보 아래에 렌더된다. 스크럽은 scroll + rAF(Lenis 가 움직인 실제 스크롤 값).
import { Photo as SizedPhoto } from '@/shared/components/features/Photo';
import { useLayoutEffect, useRef, type ReactNode } from 'react';

import type { Department, Photo } from './types';

const MAXW = 1200;
const GUTTER = 32;
const CARD = 0.46;
const GAP = 64;
/** 고정 헤더(DockNav) 높이 — 휴대폰에서 사진을 그 아래에 세운다 */
const HEADER_H = 64;
/** 휴대폰에서 시트가 처음 보이는 최소 높이(화면 비율) */
const MIN_PEEK = 0.14;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** p 가 [a,b] 를 지나는 동안 0→1 (smoothstep) */
const seg = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export interface IntroProps {
  dept: Department;
  /** 들어서는 한 장(관례: photos[0]) */
  door: Photo | undefined;
  /** 도입부 아래에 이어지는 사진 쇼케이스 */
  children?: ReactNode;
}

export default function Intro({ dept, door, children }: IntroProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  /* 스크럽: scroll 이벤트 + rAF. 자체 보간 없음 — Lenis 가 움직인 실제 스크롤 값을 그대로 읽는다(관성 한 겹)
     첫 사진 정책: 자기 픽셀보다 커지지 않는다 — 상자 = min(뷰포트, 원본 크기). 고해상은 전폭, 저해상은 원본 크기로 선다 */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const pin = pinRef.current;
    if (!stage || !pin) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;

    const measure = () => {
      const vw = document.documentElement.clientWidth; // 스크롤바 제외 폭 — CSS 의 calc(100vw - var(--sbw)) 와 맞춘다
      const vh = window.innerHeight;
      const mobile = vw < 900;
      const w0 = Math.min(vw, door?.src.width ?? vw);
      // 휴대폰·세로 화면: 화면 높이로 꽉 채우면(cover) 가로 사진의 양옆이 크게 잘린다(사용자 지적 2026-11-06).
      // 사진 비율 그대로 헤더 아래에 통째로 세우고, 시트는 사진 바로 아래에서 올라오게 한다(--en-peek).
      const ratio = door ? door.src.height / door.src.width : vh / vw;
      const h0 = mobile
        ? Math.min(vh - HEADER_H - vh * MIN_PEEK, Math.round(w0 * ratio))
        : Math.min(vh, door?.src.height ?? vh);
      const x0 = (vw - w0) / 2;
      // 데스크톱: 가운데 두되 독(64px) 아래까지만 — 머리 바로 아래에서 바로 들어선다
      const y0 = mobile ? HEADER_H : Math.min((vh - h0) / 2, 64);
      const root = stage.closest<HTMLElement>('.en-root');
      // svh 기준으로 둔다 — 휴대폰 주소창이 접히며 innerHeight 가 바뀌어도 시트 위치(무대 높이)가 흔들리지 않게
      if (mobile) root?.style.setProperty('--en-peek', `calc(100svh - ${y0 + h0}px)`);
      else root?.style.removeProperty('--en-peek');
      const cw = Math.min(vw - GUTTER * 2, MAXW);
      const s = (cw * CARD) / w0;
      const set = (k: string, v: string) => stage.style.setProperty(k, v);
      set('--en-x0', `${x0}px`);
      set('--en-y0', `${y0}px`);
      set('--en-w0', `${w0}px`);
      set('--en-h0', `${h0}px`);
      set('--en-cw', `${cw}px`);
      set('--en-cl', `${(vw - cw) / 2}px`);
      set('--en-s', String(s));
      set('--en-tx', `${(vw - cw) / 2 - x0}px`);
      set('--en-ty', `${(vh - h0 * s) / 2 - y0}px`);
    };
    const update = () => {
      raf = 0;
      const run = stage.offsetHeight - pin.offsetHeight;
      const top = stage.getBoundingClientRect().top;
      const p = run > 0 ? clamp01(-top / run) : 1;
      stage.style.setProperty('--en-e', String(seg(p, 0.04, 0.6)));
      stage.style.setProperty('--en-i1', String(seg(p, 0.36, 0.64)));
      stage.style.setProperty('--en-i2', String(seg(p, 0.44, 0.72)));
      stage.style.setProperty('--en-i3', String(seg(p, 0.52, 0.8)));
      stage.style.setProperty('--en-i4', String(seg(p, 0.6, 0.88)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    const apply = () => {
      if (mq.matches) {
        stage.dataset.reduced = 'true';
        measure();
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        window.addEventListener('resize', measure);
        return;
      }
      window.removeEventListener('resize', measure);
      delete stage.dataset.reduced;
      measure();
      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => {
      mq.removeEventListener('change', apply);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('resize', measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [door]);

  const info = (variant: 'desk' | 'mob') => (
    <div className={`en-info en-info--${variant}`}>
      <p className="en-facts text-b1-text">
        <span>
          {dept.worship.day} {dept.worship.time}
        </span>
        <span>{dept.worship.place}</span>
        <span>{dept.ages}</span>
      </p>
      <p className="en-intro text-b1-text">{dept.intro}</p>
      <ul className="en-staff border-b1-border">
        {dept.staff.map(s => (
          <li key={s.name} className="en-staff-row">
            <span className="en-staff-photo bg-b1-placeholder">
              <SizedPhoto
                src={s.photo}
                alt={`${s.name} ${s.role}`}
                fill
                sizes="56px"
                className="object-cover"
              />
            </span>
            <span className="en-staff-text">
              <span className="en-staff-name text-b1-text">
                {s.name}
                <span className="en-staff-role text-b1-accent">{s.role}</span>
              </span>
              {s.greeting ? (
                <span className="en-staff-greeting text-b1-sub">{s.greeting}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      <div className="en-extra border-b1-border">
        <p className="text-b1-text">{dept.extra}</p>
        <p className="en-extra-note text-b1-sub">부서에서 취합한 뒤 이 자리에 적습니다.</p>
      </div>
    </div>
  );

  return (
    <section className="en-root">
      <style>{`
        .en-root { --en-ease: cubic-bezier(0.23, 1, 0.32, 1); }
        .en-stage {
          --en-e: 0; --en-i1: 0; --en-i2: 0; --en-i3: 0; --en-i4: 0;
          --en-s: 0.4; --en-tx: 0px; --en-ty: 0px; --en-cw: 1200px;
          --en-x0: 0px; --en-y0: 0px; --en-w0: 100%; --en-h0: 100%; --en-cl: 0px;
          position: relative; width: calc(100vw - var(--sbw, 0px)); margin-left: calc(50% - (50vw - var(--sbw, 0px) / 2)); height: 240svh;
        }
        .en-pin { position: sticky; top: 0; height: 100svh; }
        .en-photo {
          position: absolute; left: var(--en-x0); top: var(--en-y0); width: var(--en-w0); height: var(--en-h0);
          overflow: hidden; border-radius: 44px;
          transform-origin: 0 0; will-change: transform;
          transform: translate(calc(var(--en-tx) * var(--en-e)), calc(var(--en-ty) * var(--en-e)))
                     scale(calc(1 + (var(--en-s) - 1) * var(--en-e)));
        }
        .en-photo-img { position: absolute; inset: 0; animation: en-open 1.2s var(--en-ease) both; }
        .en-photo::after {
          content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-b1-text) 12%, transparent);
        }
        .en-scrim {
          position: absolute; inset: 0;
          background: linear-gradient(to top, color-mix(in srgb, var(--color-b1-text) 44%, transparent), transparent 46%);
          opacity: calc(1 - var(--en-e));
        }
        .en-label {
          position: absolute; left: clamp(20px, 4vw, 56px); bottom: clamp(20px, 4vw, 48px);
          color: var(--color-b1-surface); font-size: clamp(17px, 1.6vw, 22px); font-weight: 500; letter-spacing: -0.01em;
          opacity: calc(1 - var(--en-e));
        }
        .en-label > span { display: inline-block; animation: en-blur 1.1s var(--en-ease) 0.25s both; }
        .en-info { display: flex; flex-direction: column; }
        .en-info--desk {
          position: absolute; top: 0; bottom: 0;
          left: calc(var(--en-cl) + var(--en-cw) * ${CARD} + ${GAP}px);
          width: calc(var(--en-cw) * ${1 - CARD} - ${GAP}px);
          justify-content: center; padding-block: 24px;
        }
        .en-info--desk > * { opacity: var(--en-k); transform: translateY(calc((1 - var(--en-k)) * 36px)); }
        .en-info--desk > :nth-child(1) { --en-k: var(--en-i1); }
        .en-info--desk > :nth-child(2) { --en-k: var(--en-i2); }
        .en-info--desk > :nth-child(3) { --en-k: var(--en-i3); }
        .en-info--desk > :nth-child(4) { --en-k: var(--en-i4); }
        .en-info--mob { display: none; }

        .en-facts { display: flex; flex-wrap: wrap; row-gap: 6px; font-size: 22px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.3; }
        .en-facts > span + span { margin-left: 16px; padding-left: 16px; border-left: 1px solid var(--color-b1-border); }
        .en-intro { margin-top: 28px; font-size: 17px; line-height: 1.75; max-width: 34em; }
        .en-staff { margin-top: 32px; padding-top: 24px; border-top: 1px solid; display: flex; flex-direction: column; gap: 18px; }
        .en-staff-row { display: flex; gap: 16px; align-items: flex-start; }
        .en-staff-photo { position: relative; flex: none; width: 56px; aspect-ratio: 4 / 5; border-radius: 12px; overflow: hidden; }
        .en-staff-text { display: flex; flex-direction: column; gap: 4px; padding-top: 2px; }
        .en-staff-name { font-size: 16px; font-weight: 600; letter-spacing: -0.01em; }
        .en-staff-role { margin-left: 8px; font-size: 14px; font-weight: 500; }
        .en-staff-greeting { font-size: 15px; line-height: 1.65; }
        .en-extra { margin-top: 24px; padding-top: 20px; border-top: 1px solid; font-size: 15px; line-height: 1.65; }
        .en-extra-note { margin-top: 4px; font-size: 14px; }

        .en-sheet { position: relative; width: calc(100vw - var(--sbw, 0px)); margin-left: calc(50% - (50vw - var(--sbw, 0px) / 2)); }

        @keyframes en-open { from { opacity: 0; transform: scale(1.06); } to { opacity: 1; transform: none; } }
        @keyframes en-blur { from { opacity: 0; filter: blur(12px); transform: translateY(10px); } to { opacity: 1; filter: blur(0); transform: none; } }

        @media (max-height: 760px) {
          .en-facts { font-size: 19px; }
          .en-intro { margin-top: 18px; font-size: 15px; line-height: 1.65; }
          .en-staff { margin-top: 20px; padding-top: 16px; gap: 12px; }
          .en-extra { margin-top: 16px; padding-top: 14px; font-size: 14px; }
        }

        /* 390: 사진은 뒤에 서 있고 흰 시트가 올라온다 */
        @media (max-width: 899px) {
          .en-root { --en-peek: 14svh; }
          .en-stage { height: calc(200svh - var(--en-peek)); }
          .en-photo { border-radius: 0; transform: scale(calc(1 - 0.06 * var(--en-e))); opacity: calc(1 - 0.55 * var(--en-e)); transform-origin: 50% 40%; }
          .en-info--desk { display: none; }
          .en-info--mob { display: flex; }
          .en-sheet {
            /* 시트 윗변 = 무대 시작 + (100svh - peek) = 사진 바로 아래. 무대 높이가 200svh - peek 이므로 화면 한 장만큼만 당긴다.
               (+peek 를 더하면 시트가 늘 화면 한 장 아래에서 시작해, 낮은 사진 밑이 통째로 비었다) */
            margin-top: -100svh; background: var(--color-b1-bg);
            border-radius: 28px 28px 0 0; padding-top: 28px;
            box-shadow: 0 -12px 40px color-mix(in srgb, var(--color-b1-text) 10%, transparent);
          }
          .en-info--mob { padding: 0 20px 36px; }
          .en-facts { display: grid; row-gap: 4px; font-size: 20px; }
          .en-facts > span + span { margin-left: 0; padding-left: 0; border-left: 0; }
          .en-intro { margin-top: 22px; font-size: 16px; line-height: 1.7; }
        }

        @media (prefers-reduced-motion: reduce) {
          .en-photo-img, .en-label > span { animation: none; }
        }
        /* reduced: 핀을 풀고 정적 흐름 — 사진 → 정보 → (children) */
        .en-stage[data-reduced='true'] { height: auto; }
        .en-stage[data-reduced='true'] .en-pin { position: static; height: auto; }
        .en-stage[data-reduced='true'] .en-photo {
          position: relative; left: auto; top: auto; margin: 0 auto; max-width: 100%;
          transform: none; opacity: 1; will-change: auto;
        }
        .en-stage[data-reduced='true'] .en-scrim, .en-stage[data-reduced='true'] .en-label { opacity: 1; }
        .en-stage[data-reduced='true'] .en-info--desk {
          position: static; width: auto; max-width: 720px; margin: 56px auto 0; padding: 0 ${GUTTER}px;
        }
        .en-stage[data-reduced='true'] .en-info--desk > * { opacity: 1; transform: none; }
        .en-root:has(.en-stage[data-reduced='true']) .en-sheet { margin-top: 0; padding-top: 72px; box-shadow: none; }
      `}</style>

      <div ref={stageRef} className="en-stage">
        <div ref={pinRef} className="en-pin">
          <div className="en-photo bg-b1-placeholder">
            {door ? (
              <div className="en-photo-img">
                <SizedPhoto
                  src={door.src}
                  alt={door.alt}
                  fill
                  preload
                  // 휴대폰은 사진을 비율대로 폭에 맞춰 세운다(100vw). PC 는 화면 높이로 채우므로(cover) 높이 × 비율만큼 큰 원본이 필요하다.
                  sizes={`(max-width: 899px) 100vw, max(100vw, ${Math.round((door.src.width / door.src.height) * 100)}vh)`}
                  className="object-cover"
                  style={{ objectPosition: 'center 40%' }}
                />
              </div>
            ) : null}
            <div className="en-scrim" aria-hidden="true" />
            <p className="en-label">
              <span>{dept.tagline}</span>
            </p>
          </div>
          {info('desk')}
        </div>
      </div>

      <div className="en-sheet">
        {info('mob')}
        {children}
      </div>
    </section>
  );
}
