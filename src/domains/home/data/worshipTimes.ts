export interface WorshipServiceSummary {
  name: string;
  place: string;
  time: string;
}

export const HERO_WORSHIP_TIMES: WorshipServiceSummary[] = [
  { name: '주일 1부', place: '예루살렘성전 3F', time: '오전 07:00' },
  { name: '주일 2부', place: '예루살렘성전 3F', time: '오전 09:00' },
  { name: '주일 3부', place: '예루살렘성전 3F', time: '오전 11:00' },
  { name: '주일 4부', place: '예루살렘성전 3F', time: '오후 01:00' },
];
