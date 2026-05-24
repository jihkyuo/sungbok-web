// 시안 비교용 임시 데이터 — 예배별 요일을 매핑해 시간×요일 그리드를 구성.
// 확정 후 정리 예정.
import { WORSHIP_GROUPS, type WorshipServiceSummary } from '@/domains/home/data/worshipTimes';
import { toMinutes } from './time';

export const DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
export type Day = (typeof DAYS)[number];

export interface WeekService extends WorshipServiceSummary {
  gen: boolean; // 다음세대 여부
  days: Day[];
}

const daysFor = (name: string): Day[] => {
  if (name === '새벽예배') return ['월', '화', '수', '목', '금'];
  if (name === '수요예배' || name === '청년수요예배') return ['수'];
  if (name === '금요생수의강') return ['금'];
  return ['일'];
};

export const WEEK_SERVICES: WeekService[] = WORSHIP_GROUPS.flatMap((g, gi) =>
  g.services.map((s) => ({ ...s, gen: gi === 1, days: daysFor(s.name) }))
);

export const TIME_ROWS = [...new Set(WEEK_SERVICES.map((s) => s.time))].sort(
  (a, b) => toMinutes(a) - toMinutes(b)
);

export const rowServices = (time: string) => WEEK_SERVICES.filter((s) => s.time === time);

export const servicesAt = (time: string, day: Day) =>
  WEEK_SERVICES.filter((s) => s.time === time && s.days.includes(day));
