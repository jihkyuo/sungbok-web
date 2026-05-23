/**
 * 히어로 4단계 데이터.
 *
 * 외관(0) → 내부(1) → 예배(2) → 담임목사(3) 순서대로, 각 단계의 카피와
 * 이미지를 정의한다. 미확보 사진은 image 없이 placeholder 키로 표시.
 *
 * 카피는 placeholder — 실 카피는 담임목사·사무국 검수 필요.
 */

import type { StaticImageData } from 'next/image';

import mainExterior from '@/assets/images/main/main01.jpg';
// 다음 3장은 촬영 후 import 활성화:
// import mainInterior from '@/assets/images/main/main02.jpg';
// import mainWorship from '@/assets/images/main/main03.jpg';
// import mainPastor from '@/assets/images/main/pastor.jpg';

export interface HeroStage {
  id: string;
  label: string;
  image?: StaticImageData;
  placeholder?: 'interior' | 'worship' | 'pastor';
  headlineTop: string;
  headlineHighlight: string;
  headlineRest: string;
  sub: string;
}

export const HERO_STAGES: HeroStage[] = [
  {
    id: 'exterior',
    label: '외관',
    image: mainExterior,
    headlineTop: '처음 오신 분의',
    headlineHighlight: '자리',
    headlineRest: ', 그대로.',
    sub: '대한예수교장로회 ○○ · 1979년 창립 · 동대문 장안동.\n오늘 처음 와 보셔도, 자리는 비워두었습니다.',
  },
  {
    id: 'interior',
    label: '내부',
    // image: mainInterior,
    placeholder: 'interior',
    headlineTop: '본당의',
    headlineHighlight: '자리',
    headlineRest: ', 비워두었습니다.',
    sub: '주일 1·2·3·4부 · 약 70분 · 예루살렘성전 3F.',
  },
  {
    id: 'worship',
    label: '예배',
    // image: mainWorship,
    placeholder: 'worship',
    headlineTop: '함께 부르는',
    headlineHighlight: '자리',
    headlineRest: ', 그대로.',
    sub: '5월 24일 주일 · 이사야 41장.',
  },
  {
    id: 'pastor',
    label: '담임목사',
    // image: mainPastor,
    placeholder: 'pastor',
    headlineTop: '기다리는',
    headlineHighlight: '자리',
    headlineRest: ', 그대로.',
    sub: '○○○ 담임목사 · 1985년부터 함께.',
  },
];
