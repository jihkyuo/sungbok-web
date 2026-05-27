'use client';

import { useScrollProgress } from './useScrollProgress';

/**
 * 턴테이블 스크롤 시퀀스의 정규화 진행도 q (320vh 섹션 + sticky 기준, 핀 구간 progress≈0.25~0.73).
 * 세부 위상(성장/회전/트리거 확대)은 TurntableStage 에서 q 로 계산.
 */
export function useTurntable<T extends HTMLElement = HTMLElement>() {
  const { ref, progress } = useScrollProgress<T>();
  const q = Math.min(1, Math.max(0, (progress - 0.25) / 0.48));
  return { ref, q };
}
