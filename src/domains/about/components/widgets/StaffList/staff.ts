// 교회소개 › 섬기는 이들 명단. 기존 사이트 「섬기는 이들」 게시판(bo_table=0104, 2026-10-25 수집) 원문 순서·표기 그대로.
// 사진은 같은 게시판 원본을 최대 1000px JPEG 로 정리해 assets/images/staff 에 둔 것.
// 단 이원효·임경일·최미정·최주찬·이진희·이명화·천지현 7장은 게시판에 275×350 썸네일만 있어 저해상도 그대로(실사진 수신 시 교체).
import choJunghan from '@/assets/images/staff/cho-junghan.webp';
import choiJuchan from '@/assets/images/staff/choi-juchan.webp';
import choiMijung from '@/assets/images/staff/choi-mijung.webp';
import choiWonjae from '@/assets/images/staff/choi-wonjae.webp';
import chunJihyun from '@/assets/images/staff/chun-jihyun.webp';
import jungHwakyung from '@/assets/images/staff/jung-hwakyung.webp';
import kimJunghan from '@/assets/images/staff/kim-junghan.webp';
import kimMinki from '@/assets/images/staff/kim-minki.webp';
import leeJinhee from '@/assets/images/staff/lee-jinhee.webp';
import leeMyunghwa from '@/assets/images/staff/lee-myunghwa.webp';
import leeOkgeun from '@/assets/images/staff/lee-okgeun.webp';
import leeWonhyo from '@/assets/images/staff/lee-wonhyo.webp';
import limKyungil from '@/assets/images/staff/lim-kyungil.webp';
import parkByungwook from '@/assets/images/staff/park-byungwook.webp';
import shimHeungsook from '@/assets/images/staff/shim-heungsook.webp';
import shinMija from '@/assets/images/staff/shin-mija.webp';
import yangYoungbok from '@/assets/images/staff/yang-youngbok.webp';
import type { StaticImageData } from 'next/image';

export interface StaffMember {
  readonly name: string;
  /** 담당 — 기존 사이트 표기 그대로(교구·부서·직무). */
  readonly duties: readonly string[];
  readonly photo: StaticImageData;
}

export interface StaffGroup {
  readonly id: string;
  /** 직함(목사·전도사·간사). 카드마다 이름 옆 직함·사진 alt 가 이 값을 쓴다. */
  readonly title: '목사' | '전도사' | '간사';
  readonly members: readonly StaffMember[];
}

export const STAFF_GROUPS: readonly StaffGroup[] = [
  {
    id: 'pastors',
    title: '목사',
    members: [
      { name: '이원효', duties: ['수석목사', '4교구'], photo: leeWonhyo },
      { name: '조정한', duties: ['5교구', '실버대학', '미디어'], photo: choJunghan },
      { name: '김정한', duties: ['교육부 총괄', '청년부'], photo: kimJunghan },
      { name: '김민기', duties: ['2교구'], photo: kimMinki },
      { name: '박병욱', duties: ['3교구', '고등부'], photo: parkByungwook },
      { name: '최원재', duties: ['1교구', '중등부'], photo: choiWonjae },
      { name: '임경일', duties: ['찬양 디렉터'], photo: limKyungil },
    ],
  },
  {
    id: 'evangelists',
    title: '전도사',
    members: [
      { name: '최미정', duties: ['1-6교구'], photo: choiMijung },
      { name: '최주찬', duties: ['초등부', '영어예배부'], photo: choiJuchan },
    ],
  },
  {
    id: 'coordinators',
    title: '간사',
    members: [
      { name: '심흥숙', duties: ['1교구'], photo: shimHeungsook },
      { name: '양영복', duties: ['2교구'], photo: yangYoungbok },
      { name: '정화경', duties: ['3교구'], photo: jungHwakyung },
      { name: '이옥근', duties: ['4교구', '유치부 부장'], photo: leeOkgeun },
      { name: '신미자', duties: ['5교구'], photo: shinMija },
      { name: '이진희', duties: ['영아부', '행정'], photo: leeJinhee },
      { name: '이명화', duties: ['유치부'], photo: leeMyunghwa },
      { name: '천지현', duties: ['유년부', '예배지원'], photo: chunJihyun },
    ],
  },
];
