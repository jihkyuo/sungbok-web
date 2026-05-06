import type { StaticImageData } from 'next/image';

import dep01Img from '@/assets/images/main/department/dep01.jpg';
import dep02Img from '@/assets/images/main/department/dep02.jpg';
import dep03Img from '@/assets/images/main/department/dep03.jpg';
import dep04Img from '@/assets/images/main/department/dep04.jpg';
import dep05Img from '@/assets/images/main/department/dep05.jpg';
import dep06Img from '@/assets/images/main/department/dep06.jpg';
import dep07Img from '@/assets/images/main/department/dep07.jpg';
import dep08Img from '@/assets/images/main/department/dep08.jpg';
import dep09Img from '@/assets/images/main/department/dep09.jpg';

export interface Ministry {
  name: string;
  age: string;
  tone: string;
  image: StaticImageData;
  href: string;
}

export const MINISTRIES: Ministry[] = [
  {
    name: '영아부',
    age: '1~4세',
    tone: '믿음의 씨앗을 심는 곳',
    image: dep01Img,
    href: '/next-generation',
  },
  {
    name: '유치부',
    age: '5~7세',
    tone: '말씀으로 견고한 믿음',
    image: dep02Img,
    href: '/next-generation',
  },
  {
    name: '유년부',
    age: '1~3학년',
    tone: '하나님의 가치관으로',
    image: dep03Img,
    href: '/next-generation',
  },
  {
    name: '초등부',
    age: '4~6학년',
    tone: '하나님을 기뻐하는 아이',
    image: dep04Img,
    href: '/next-generation',
  },
  {
    name: '중등부',
    age: '중학생',
    tone: '은혜가 흐르는 공동체',
    image: dep05Img,
    href: '/next-generation',
  },
  {
    name: '고등부',
    age: '고등학생',
    tone: '주신 비전을 가지고',
    image: dep06Img,
    href: '/next-generation',
  },
  {
    name: '영어 예배부',
    age: 'EM',
    tone: '복음을 전할 일꾼',
    image: dep07Img,
    href: '/next-generation',
  },
  {
    name: '청년부',
    age: '20~30대',
    tone: '함께 지어져 가는 공동체',
    image: dep08Img,
    href: '/next-generation',
  },
  {
    name: '엘림가족부',
    age: '신혼·자녀',
    tone: '대화와 기도로 함께',
    image: dep09Img,
    href: '/next-generation',
  },
];
