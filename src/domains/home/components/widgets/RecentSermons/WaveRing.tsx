'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';

type Mode = 'bars';

interface Box {
  hw: number;
  hh: number;
  cr: number;
}

interface Props {
  qRef: MutableRefObject<number>;
  boxRef: MutableRefObject<Box>;
  mode?: Mode;
}

const PIN = 0.04;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const cl = (x: number) => Math.min(1, Math.max(0, x));

function energyOf(q: number) {
  if (q <= PIN) return 0.06;
  if (q < 0.5) return lerp(0.1, 0.36, (q - PIN) / (0.5 - PIN));
  return lerp(0.36, 1, cl((q - 0.5) / 0.28));
}

/**
 * 원형 오디오 파동(LP 턴테이블 BB 전용·이퀄 막대). 영상 외곽을 **타원으로 부드럽게 추종**(사각 모서리 수직
 * 스파이크=벌레 느낌 회피). 에너지는 심박 단조로움 ❌ → 지속 강도 + 킥/오프비트 + 고조 시 지글거리는 sizzle.
 */
export function WaveRing({ qRef, boxRef, mode = 'bars' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seedRef = useRef<{ w: number; p: number; f: number; r: number }[]>([]);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;

    const N = 200;
    if (seedRef.current.length === 0) {
      seedRef.current = Array.from({ length: N }, () => ({
        w: 0.4 + Math.random() * 0.6,
        p: Math.random() * Math.PI * 2,
        f: 0.6 + Math.random() * 1.1,
        r: Math.random(),
      }));
    }
    const seed = seedRef.current;
    const PERIOD = 60000 / 116;

    let raf = 0;
    const t0 = performance.now();
    const draw = (now: number) => {
      const t = now - t0;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const q = qRef.current;
      const { hw, hh } = boxRef.current;
      const rx = hw;
      const ry = hh; // 타원으로 영상 비율 추종(부드럽게)
      const E = energyOf(q);
      const dyn = 0.82 + 0.18 * Math.sin(t * 0.0006);
      const kick = Math.exp(-((t % PERIOD) / PERIOD) * 4);
      const hat = Math.exp(-(((t + PERIOD / 2) % PERIOD) / PERIOD) * 9) * 0.45;
      const beat = kick + hat;
      const maxLen = 38;

      // 타원 위 점 + 외향 법선
      const ept = (ang: number) => {
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const nx = ca / rx;
        const ny = sa / ry;
        const nl = Math.hypot(nx, ny) || 1;
        return { px: rx * ca, py: ry * sa, nx: nx / nl, ny: ny / nl };
      };

      const sizzleOf = (s: { p: number; f: number }) =>
        (0.5 + 0.5 * Math.sin(t * 0.021 * s.f + s.p)) * (0.5 + 0.5 * Math.sin(t * 0.033 * s.f + s.p * 1.7));

      // 레벨: 지속 shape + 비트 accent + 지글 sizzle(고조 시)
      const level = (idx: number, ang: number) => {
        const s = seed[idx % N];
        const bass = 0.5 + 0.5 * Math.cos(ang * 2);
        const spec = 0.5 + 0.5 * Math.sin(ang * 4 + t * 0.0008 + s.p);
        const slow = 0.5 + 0.5 * Math.sin(ang * 2 - t * 0.001 + s.p * 0.5);
        const shape = 0.6 * spec * s.w + 0.4 * slow;
        const sz = sizzleOf(s);
        // 비트 악센트가 링을 돌며 이동 → 단조로운 '심박' 느낌 제거
        const travel = 0.5 + 0.5 * Math.sin(ang * 3 - t * 0.0019 + s.p);
        return Math.max(
          0,
          E * dyn *
            (0.18 + shape * 0.6 + beat * (0.4 + 0.6 * bass) * travel * 0.6 * E + sz * 0.62 * Math.pow(E, 1.45))
        );
      };

      // 중심 글로우(타원) — 비트에 맞춰
      const gr = Math.max(rx, ry) + 16 + E * 30 + beat * E * 16;
      const g = ctx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.9, cx, cy, gr);
      g.addColorStop(0, 'hsla(250,80%,62%,0)');
      g.addColorStop(0.55, `hsla(256,84%,64%,${0.04 + E * 0.13 + beat * E * 0.05})`);
      g.addColorStop(1, 'hsla(288,84%,64%,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy, gr, gr * (ry / Math.max(rx, ry)), 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      const hueAt = (frac: number, ang: number) => 224 + 104 * frac + 14 * Math.sin(t * 0.0008 + ang);

      if (mode === 'bars') {
        const count = 170;
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * Math.PI * 2;
          const e = ept(ang);
          const len = 2 + level(i, ang) * maxLen;
          const x1 = cx + e.px;
          const y1 = cy + e.py;
          const x2 = x1 + e.nx * len;
          const y2 = y1 + e.ny * len;
          const hue = hueAt(i / count, ang);
          const a = 0.3 + E * 0.46;
          ctx.strokeStyle = `hsla(${hue},72%,62%,${a * 0.34})`;
          ctx.lineWidth = 5.4;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.strokeStyle = `hsla(${hue},82%,70%,${a})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          if (len > 8) {
            ctx.fillStyle = `hsla(${hue},90%,88%,${0.4 + E * 0.4})`;
            ctx.beginPath();
            ctx.arc(x2, y2, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [qRef, boxRef, mode]);

  return (
    <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden />
  );
}
