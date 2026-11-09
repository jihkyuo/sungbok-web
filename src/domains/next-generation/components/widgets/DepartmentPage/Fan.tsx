'use client';
// 사진 쇼케이스 «부채» — 899px 이하. 시안 라운드 3 «부채 v1»(2026-11-04 00:45 착지본) 승격(ADR 0007).
//
// 빽빽이 포개진 사진 더미가 뷰포트를 지나는 자리에서만 부채처럼 벌어지고, 지나가면 다시 포개진다.
// 모든 사진의 위치는 커서 c 하나의 함수다: top_i = T + (i − c)·C + (E − C)·F(i − c).
//   C = 포갠 간격(윗변 띠만 보인다) · E = 펼친 간격(= 사진 높이) · F = cos² 종 모양 창(반경 R장)의 적분.
//   커서에서 멀면 간격이 C(더미), 가까우면 E(펼침). 커서 근처 사진은 왼쪽 바깥 축을 중심으로 살짝 기운다(부채살).
// 에피소드가 없다 — 커서가 더미를 위에서 아래로 한 번 훑고 지나갈 뿐이고, 사진 전부가 같은 식 위에 있다.
// 스크롤 구동: scroll 이벤트 + rAF, 커서 하나만 계산해 카드마다 transform 을 쓴다(Lenis 보간 한 겹).
// 900px 이상은 DepartmentPage 가 «놓기»(Landing)로 바꿔 끼우므로 이 파일에는 모바일 값만 있다.
import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';

import type { Photo } from './types';

const R = 2; // 펼침 창 반경(장). 커서 ±R 바깥은 완전히 포개진다
const TILT = 5; // 기울기 계수(deg) — d·w(d) 의 최대 0.5 → 최대 ±2.5°
const ANCHOR = 0.53; // 커서 위치 사진의 윗변 = 뷰포트 높이의 53% — 위 더미가 고정 머리(64px) 아래에 서너 띠 남도록
const C = 18; // 포갠 간격(px)
const PAD_TOP = 16; // 핀 시작 순간, 첫 사진 윗변 = 정보 끝에서 16px 아래
const PAD_BOT = 48; // 핀 끝 순간, 마지막 사진 아랫변 ~ 다음 요소

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 창 함수 w(d) = cos²(πd / 2R), |d| ≥ R 이면 0 */
const bell = (d: number) => {
  const a = Math.abs(d);
  if (a >= R) return 0;
  const k = Math.cos((Math.PI * a) / (2 * R));
  return k * k;
};
/** F(d) = ∫₀ᵈ w — 홀함수, |d| ≥ R 에서 ±R/2 로 포화 */
const spread = (d: number) => {
  const a = Math.min(Math.abs(d), R);
  const f = a / 2 + (R / (2 * Math.PI)) * Math.sin((Math.PI * a) / R);
  return d < 0 ? -f : f;
};

export default function Fan({ photos }: { photos: Photo[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const deck = photos.slice(1); // 첫 장은 도입부가 들어선다

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const pin = pinRef.current;
    if (!stage || !pin) return;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>('.fa-card'));
    const n = cards.length;
    if (!n) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const span = n - 1 + 2 * R; // 커서가 지나는 거리(장): −R → n−1+R
    let raf = 0;
    let E = 0;
    let T = 0;

    const measure = () => {
      const vh = window.innerHeight;
      const H = cards[0].offsetHeight;
      E = H;
      T = ANCHOR * vh;
      const lead = (R * (E + C)) / 2; // 커서가 창 밖(−R)일 때 첫 사진 윗변의 T 기준 거리
      const set = (k: string, v: string) => stage.style.setProperty(k, v);
      set('--fa-run', `${span * E}px`);
      set('--fa-mt', `${Math.min(0, -(T + lead - PAD_TOP))}px`);
      set('--fa-mb', `${Math.min(0, -(vh - (T - lead + H) - PAD_BOT))}px`);
    };
    const place = (c: number) => {
      for (let i = 0; i < n; i++) {
        const d = i - c;
        const y = T + d * C + (E - C) * spread(d);
        const w = bell(d);
        const rot = TILT * d * w;
        cards[i].style.transform =
          `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(3)}deg)`;
        cards[i].classList.toggle('fa-near', Math.abs(d) < R + 1.5);
      }
    };
    const update = () => {
      raf = 0;
      const run = stage.offsetHeight - pin.offsetHeight;
      const top = stage.getBoundingClientRect().top;
      const p = run > 0 ? clamp01(-top / run) : 1;
      place(-R + p * span);
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
        cards.forEach(el => {
          el.style.transform = '';
          el.classList.remove('fa-near');
        });
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        return;
      }
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
      if (raf) cancelAnimationFrame(raf);
    };
  }, [photos]);

  return (
    <>
      <style>{`
        .fa-stage {
          --fa-run: 0px; --fa-mt: 0px; --fa-mb: 0px;
          --fa-w: calc(100vw - 40px);
          position: relative; width: 100%;
          height: calc(100svh + var(--fa-run));
          margin-top: var(--fa-mt); margin-bottom: var(--fa-mb);
          pointer-events: none;
        }
        .fa-pin { position: sticky; top: 0; height: 100svh; overflow: hidden; }
        .fa-card {
          position: absolute; top: 0; left: 50%;
          width: var(--fa-w); margin-left: calc(var(--fa-w) / -2);
          aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden;
          transform-origin: -6% 50%;
          box-shadow:
            0 -12px 28px -10px color-mix(in srgb, var(--color-b1-text) 28%, transparent),
            0 0 0 1px color-mix(in srgb, var(--color-b1-text) 7%, transparent);
        }
        .fa-card.fa-near { will-change: transform; }

        /* reduced: 핀을 풀고 펼친 보통 흐름 — 사진 전부가 한 열로 선다 */
        .fa-stage[data-reduced='true'] { height: auto; margin: 0; padding: 56px 0 72px; }
        .fa-stage[data-reduced='true'] .fa-pin {
          position: static; height: auto; overflow: visible;
          display: flex; flex-direction: column; align-items: center; gap: 20px;
        }
        .fa-stage[data-reduced='true'] .fa-card {
          position: relative; left: auto; margin-left: 0; transform: none; will-change: auto;
        }
        @media (prefers-reduced-motion: reduce) {
          .fa-card { will-change: auto; }
        }
      `}</style>

      <div ref={stageRef} className="fa-stage">
        <div ref={pinRef} className="fa-pin">
          {deck.map((photo, i) => (
            <div key={photo.id} className="fa-card bg-b1-placeholder">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                quality={90}
                sizes="calc(100vw - 40px)"
                className="object-cover"
                style={{ objectPosition: i % 3 === 1 ? 'center 30%' : 'center 50%' }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
