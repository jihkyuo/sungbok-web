// 임시 시안 공용 데이터 — 확정 후 nextgen-preview 폴더째 삭제.
// 다크(여명 아크) 라운드: LP 어둠을 이어받아 섹션 안에서 새벽처럼 밝아져 교회소식으로 연결.
import { MINISTRIES, type Ministry } from '@/domains/home/data/ministries';

export const TITLE = '다음세대';
export const EYEBROW = '● NEXT GENERATION';

export interface Stage {
  key: string;
  label: string;
  caption: string;
  members: Ministry[];
}

const STAGE_DEFS: { key: string; label: string; names: string[] }[] = [
  { key: 'baby', label: '영유아', names: ['영아부', '유치부'] },
  { key: 'child', label: '어린이', names: ['유년부', '초등부'] },
  { key: 'teen', label: '청소년', names: ['중등부', '고등부'] },
  { key: 'young', label: '청년·가족', names: ['영어 예배부', '청년부', '엘림가족부'] },
];

const byName = (n: string) => MINISTRIES.find((m) => m.name === n);

export const STAGES: Stage[] = STAGE_DEFS.map((s) => {
  const members = s.names.map(byName).filter((m): m is Ministry => Boolean(m));
  return {
    key: s.key,
    label: s.label,
    caption: members.map((m) => m.name.replace(/부$/, '')).join('·'),
    members,
  };
});

/** 생애주기 순으로 평탄화한 9개 부서 (= 데이터 순서) */
export const ORDERED: Ministry[] = STAGES.flatMap((s) => s.members);

/** 부서명 → 생애주기 라벨 */
export const STAGE_OF: Record<string, string> = Object.fromEntries(
  STAGES.flatMap((s) => s.members.map((m) => [m.name, s.label]))
);

/** 연령 축 배치용 *근사* 시작 연령 (라벨은 실제 m.age 사용). */
export const AGE_AT: Record<string, number> = {
  영아부: 2,
  유치부: 6,
  유년부: 9,
  초등부: 12,
  중등부: 15,
  고등부: 18,
  '영어 예배부': 22,
  청년부: 27,
  엘림가족부: 34,
};
export const AGE_MAX = 40;

/* ───────────────────── 여명(dawn) 색 스케일 — 전 시안 공통 ─────────────────────
 * 상단 #0b0b0d (LP 어둠 연속) → 밤보라 → 여명 보라/핑크/복숭아 → 하단 #f6fafe (교회소식 연결).
 * 섹션 배경에 세로로 깔아 "한 섹션 안에서 새벽처럼 밝아짐"을 만든다. % 는 섹션 높이 기준. */
export const NIGHT = '#0b0b0d';
export const DAWN_END = '#f6fafe';
/** 다크 위 가독 액센트 (b1-accent2). 밝은 b1-accent(#2563eb)보다 어둠에서 잘 읽힘. */
export const DAWN_ACCENT = '#8aa6ef';

export const DAWN_GRADIENT = [
  'linear-gradient(180deg,',
  '#0b0b0d 0%,',
  '#0c0b11 24%,',
  '#171225 44%,',
  '#33233f 60%,',
  '#6b4763 73%,',
  '#b07e84 83%,',
  '#e7c2a6 91%,',
  '#f6fafe 100%)',
].join(' ');

/** 어둠에 가라앉은 사진 → 호버/포커스 시 원색 회복용 필터 프리셋 */
export const DIM_IMG = 'brightness(0.6) saturate(0.85) contrast(1.02)';
export const LIVE_IMG = 'brightness(1) saturate(1.05) contrast(1)';
