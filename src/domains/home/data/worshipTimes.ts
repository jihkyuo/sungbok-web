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
