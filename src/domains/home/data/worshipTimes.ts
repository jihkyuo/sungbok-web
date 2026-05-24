export interface WorshipServiceSummary {
  name: string;
  place: string;
  time: string;
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
      { name: '주일 1부', time: '오전 7:00', place: '예루살렘성전 3F' },
      { name: '주일 2부', time: '오전 9:00', place: '예루살렘성전 3F' },
      { name: '주일 3부', time: '오전 11:30', place: '예루살렘성전 3F' },
      { name: '주일 4부', time: '오후 1:30', place: '예루살렘성전 3F' },
      { name: '주일 5부', time: '오후 3:30', place: '예루살렘성전 3F' },
      { name: '새벽예배', time: '오전 5:30', place: '임마누엘성전 3F', note: '월~금' },
      { name: '수요예배', time: '오후 7:30', place: '임마누엘성전 3F' },
      { name: '청년수요예배', time: '오후 8:30', place: '벧엘성전 4F' },
      { name: '금요생수의강', time: '오후 8:30', place: '예루살렘성전 3F' },
    ],
  },
  {
    label: '다음세대예배',
    services: [
      { name: '영아부', time: '오전 11:30', place: '사랑성전 1F' },
      { name: '유치부', time: '오전 11:30', place: '믿음성전 2F' },
      { name: '유년부', time: '오전 11:30', place: '소망성전 2F' },
      { name: '초등부', time: '오전 11:30', place: '화평성전 4F' },
      { name: '중등부', time: '오전 11:30', place: '벧엘성전 4F' },
      { name: '고등부', time: '오전 9:00', place: '벧엘성전 4F' },
      { name: '영어예배', time: '오후 2:00', place: '벧엘성전 4F' },
      { name: '청년부', time: '오후 1:30', place: '예루살렘성전 3F' },
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

// ── 데스크톱 정류장 타임라인용 파생 ──────────────────────────
const ADULT = WORSHIP_GROUPS[0].services;

/** 주일 1~5부 */
export const SUNDAY_PARTS = ADULT.slice(0, 5);
/** 새벽·수요·청년수요·금요생수의강 */
export const WEEKDAY_SERVICES = ADULT.slice(5);
/** 다음세대 8개 부서 (전부 주일) */
export const GEN_SERVICES = WORSHIP_GROUPS[1].services;

/** 주일 예배 전체(장년 부 + 다음세대) */
const SUNDAY_ALL = [...SUNDAY_PARTS, ...GEN_SERVICES];

/** 주일 시각(중복 제거 후 정렬) */
export const SUNDAY_TIMES = [...new Set(SUNDAY_ALL.map((s) => s.time))].sort(
  (a, b) => toMinutes(a) - toMinutes(b)
);

/** 해당 시각의 주일 예배들 */
export const sundayAt = (t: string) => SUNDAY_ALL.filter((s) => s.time === t);

/** 다음세대 예배 여부 (참조 동일성 기반) */
export const isGenService = (s: WorshipServiceSummary) => GEN_SERVICES.includes(s);

/** 주중·새벽 예배 요일 묶음 */
export const WEEKDAY_SECTIONS: { day: string; services: WorshipServiceSummary[] }[] = [
  { day: '매일 새벽', services: WEEKDAY_SERVICES.filter((s) => s.name === '새벽예배') },
  {
    day: '수요일',
    services: WEEKDAY_SERVICES.filter(
      (s) => s.name === '수요예배' || s.name === '청년수요예배'
    ),
  },
  { day: '금요일', services: WEEKDAY_SERVICES.filter((s) => s.name === '금요생수의강') },
];
