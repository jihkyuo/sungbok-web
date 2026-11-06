/**
 * design:audit 판정 함수 — 순수 모듈(import 없음).
 * scripts/design-audit.mjs 가 CDP 로 모은 측정값을 여기로 넘겨 위반을 판정한다.
 * 기준: 설계 .md/specs/2026-11-05-design-system-design.md §5.5
 */

export type TargetInfo = {
  label: string;
  tag: string;
  role: string | null;
  inParagraph: boolean;
  width: number;
  height: number;
};

export type TextInfo = { text: string; fontSizePx: number; isFormControl: boolean };

export type Violation = { kind: 'overflow' | 'touch' | 'font' | 'timeout' | 'error'; detail: string };

export const DEFAULT_AUDIT_WIDTHS = [375, 768, 1024, 1280];
const MIN_AUDIT_WIDTH = 320;

const HANGUL = /[가-힣ㄱ-ㆎ]/;

export const MIN_FORM_CONTROL_PX = 16;
export const MIN_HANGUL_PX = 13;
export const MIN_LATIN_PX = 12;

export const hasHangul = (s: string): boolean => HANGUL.test(s);

export const judgeOverflow = (innerWidth: number, scrollWidth: number): Violation[] =>
  scrollWidth > innerWidth + 1
    ? [{ kind: 'overflow', detail: `페이지 폭 ${scrollWidth}px > 화면 ${innerWidth}px` }]
    : [];

export const judgeTouchTargets = (targets: TargetInfo[], minPx = 44): Violation[] =>
  targets
    .filter(t => t.width > 0 && t.height > 0 && !t.inParagraph)
    .filter(t => t.width < minPx || t.height < minPx)
    .map(t => ({
      kind: 'touch' as const,
      detail: `${t.tag}${t.role ? `[${t.role}]` : ''} "${t.label}" ${Math.round(t.width)}×${Math.round(t.height)}`,
    }));

const minFontFor = (t: TextInfo): number => {
  if (t.isFormControl) return MIN_FORM_CONTROL_PX;
  return hasHangul(t.text) ? MIN_HANGUL_PX : MIN_LATIN_PX;
};

export const judgeFontSizes = (texts: TextInfo[]): Violation[] =>
  texts
    .filter(t => t.text.trim() !== '')
    .filter(t => t.fontSizePx < minFontFor(t))
    .map(t => ({
      kind: 'font' as const,
      detail: `"${t.text.trim().slice(0, 20)}" ${t.fontSizePx}px < ${minFontFor(t)}px`,
    }));

/** 시간 안에 끝나면 값, 넘기면 'timeout'. 거부(오류)는 그대로 전파한다 — 오류를 시간 초과로 뭉개지 않는다. */
export const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T | 'timeout'> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve('timeout'), ms);
    p.then(
      v => {
        clearTimeout(timer);
        resolve(v);
      },
      e => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });

/** `--widths 375,768` 파싱. 비었거나 숫자가 아니거나 320px 미만이면 던진다. */
export const parseWidths = (arg: string | undefined): number[] => {
  if (arg === undefined) return [...DEFAULT_AUDIT_WIDTHS];
  return arg.split(',').map(part => {
    const n = Number(part);
    if (part.trim() === '' || !Number.isInteger(n) || n < MIN_AUDIT_WIDTH) {
      throw new Error(`--widths 값이 잘못됐습니다: "${arg}" (예: 375,768,1280)`);
    }
    return n;
  });
};
