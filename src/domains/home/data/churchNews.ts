import type { StaticImageData } from 'next/image';

import dep02Img from '@/assets/images/main/department/dep02.jpg';
import dep03Img from '@/assets/images/main/department/dep03.jpg';
import dep04Img from '@/assets/images/main/department/dep04.jpg';
import dep07Img from '@/assets/images/main/department/dep07.jpg';
import dep08Img from '@/assets/images/main/department/dep08.jpg';

// 홈 '교회 소식' 섹션 데이터.
// 현재는 placeholder(목업 + stand-in 이미지). 실제 소식 연동·이미지 규칙은 후속.
export type NewsTag = '공지' | '소식' | '교육' | '행사';

export interface ChurchNewsPost {
  tag: NewsTag;
  title: string;
  date: string; // 'YYYY.MM.DD'
  excerpt?: string;
  image?: StaticImageData; // 선택 — 있을 수도, 없을 수도
  href: string;
}

// [0] = 헤드라인(이미지 보유). 나머지는 우측 카드.
export const CHURCH_NEWS_POSTS: ChurchNewsPost[] = [
  {
    tag: '공지',
    title: '여름 단기선교 신청 접수 시작',
    date: '2026.05.20',
    excerpt: '7월 청년부 단기선교 팀원을 모집합니다. 신청은 5월 31일까지 받습니다.',
    image: dep07Img,
    href: '/news',
  },
  {
    tag: '소식',
    title: '청년부 봄 수련회 현장 스케치',
    date: '2026.05.18',
    excerpt: '지난 주말 양평에서 진행된 청년부 봄 수련회 현장을 사진으로 전합니다.',
    image: dep03Img,
    href: '/news',
  },
  {
    tag: '소식',
    title: '새가족 환영회 5월 둘째 주 진행',
    date: '2026.05.12',
    excerpt: '새로 등록하신 가족을 환영하는 자리입니다. 1부 예배 후 카페에서 모입니다.',
    href: '/news',
  },
  {
    tag: '교육',
    title: '여름 성경학교 교사 모집',
    date: '2026.05.10',
    excerpt: '다음세대 여름 성경학교를 함께 섬길 교사를 모집합니다.',
    href: '/news',
  },
  {
    tag: '행사',
    title: '전교인 체육대회 안내',
    date: '2026.05.06',
    excerpt: '6월 첫째 주 토요일, 온 교우가 함께하는 체육대회로 모입니다.',
    image: dep04Img,
    href: '/news',
  },
  {
    tag: '행사',
    title: '교회 창립 47주년 감사예배',
    date: '2026.05.04',
    excerpt: '4월 18일 토요일 오후 2시, 본당에서 창립 감사예배로 모였습니다.',
    image: dep08Img,
    href: '/news',
  },
  {
    tag: '공지',
    title: '지하 주차장 보수 공사 안내',
    date: '2026.04.28',
    excerpt: '5월 중 지하 주차장 보수 공사가 진행됩니다. 지상 주차장을 이용해 주세요.',
    href: '/news',
  },
  {
    tag: '소식',
    title: '교회 도서관 신간 입고 안내',
    date: '2026.04.30',
    excerpt: '교회 도서관에 신앙 서적 신간이 입고되었습니다.',
    image: dep02Img,
    href: '/news',
  },
];

/** 태그 칩 색 — b1 토큰만. */
export const tagColor: Record<NewsTag, string> = {
  공지: 'bg-b1-accent text-b1-bg',
  소식: 'bg-b1-accent2 text-b1-bg',
  교육: 'bg-b1-accent-soft text-b1-accent',
  행사: 'bg-b1-text text-b1-bg',
};

/** '더 보기 +N' 표시용 placeholder 전체 건수. */
export const NEWS_TOTAL = 32;
