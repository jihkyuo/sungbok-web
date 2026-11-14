/** 예배 요일 — 표에서 요일별로 묶는 기준 */
export type WorshipDay = '주일' | '새벽' | '수요일' | '금요일';

export interface WorshipServiceSummary {
  name: string;
  place: string;
  time: string;
  day: WorshipDay;
  /** 정기 주일 외 반복 안내 (예: 새벽예배 '월~금') */
  note?: string;
}

export interface WorshipServiceGroup {
  label: string;
  services: WorshipServiceSummary[];
}

export const WORSHIP_GROUPS: WorshipServiceGroup[] = [
  {
    label: '장년예배',
    services: [
      { day: '주일', name: '주일 1부', time: '오전 7:00', place: '예루살렘성전 3F' },
      { day: '주일', name: '주일 2부', time: '오전 9:00', place: '예루살렘성전 3F' },
      { day: '주일', name: '주일 3부', time: '오전 11:30', place: '예루살렘성전 3F' },
      { day: '주일', name: '주일 4부', time: '오후 1:30', place: '예루살렘성전 3F' },
      { day: '주일', name: '주일 5부', time: '오후 3:30', place: '예루살렘성전 3F' },
      { day: '새벽', name: '새벽예배', time: '오전 5:30', place: '임마누엘성전 3F', note: '월~금' },
      { day: '수요일', name: '수요예배', time: '오후 7:30', place: '임마누엘성전 3F' },
      { day: '금요일', name: '금요생수의강', time: '오후 8:30', place: '예루살렘성전 3F' },
    ],
  },
  {
    label: '다음세대예배',
    services: [
      { day: '주일', name: '영아부', time: '오전 11:30', place: '사랑성전 1F' },
      { day: '주일', name: '유치부', time: '오전 11:30', place: '믿음성전 2F' },
      { day: '주일', name: '유년부', time: '오전 11:30', place: '소망성전 2F' },
      { day: '주일', name: '초등부', time: '오전 11:30', place: '화평성전 4F' },
      { day: '주일', name: '중등부', time: '오전 11:30', place: '벧엘성전 4F' },
      { day: '주일', name: '고등부', time: '오전 9:00', place: '벧엘성전 4F' },
      { day: '주일', name: '영어예배', time: '오후 2:00', place: '벧엘성전 4F' },
      { day: '주일', name: '청년부', time: '오후 1:30', place: '예루살렘성전 3F' },
      // 기획 D9: 요일을 앞에 — "청년수요예배" 아님. 청년 예배라 다음세대로 구분한다(요일은 수요일)
      { day: '수요일', name: '수요 청년예배', time: '오후 8:30', place: '벧엘성전 4F' },
    ],
  },
];

// ── 시간 표기 헬퍼 ────────────────────────────────────────────
/** '오전 7:00' → '7:00' */
export const stripPeriod = (t: string) => t.replace('오전 ', '').replace('오후 ', '');
/** '오전 7:00' → '오전' */
export const periodKo = (t: string) => (t.includes('오전') ? '오전' : '오후');
/** 정렬용 분 단위 변환 */
export const toMinutes = (t: string) => {
  const pm = t.includes('오후');
  const [h, m] = stripPeriod(t).split(':').map(Number);
  const hour = pm && h !== 12 ? h + 12 : h;
  return hour * 60 + m;
};

// ── 요일별 파생 ──────────────────────────────────────────────
const ADULT = WORSHIP_GROUPS[0].services;
const GEN = WORSHIP_GROUPS[1].services;
/** 그 요일의 예배를 시간 순으로 — 같은 시각은 적힌 순서(나이 순) 유지 */
const on = (list: WorshipServiceSummary[], day: WorshipDay) =>
  list.filter(s => s.day === day).sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

/** 다음세대 예배 여부 (참조 동일성 기반) — 주일 부서와 수요 청년예배 */
export const isGenService = (s: WorshipServiceSummary) => GEN.includes(s);

/** 주일 예배 전체(장년 부 + 다음세대) */
const SUNDAY_ALL = [...on(ADULT, '주일'), ...on(GEN, '주일')];

/** 주일 시각(중복 제거 후 정렬) */
export const SUNDAY_TIMES = [...new Set(SUNDAY_ALL.map(s => s.time))].sort(
  (a, b) => toMinutes(a) - toMinutes(b)
);

/** 해당 시각의 주일 예배들 */
export const sundayAt = (t: string) => SUNDAY_ALL.filter(s => s.time === t);

/** 주중·새벽 예배 요일 묶음 — 한 요일 안에서는 장년 → 다음세대 순 */
export const WEEKDAY_SECTIONS: { day: string; services: WorshipServiceSummary[] }[] = (
  [
    ['매일 새벽', '새벽'],
    ['수요일', '수요일'],
    ['금요일', '금요일'],
  ] as const
).map(([day, key]) => ({ day, services: [...on(ADULT, key), ...on(GEN, key)] }));

/** 요일별 전체 묶음(휴대폰 표) — 주일만 장년·다음세대 두 줄로 나뉜다 */
export const DAY_SECTIONS: {
  day: string;
  lanes: { label?: string; services: WorshipServiceSummary[] }[];
}[] = [
  {
    day: '주일',
    lanes: [
      { label: '장년', services: on(ADULT, '주일') },
      { label: '다음세대', services: on(GEN, '주일') },
    ],
  },
  ...WEEKDAY_SECTIONS.map(sec => ({ day: sec.day, lanes: [{ services: sec.services }] })),
];
