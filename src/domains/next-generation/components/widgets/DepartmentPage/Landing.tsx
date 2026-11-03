'use client';
// 사진 쇼케이스 «놓기» — 900px 이상. 시안 라운드 4 승격(ADR 0007).
// 의도 한 문장: 이 모션은 사진이 더미에 놓이는 순간을 보여 주기 위해 있다.
//
// 형태: 8장 주기 CYCLE · 행이 앞 행 밑으로 파고드는 음수 top · 위·아래 z 교대 · 정지 기울기 ±1.6~3.4° · 접촉 그늘 ·
//       이음새 pull(도입부 핀 아래 빈 띠를 재서 끌어올림).
// 모션: 장의 60% 가 뷰포트 안에 들어온 순간(IntersectionObserver threshold 0.6, 1회) 공중 자세 → 정지 자세로 «놓인다» — 시야 안에서.
//       공중 = 아래·옆으로 밀려 있고(80px · ±14~22px) 정지 기울기와 같은 부호로 8~11° 더 기울고 1.04 배(가까움) · 떠 있는 큰 그늘.
//       놓임 = 정지 형태 + 접촉 그늘. 사진 opacity 는 건드리지 않는다(종이는 투명해지지 않는다). 되돌리지 않는다(놓인 사진은 놓인 채).
//       시간 1100~1300ms(장마다) · cubic-bezier(0.5, 0, 0.15, 1): 손에서 놓여 천천히 떨어지기 시작해 마지막은 접촉으로 감속.
//       같은 프레임에 여럿 들어오면 90ms 스태거. 전부 transform/opacity.
// 40장: 상한 없음. 8장 주기가 반복될 뿐 — 빨리 넘기면 장들이 공중 자세로 지나가고, 멈추면 보이는 장들이 1초 남짓에 전부 놓인다.
// 899px 이하는 DepartmentPage 가 «부채»(Fan)로 바꿔 끼운다. 아래 모바일 분기는 서버 HTML(하이드레이션 전 첫 그림)용.
// reduced-motion: 전부 놓인 상태(정적 더미).
import Image from 'next/image';
import { useEffect, useRef } from 'react';

import type { Photo } from './types';

const MAXW = 1200;
const GUTTER = 32;
const GAP = 24;

/** 8장 주기 — col: 1440 격자 자리, mcol: 390 자리, ar: 크롭 비율, rot: 정지 기울기(deg), top: 앞 행 밑으로 파고드는 양(px, 390 은 0.35배), z: 더미 순서(킵)
 *  drot: 공중에서 더 기운 양(deg, 부호 = rot 과 같음), dx: 공중 가로 밀림(px, 부호 = 기울어진 쪽), ms: 놓이는 시간 */
const CYCLE = [
  { col: '1 / 11', mcol: '1 / 13', ar: '21 / 9', rot: -1.6, pos: 'center 40%', top: 0, z: 2, drot: -8, dx: -16, ms: 1200 },
  { col: '1 / 6', mcol: '1 / 11', ar: '1 / 1', rot: -2.8, pos: 'center 40%', top: -150, z: 1, drot: -10, dx: -22, ms: 1280 },
  { col: '7 / 13', mcol: '3 / 13', ar: '4 / 3', rot: 2.4, pos: 'center 50%', top: -60, z: 3, drot: 9, dx: 18, ms: 1120 },
  { col: '3 / 12', mcol: '1 / 13', ar: '3 / 2', rot: 1.2, pos: 'center 40%', top: -90, z: 2, drot: 8, dx: 14, ms: 1240 },
  { col: '1 / 5', mcol: '1 / 10', ar: '3 / 4', rot: -3.4, pos: 'center 25%', top: -140, z: 4, drot: -11, dx: -22, ms: 1100 },
  { col: '5 / 13', mcol: '2 / 13', ar: '16 / 10', rot: 0.8, pos: 'center 35%', top: 20, z: 1, drot: 8, dx: 14, ms: 1300 },
  { col: '2 / 9', mcol: '1 / 12', ar: '4 / 3', rot: -1.4, pos: 'center 45%', top: -70, z: 3, drot: -9, dx: -18, ms: 1160 },
  { col: '9 / 13', mcol: '3 / 13', ar: '4 / 5', rot: 3.2, pos: 'center 30%', top: 60, z: 2, drot: 10, dx: 20, ms: 1220 },
] as const;

const spanOf = (col: string) => {
  const [a, b] = col.split('/').map((s) => Number(s.trim()));
  return b - a;
};

/** 놓이는 조건: 장의 이 비율이 뷰포트 안에 들어오면 놓인다 — 놓이는 순간이 시야 안에서 일어난다 */
const LAND_VISIBLE = 0.6;
/** 손에서 놓인 종이: 천천히 떨어지기 시작해 접촉에서 감속 */
const LAND_EASE = 'cubic-bezier(0.5, 0, 0.15, 1)';
/** 같은 프레임에 여럿 들어올 때(초기 진입·빠른 넘김) 순서대로 놓이는 간격 */
const STAGGER_MS = 90;
/** 이음새: 핀 아래 빈 띠에서 남겨 둘 숨 · 끌어올림 상한 */
const SEAM_KEEP = 56;
const SEAM_MAX = 220;
/* 도입부 카드의 최종 크기(Intro 의 CARD 상수: 카드 = 컨테이너 46%) — 읽기 전용 복제 */
const INTRO_CARD = 0.46;

export default function Landing({ photos }: { photos: Photo[] }) {
  const flowRef = useRef<HTMLDivElement>(null);
  const door = photos[0];
  const flow = photos.slice(1);

  useEffect(() => {
    const el = flowRef.current;
    if (!el) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let io: IntersectionObserver | null = null;

    /* 이음새 재기(킵): 도입부 핀이 100svh 가운데 둔 정보 열·카드 아래 남는 빈 띠. 둘 중 낮은 쪽 아래의 띠만큼 끌어올린다 */
    const seam = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw < 900) {
        el.style.setProperty('--ld-pull', '0px');
        return;
      }
      const stage = el.parentElement?.previousElementSibling as HTMLElement | null;
      const pin = stage?.firstElementChild as HTMLElement | null;
      const info = pin?.lastElementChild as HTMLElement | null;
      if (!pin || !info) return;
      const pinTop = pin.getBoundingClientRect().top;
      let infoBottom = 0;
      for (const child of Array.from(info.children)) {
        infoBottom = Math.max(infoBottom, child.getBoundingClientRect().bottom - pinTop + 36);
      }
      const w0 = Math.min(vw, door?.src.width ?? vw);
      const h0 = Math.min(vh, door?.src.height ?? vh);
      const cw = Math.min(vw - GUTTER * 2, MAXW);
      const cardBottom = (vh + h0 * ((cw * INTRO_CARD) / w0)) / 2;
      const band = vh - Math.max(infoBottom, cardBottom);
      const pull = Math.max(0, Math.min(SEAM_MAX, band - SEAM_KEEP));
      el.style.setProperty('--ld-pull', `${Math.round(pull)}px`);
    };

    const items = Array.from(el.querySelectorAll<HTMLElement>('.ld-item'));

    /* 놓기: 선을 넘은 장을 위에서부터 순서대로 놓는다. 한 번 놓이면 끝 — 관찰도 그만둔다 */
    const land = (entries: IntersectionObserverEntry[]) => {
      const fresh = entries.filter((e) => (e.target as HTMLElement).dataset.landed !== 'true');
      /* 이미 지나간 장(스크롤 복원·뒤로 가기): 공연 없이 놓인 채로 둔다 */
      for (const e of fresh) {
        if (!e.isIntersecting && e.boundingClientRect.bottom < 0) {
          const n = e.target as HTMLElement;
          n.style.transition = 'none';
          n.dataset.landed = 'true';
          io?.unobserve(n);
        }
      }
      const batch = fresh
        .filter((e) => e.isIntersecting && (e.target as HTMLElement).dataset.landed !== 'true')
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      batch.forEach((e, i) => {
        const n = e.target as HTMLElement;
        n.style.setProperty('--ld-delay', `${i * STAGGER_MS}ms`);
        n.style.willChange = 'transform'; // 놓이는 동안만 — 40장 전부에 걸지 않는다
        n.addEventListener('transitionend', () => n.style.removeProperty('will-change'), { once: true });
        n.dataset.landed = 'true';
        io?.unobserve(n);
      });
    };

    const apply = () => {
      io?.disconnect();
      io = null;
      seam();
      if (mq.matches) {
        el.dataset.reduced = 'true';
        items.forEach((n) => (n.dataset.landed = 'true'));
        return;
      }
      delete el.dataset.reduced;
      io = new IntersectionObserver(land, { threshold: LAND_VISIBLE });
      items.forEach((n) => {
        if (n.dataset.landed !== 'true') io?.observe(n);
      });
    };

    apply();
    mq.addEventListener('change', apply);
    window.addEventListener('resize', seam);
    return () => {
      mq.removeEventListener('change', apply);
      window.removeEventListener('resize', seam);
      io?.disconnect();
    };
  }, [door, flow.length]);

  return (
    <>
      <style>{`
        .ld-flow {
          --ld-pull: 0px; --ld-mt: 1; --ld-r: 18px;
          --ld-air-y: 80px; --ld-air-x: 1; --ld-air-k: 1;
          position: relative; max-width: ${MAXW}px; margin: calc(var(--ld-pull) * -1) auto 0;
          padding: 0 ${GUTTER}px 96px;
          display: grid; grid-template-columns: repeat(12, minmax(0, 1fr));
          column-gap: ${GAP}px; row-gap: 32px; align-items: start;
        }
        .ld-item {
          --ld-delay: 0ms;
          position: relative; z-index: var(--ld-z); grid-column: var(--ld-col); margin-top: calc(var(--ld-top) * var(--ld-mt));
          aspect-ratio: var(--ld-ar); border-radius: var(--ld-r);
          /* 가라앉은 종이의 접촉 그늘(정적, 킵) */
          box-shadow: 0 1px 2px color-mix(in srgb, var(--color-b1-text) 8%, transparent),
                      0 10px 24px -10px color-mix(in srgb, var(--color-b1-text) 18%, transparent);
          transform-origin: 50% 50%;
          /* 공중 자세 — 아직 손에 있다 */
          transform: translate3d(calc(var(--ld-dx) * var(--ld-air-x)), var(--ld-air-y), 0)
                     rotate(calc(var(--ld-rot) + var(--ld-drot) * var(--ld-air-k)))
                     scale(1.04);
          transition: transform var(--ld-ms) ${LAND_EASE} var(--ld-delay);
        }
        /* 놓임 — 킵 형태 */
        .ld-item[data-landed='true'] { transform: rotate(var(--ld-rot)); }
        .ld-item::after {
          content: ''; position: absolute; inset: 0; z-index: 2; border-radius: inherit; pointer-events: none;
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-b1-text) 10%, transparent);
        }
        /* 떠 있는 종이의 그늘 — 놓이면서 접촉 그늘 밑으로 사라진다 */
        .ld-air {
          position: absolute; inset: 0; z-index: 0; border-radius: inherit; pointer-events: none;
          box-shadow: 0 44px 76px -18px color-mix(in srgb, var(--color-b1-text) 40%, transparent);
          opacity: 1;
          transition: opacity var(--ld-ms) ${LAND_EASE} var(--ld-delay);
        }
        .ld-item[data-landed='true'] .ld-air { opacity: 0; }
        .ld-img { position: absolute; inset: 0; z-index: 1; border-radius: inherit; overflow: hidden; }

        @media (max-width: 899px) {
          .ld-flow {
            --ld-mt: 0.35; --ld-r: 14px; --ld-air-y: 44px; --ld-air-x: 0.55; --ld-air-k: 0.6;
            margin-top: 0; padding: 8px 20px 56px; column-gap: 12px; row-gap: 20px;
          }
          .ld-item { grid-column: var(--ld-mcol); }
        }

        /* reduced: 전부 놓인 상태 */
        .ld-flow[data-reduced='true'] .ld-item { transform: rotate(var(--ld-rot)); transition: none; }
        .ld-flow[data-reduced='true'] .ld-air { opacity: 0; transition: none; }
        @media (prefers-reduced-motion: reduce) {
          .ld-item { transform: rotate(var(--ld-rot)); transition: none; }
          .ld-air { opacity: 0; transition: none; }
        }
      `}</style>

      {flow.length > 0 ? (
        <div ref={flowRef} className="ld-flow">
          {flow.map((p, i) => {
            const c = CYCLE[i % CYCLE.length];
            const span = spanOf(c.col);
            const w = Math.round((MAXW - GUTTER * 2 - GAP * 11) * (span / 12) + GAP * (span - 1));
            return (
              <div
                key={p.id}
                className="ld-item bg-b1-placeholder"
                style={
                  {
                    '--ld-col': c.col,
                    '--ld-mcol': c.mcol,
                    '--ld-ar': c.ar,
                    '--ld-rot': `${c.rot}deg`,
                    '--ld-drot': `${c.drot}deg`,
                    '--ld-dx': `${c.dx}px`,
                    '--ld-ms': `${c.ms}ms`,
                    '--ld-top': `${c.top}px`,
                    '--ld-z': c.z,
                  } as React.CSSProperties
                }
              >
                <span className="ld-air" aria-hidden="true" />
                <div className="ld-img">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    quality={90}
                    sizes={`(max-width: 899px) 100vw, ${w}px`}
                    className="object-cover"
                    style={{ objectPosition: c.pos }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
