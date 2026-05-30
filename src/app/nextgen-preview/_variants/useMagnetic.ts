// 임시 시안 전용 — 확정 후 nextgen-preview 폴더째 삭제.
'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 자기장 근접 선택 훅 (T 발전형). 컨테이너 위 포인터의 **가장 가까운 점**을 active로 잡고,
 * 커서 추종 글로우 + CSS변수 시차(--px/--py)를 rAF로 구동(리렌더는 active 변동 시에만).
 * `frozen()` 이 true면 active를 갱신하지 않음 → **클릭 커밋(잠금) 시 포커스 가로챔 방지**.
 */
export function useMagnetic(
  positions: { x: number; y: number }[],
  opts?: { frozen?: () => boolean }
) {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const tick = () => {
      raf = 0;
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      el.style.setProperty('--px', (cx / w - 0.5).toFixed(4));
      el.style.setProperty('--py', (cy / h - 0.5).toFixed(4));
      if (glowRef.current) glowRef.current.style.transform = `translate(${cx - 90}px, ${cy - 90}px)`;
      if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (glowRef.current) glowRef.current.style.opacity = '1';
      if (!opts?.frozen?.()) {
        const mx = (tx / r.width) * 100;
        const my = (ty / r.height) * 100;
        let best = 0;
        let bd = 1e9;
        for (let i = 0; i < positions.length; i++) {
          const dx = positions[i].x - mx;
          const dy = positions[i].y - my;
          const d = dx * dx + dy * dy;
          if (d < bd) {
            bd = d;
            best = i;
          }
        }
        if (best !== activeRef.current) {
          activeRef.current = best;
          setActive(best);
        }
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => {
      if (glowRef.current) glowRef.current.style.opacity = '0';
    };
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerdown', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerdown', move);
      el.removeEventListener('pointerleave', leave);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (i: number) => {
    activeRef.current = i;
    setActive(i);
  };
  return { ref, glowRef, active, set };
}
