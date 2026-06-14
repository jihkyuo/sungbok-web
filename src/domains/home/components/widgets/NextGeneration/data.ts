// 다음세대 섹션 데이터 — 9개 부서를 생애주기 순으로 평탄화해 별자리에 배치한다.
import { MINISTRIES, type Ministry } from '@/domains/home/data/ministries';

export const TITLE = '다음세대';
export const EYEBROW = '● NEXT GENERATION';

const STAGE_DEFS: { label: string; names: string[] }[] = [
  { label: '영유아', names: ['영아부', '유치부'] },
  { label: '어린이', names: ['유년부', '초등부'] },
  { label: '청소년', names: ['중등부', '고등부'] },
  { label: '청년·가족', names: ['영어 예배부', '청년부', '엘림가족부'] },
];

const byName = (n: string) => MINISTRIES.find((m) => m.name === n);

const STAGES = STAGE_DEFS.map((s) => ({
  label: s.label,
  members: s.names.map(byName).filter((m): m is Ministry => Boolean(m)),
}));

/** 생애주기 순으로 평탄화한 9개 부서 (= 별 위치 POS 순서) */
export const ORDERED: Ministry[] = STAGES.flatMap((s) => s.members);

/** 부서명 → 생애주기 라벨 */
export const STAGE_OF: Record<string, string> = Object.fromEntries(
  STAGES.flatMap((s) => s.members.map((m) => [m.name, s.label]))
);
