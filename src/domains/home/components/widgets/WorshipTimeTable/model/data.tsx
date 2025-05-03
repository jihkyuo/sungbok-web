import type { WorshipTime } from '@/domains/home/components/widgets/WorshipTimeTable/types/WorshipTime';

const AdultWorship: WorshipTime[] = [
  {
    name: '주일 1부',
    time: '오전 07:00',
    location: '예루살렘성전 3F',
  },
  {
    name: '주일 2부',
    time: '오전 09:00',
    location: '예루살렘성전 3F',
  },
  {
    name: '주일 3부',
    time: '오전 11:00',
    location: '예루살렘성전 3F',
  },
  {
    name: '주일 4부',
    time: '오후 01:00',
    location: '예루살렘성전 3F',
  },
  {
    name: '새벽예배',
    time: (
      <>
        (월~금) <span className={'whitespace-nowrap'}>오전 05:30</span>
      </>
    ),
    location: '임마누엘성전 3F',
  },
  {
    name: '수요예배',
    time: '오후 07:20',
    location: '임마누엘성전 3F',
  },
  {
    name: '금요생수의강',
    time: '오후 08:30',
    location: '예루살렘성전 3F',
  },
];

const NextGeneration: WorshipTime[] = [
  {
    name: '영아부',
    time: '주일 오전 11:00',
    location: '사랑성전 1F',
  },
  {
    name: '유치부',
    time: '주일 오전 11:00',
    location: '믿음성전 2F',
  },
  {
    name: '유년부',
    time: '주일 오전 11:00',
    location: '소망성전 2F',
  },
  {
    name: '초등부',
    time: '주일 오전 11:00',
    location: '화평성전 4F',
  },
  {
    name: '중등부',
    time: '주일 오전 11:00',
    location: '벧엘성전 4F',
  },
  {
    name: '고등부',
    time: '주일 오전 09:00',
    location: '벧엘성전 4F',
  },
  {
    name: '영어예배',
    time: '주일 오후 01:20',
    location: '벧엘성전 4F',
  },
  {
    name: '청년부',
    time: '주일 오후 01:00\n화요기도모임 오후 08:00\n청년수요예배 오후 08:30',
    location: '예루살렘성전 3F\n벧엘성전 4F\n벧엘성전 4F',
  },
  {
    name: '엘림가족부',
    time: '주일 오후 01:00',
    location: '예루살렘성전 3F',
  },
];

const NextGenerationMini: WorshipTime[] = [
  {
    name: '영아부',
    time: '주일 오전 11:00',
    location: '사랑성전 1F',
  },
  {
    name: '유치부',
    time: '주일 오전 11:00',
    location: '믿음성전 2F',
  },
  {
    name: '유년부',
    time: '주일 오전 11:00',
    location: '소망성전 2F',
  },
  {
    name: '초등부',
    time: '주일 오전 11:00',
    location: '화평성전 4F',
  },
  {
    name: '중등부',
    time: '주일 오전 11:00',
    location: '벧엘성전 4F',
  },
  {
    name: '고등부',
    time: '주일 오전 09:00',
    location: '벧엘성전 4F',
  },
  {
    name: '영어예배',
    time: '주일 오후 01:20',
    location: '벧엘성전 4F',
  },
  {
    name: '청년부',
    time: (
      <>
        주일 <span className={'whitespace-nowrap'}>오후 01:00</span>
      </>
    ),
    location: '예루살렘성전 3F',
  },
  {
    name: '청년부 (화요기도모임)',
    time: (
      <>
        화요일 <span className={'whitespace-nowrap'}>오후 08:00</span>
      </>
    ),
    location: '벧엘성전 4F',
  },
  {
    name: '청년부 (수요예배)',
    time: (
      <>
        수요일 <span className={'whitespace-nowrap'}>오후 08:30</span>
      </>
    ),
    location: '벧엘성전 4F',
  },
  {
    name: '엘림가족부',
    time: (
      <>
        주일 <span>오후 01:00</span>
      </>
    ),
    location: '예루살렘성전 3F',
  },
];

export const WorshipTimeTableRecord = {
  adultWorship: AdultWorship,
  nextGeneration: NextGeneration,
  nextGenerationMini: NextGenerationMini,
};
