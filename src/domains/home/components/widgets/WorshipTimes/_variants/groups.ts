// 시안 비교용 임시 — 장년 9개를 주일 부 / 주중·새벽으로, 다음세대 8개를 분리.
import { WORSHIP_GROUPS, type WorshipServiceSummary } from '@/domains/home/data/worshipTimes';

const adult = WORSHIP_GROUPS[0].services;

export const SUNDAY_PARTS = adult.slice(0, 5); // 주일 1~5부 (전부 예루살렘성전 3F)
export const WEEKDAY_SERVICES = adult.slice(5); // 새벽·수요·청년수요·금요생수의강
export const GEN_SERVICES = WORSHIP_GROUPS[1].services; // 다음세대 8

export const WEEKDAY_SECTIONS: { day: string; sub: string; services: WorshipServiceSummary[] }[] =
  [
    { day: '매일 새벽', sub: '월–금', services: WEEKDAY_SERVICES.filter((s) => s.name === '새벽예배') },
    {
      day: '수요일',
      sub: 'WED',
      services: WEEKDAY_SERVICES.filter(
        (s) => s.name === '수요예배' || s.name === '청년수요예배'
      ),
    },
    { day: '금요일', sub: 'FRI', services: WEEKDAY_SERVICES.filter((s) => s.name === '금요생수의강') },
  ];
