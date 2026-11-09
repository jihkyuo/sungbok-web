/**
 * MorphFrame — 히어로 화면 전체를 카드로 변형하는 프레임(시안 P 승격, 2026-10-19).
 *
 * 바깥 창(비균등 scale + overflow hidden) × 안쪽 콘텐츠 역scale(cover) 로 레이아웃 속성 없이 비율까지 변형한다.
 * 부모(HomeLead)가 rAF 에서 update() 로 CSS 변수만 쓴다. 카드가 되는 사진은 히어로 전경 그대로 — 마스크 없는
 * 전체폭 전경 레이어를 히어로 사진 상자에 픽셀 정렬해 두고(q=0) q 가 커질수록 identity 로 풀어준다(사진 교체 없음).
 * 전경 레이어 상자는 왼쪽으로 EXT_G 만큼 넓혀 정렬 중에도 왼쪽이 비지 않게 한다 — 안착 타일도 같은 상자를 쓴다.
 */
'use client';

import Image from 'next/image';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import mainExterior from '@/assets/images/main/main01.webp';
import { HomeHero } from '@/domains/home/components/widgets/HomeHero';

import { exteriorAlign, fullRect, type Rect } from './morphMath';

export type FrameState = {
  /** 카드 픽셀 기하(뷰포트 좌표). null = 전체화면 */
  rect: Rect | null;
  /** 0 전체화면 → 1 카드 */
  q: number;
  /** 히어로 → 전경 레이어 크로스페이드 */
  f1: number;
  /** 히어로 카피 불투명도 */
  copy: number;
  /** false 면 프레임을 숨김(안착 후 타일에 핸드오프) */
  visible: boolean;
};
export type MorphFrameHandle = { update: (s: FrameState) => void };

/** 전경 연속 레이어의 왼쪽 여유 폭(뷰포트 비율) */
export const EXT_G = 0.24;
const IMG = { w: mainExterior.width, h: mainExterior.height };

// 보이지 않는 동안은 visibility 도 끈다 — 투명한 히어로 CTA 가 키보드 포커스/클릭을 받지 않도록(a11y)
const CSS = `.mf-copy{opacity:var(--copy);visibility:var(--copy-vis)}`;

export const MorphFrame = forwardRef<MorphFrameHandle, { className?: string; radius: number }>(
  ({ className, radius }, ref) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const extRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      update(s) {
        const el = rootRef.current;
        if (!el) return;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const g = s.rect ?? fullRect(vw, vh);
        const sx = g.w / vw;
        const sy = g.h / vh;
        const k = Math.max(sx, sy);
        const st = el.style;
        st.setProperty('--fx', `${(g.cx - vw / 2).toFixed(2)}px`);
        st.setProperty('--fy', `${(g.cy - vh / 2).toFixed(2)}px`);
        st.setProperty('--sx', sx.toFixed(4));
        st.setProperty('--sy', sy.toFixed(4));
        st.setProperty('--ix', (k / sx).toFixed(4));
        st.setProperty('--iy', (k / sy).toFixed(4));
        st.setProperty('--r', `${(radius * s.q).toFixed(1)}px`);
        st.setProperty('--f1', s.f1.toFixed(3));
        st.setProperty('--copy', s.copy.toFixed(3));
        st.setProperty('--copy-vis', s.copy > 0 ? 'visible' : 'hidden');
        st.setProperty('--vis', s.visible ? '1' : '0');
        st.setProperty('--vis-v', s.visible ? 'visible' : 'hidden');
        if (extRef.current) {
          const a = exteriorAlign(s.q, vw, vh, IMG, EXT_G);
          extRef.current.style.transform = `translate(${a.tx.toFixed(2)}px,${a.ty.toFixed(2)}px) scale(${a.k.toFixed(5)})`;
        }
      },
    }));

    return (
      <div
        ref={rootRef}
        className={`pointer-events-none ${className ?? ''}`}
        style={
          {
            '--fx': '0px',
            '--fy': '0px',
            '--sx': 1,
            '--sy': 1,
            '--ix': 1,
            '--iy': 1,
            '--r': '0px',
            '--f1': 0,
            '--copy': 1,
            '--copy-vis': 'visible',
            '--vis': 1,
            '--vis-v': 'visible',
          } as React.CSSProperties
        }
      >
        <style>{CSS}</style>
        <div
          className="bg-b1-bg pointer-events-auto absolute inset-0 overflow-hidden"
          style={{
            transform: 'translate3d(var(--fx),var(--fy),0) scale(var(--sx),var(--sy))',
            borderRadius: 'calc(var(--r) / var(--sx)) / calc(var(--r) / var(--sy))',
            opacity: 'var(--vis)',
            visibility: 'var(--vis-v)' as React.CSSProperties['visibility'],
            willChange: 'transform',
          }}
        >
          <div
            className="absolute inset-0"
            style={{ transform: 'scale(var(--ix),var(--iy))', willChange: 'transform' }}
          >
            <div className="absolute inset-0" style={{ opacity: 'calc(1 - var(--f1))' }}>
              <HomeHero copyClassName="mf-copy" />
            </div>
            <div
              ref={extRef}
              aria-hidden
              className="absolute inset-y-0 right-0 origin-top-left"
              style={{ left: `${-EXT_G * 100}%`, opacity: 'var(--f1)', willChange: 'transform' }}
            >
              <Image
                src={mainExterior}
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-[55%_50%]"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
MorphFrame.displayName = 'MorphFrame';
