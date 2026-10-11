// 교회소개 › 담임목사·원로목사 편지 데이터. 두 페이지가 같은 편지지(PastorIntro)를 쓴다.
// 인사말·사진·서명은 기존 사이트 각 페이지(담임 2026-10-10, 원로 2026-10-11) 원문 그대로. 문단 안의 배열 = 원문 행갈이(구 단위).
import pastorEmeritusSign from '@/assets/images/pastor-emeritus-sign.png';
import pastorSign from '@/assets/images/pastor-sign.png';
import pastorEmeritusPhoto from '@/assets/images/main/pastor-emeritus.jpg';
import pastorPhoto from '@/assets/images/main/pastor.jpg';
import type { StaticImageData } from 'next/image';

export interface PastorProfile {
  church: string;
  role: string;
  name: string;
  photo: StaticImageData;
  sign: StaticImageData;
  greeting: {
    salutation: string;
    headline: string;
    paragraphs: readonly (readonly string[])[];
  };
}

export const LEAD_PASTOR: PastorProfile = {
  church: '성복교회',
  role: '담임목사',
  name: '이요셉',
  photo: pastorPhoto,
  sign: pastorSign,
  greeting: {
    salutation: '할렐루야!',
    headline: '예수님의 이름으로 환영합니다.',
    paragraphs: [
      [
        '성복교회의 모든 가족들은',
        '예배를 통해 예수님의 은혜를 전 인격적으로 경험하고',
        '말씀 교제를 통해 성령 안에서 삶의 소망을 회복하여',
        '진정한 자유를 누립니다.',
      ],
      [
        '전도와 선교를 통해 하늘의 기쁨과 행복을 세상에 나누고',
        '다음 세대를 거룩하게 세워 세상을 변화시켜 나갑니다.',
        '이러한 아름다운 공동체에 여러분들을 초대합니다.',
      ],
      [
        '언제나 하나님의 축복과 예수님의 은혜와 성령님의 평강이',
        '여러분들의 인생 가운데 온전히 임하시길 진심으로 기원합니다.',
      ],
    ],
  },
};

export const PASTOR_EMERITUS: PastorProfile = {
  church: '성복교회',
  role: '원로목사',
  name: '이태희',
  photo: pastorEmeritusPhoto,
  sign: pastorEmeritusSign,
  greeting: {
    salutation: '할렐루야!',
    headline: '성복교회 홈페이지에 방문하여 주신 여러분들을 주님의 이름으로 환영합니다.',
    paragraphs: [
      [
        '지금까지 하나님의 인도하심으로 부흥 성장해 온 저희 성복교회는',
        '지친 인생 속에서 잠시 쉬어갈 수 있는 쉼터가 되어드릴 것이며',
        '예수 그리스도로 말미암아 천국에 이르는 구원의 방주가 될 것입니다.',
      ],
      [
        '성복교회는 언제나 열려있습니다.',
        '성복교회는 여러분을 기다리고 있습니다.',
        '여러분을 환영합니다.',
        '여러분들의 심령과 가정과 일터 위에',
        '하나님의 크신 은혜와 축복이 충만하기를 축원합니다.',
      ],
    ],
  },
};
