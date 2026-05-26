'use client';

import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

import { POSTER, STANDIN_VIDEO } from './data';

interface Props {
  className?: string;
  videoClassName?: string;
  style?: CSSProperties;
  videoStyle?: CSSProperties;
  /** 영상 위에 얹을 스크림/블렌드 오버레이 */
  children?: ReactNode;
}

/**
 * 비인터랙티브 앰비언트 영상.
 * pointer-events-none + 컨트롤 없음 + tabIndex -1 → 클릭/포커스/조작 전부 불가, 보기만 가능.
 * (현재 RecentSermons 의 버그: 오버레이가 pointer-events-none 이라 iframe 본체가 클릭됨 — 여기서 교정)
 */
export const AmbientVideo = ({ className, videoClassName, style, videoStyle, children }: Props) => (
  <div
    aria-hidden
    className={cn('pointer-events-none relative overflow-hidden bg-black', className)}
    style={style}
  >
    <video
      className={cn('absolute inset-0 h-full w-full object-cover', videoClassName)}
      style={videoStyle}
      src={STANDIN_VIDEO}
      poster={POSTER.src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      tabIndex={-1}
    />
    {children}
  </div>
);
