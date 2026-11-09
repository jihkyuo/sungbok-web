// 다음세대 8부서 페이지 데이터(라우트 slug 순, siteNav 와 동일). 한 위젯(DepartmentPage)에 이 데이터만 바꿔 꽂는다(ADR 0007).
// 사실(나이·예배 요일/시간/장소·담당·직함)은 worshipTimes.ts·staff.ts·ministries.ts(기존 사이트, 2026-10 수집)와 같은 출처.
//   · 유년부/초등부 학년 구분과 영어예배부 대상 연령은 아직 부서 확인 전 — 취합 시 교정.
// 소개 문단·인사말·안내 한 줄·사진은 부서 취합 전 **샘플** — 사진은 홈 부서 컷 9장 + 레거시 영아부 3장 + 메인 3장을 돌려 쓴다(중복 허용).
// 순수 데이터 파일이라 함수를 두지 않는다.

import dep01 from '@/assets/images/main/department/dep01.webp';
import dep02 from '@/assets/images/main/department/dep02.webp';
import dep03 from '@/assets/images/main/department/dep03.webp';
import dep04 from '@/assets/images/main/department/dep04.webp';
import dep05 from '@/assets/images/main/department/dep05.webp';
import dep06 from '@/assets/images/main/department/dep06.webp';
import dep07 from '@/assets/images/main/department/dep07.webp';
import dep08 from '@/assets/images/main/department/dep08.webp';
import dep09 from '@/assets/images/main/department/dep09.webp';
import inf01 from '@/assets/images/next-generation/infant/standin-01-worship.webp';
import inf02 from '@/assets/images/next-generation/infant/standin-02-group.webp';
import inf03 from '@/assets/images/next-generation/infant/standin-03-event.webp';
import worship from '@/assets/images/main/worship.webp';
import main01 from '@/assets/images/main/main01.webp';
import firstVisit from '@/assets/images/main/first-visit.webp';
import leeJinhee from '@/assets/images/staff/lee-jinhee.webp';
import leeOkgeun from '@/assets/images/staff/lee-okgeun.webp';
import leeMyunghwa from '@/assets/images/staff/lee-myunghwa.webp';
import chunJihyun from '@/assets/images/staff/chun-jihyun.webp';
import choiJuchan from '@/assets/images/staff/choi-juchan.webp';
import choiWonjae from '@/assets/images/staff/choi-wonjae.webp';
import parkByungwook from '@/assets/images/staff/park-byungwook.webp';
import kimJunghan from '@/assets/images/staff/kim-junghan.webp';

import type { Department, Photo } from '../components/widgets/DepartmentPage/types';

export type DepartmentSlug =
  | 'infant'
  | 'kindergarten'
  | 'lower-elementary'
  | 'elementary'
  | 'middle'
  | 'high'
  | 'young-adult'
  | 'english';

export const DEPARTMENTS: Record<DepartmentSlug, { dept: Department; photos: Photo[] }> = {
  infant: {
    dept: {
      name: '영아부',
      ages: '1~4세',
      tagline: '믿음의 씨앗을 심는 곳',
      intro:
        '영아부는 1세부터 4세까지의 아이들이 부모와 함께 예배하는 부서입니다. 주일 오전 11시 30분 사랑성전 1층에서 모이며, 예배 뒤에는 또래 아이들과 어울리는 시간이 있습니다.',
      worship: { day: '주일', time: '오전 11:30', place: '사랑성전 1F' },
      staff: [
        {
          name: '이진희',
          role: '간사',
          photo: leeJinhee,
          greeting:
            '영아부는 아이와 부모가 함께 예배하는 자리입니다. 처음 오시는 가정도 같은 자리에서 예배합니다.',
        },
      ],
      extra: '처음 오는 가정을 위한 안내 한 줄(도착 시각·입구)',
    },
    photos: [
      { id: 'p01', src: inf01, alt: '영아부 사진 샘플 1' },
      { id: 'p02', src: inf02, alt: '영아부 사진 샘플 2' },
      { id: 'p03', src: inf03, alt: '영아부 사진 샘플 3' },
      { id: 'p04', src: worship, alt: '영아부 사진 샘플 4' },
      { id: 'p05', src: main01, alt: '영아부 사진 샘플 5' },
      { id: 'p06', src: firstVisit, alt: '영아부 사진 샘플 6' },
      { id: 'p07', src: dep01, alt: '영아부 사진 샘플 7' },
      { id: 'p08', src: dep02, alt: '영아부 사진 샘플 8' },
      { id: 'p09', src: dep03, alt: '영아부 사진 샘플 9' },
      { id: 'p10', src: dep04, alt: '영아부 사진 샘플 10' },
      { id: 'p11', src: dep05, alt: '영아부 사진 샘플 11' },
      { id: 'p12', src: dep06, alt: '영아부 사진 샘플 12' },
    ],
  },
  kindergarten: {
    dept: {
      name: '유치부',
      ages: '5~7세',
      tagline: '말씀으로 견고한 믿음',
      intro:
        '유치부는 5세부터 7세까지의 아이들이 모이는 부서입니다. 주일 오전 11시 30분 믿음성전 2층에서 예배하며, 예배 뒤 반별로 모여 그날 말씀을 나눕니다.',
      worship: { day: '주일', time: '오전 11:30', place: '믿음성전 2F' },
      staff: [
        { name: '이옥근', role: '간사', photo: leeOkgeun },
        { name: '이명화', role: '간사', photo: leeMyunghwa },
      ],
      extra: '처음 오는 가정을 위한 안내 한 줄(도착 시각·입구)',
    },
    photos: [
      { id: 'p01', src: dep02, alt: '유치부 사진 샘플 1' },
      { id: 'p02', src: dep03, alt: '유치부 사진 샘플 2' },
      { id: 'p03', src: dep04, alt: '유치부 사진 샘플 3' },
      { id: 'p04', src: dep05, alt: '유치부 사진 샘플 4' },
      { id: 'p05', src: dep06, alt: '유치부 사진 샘플 5' },
      { id: 'p06', src: dep07, alt: '유치부 사진 샘플 6' },
      { id: 'p07', src: dep08, alt: '유치부 사진 샘플 7' },
      { id: 'p08', src: dep09, alt: '유치부 사진 샘플 8' },
      { id: 'p09', src: inf01, alt: '유치부 사진 샘플 9' },
      { id: 'p10', src: inf02, alt: '유치부 사진 샘플 10' },
      { id: 'p11', src: inf03, alt: '유치부 사진 샘플 11' },
      { id: 'p12', src: worship, alt: '유치부 사진 샘플 12' },
    ],
  },
  'lower-elementary': {
    dept: {
      name: '유년부',
      ages: '초등 1~3학년',
      tagline: '하나님의 가치관으로',
      intro:
        '유년부는 초등학교 1학년부터 3학년까지의 어린이가 모이는 부서입니다. 주일 오전 11시 30분 소망성전 2층에서 예배하며, 예배 뒤 반별 모임이 있습니다.',
      worship: { day: '주일', time: '오전 11:30', place: '소망성전 2F' },
      staff: [{ name: '천지현', role: '간사', photo: chunJihyun }],
      extra: '처음 오는 가정을 위한 안내 한 줄(도착 시각·입구)',
    },
    photos: [
      { id: 'p01', src: dep03, alt: '유년부 사진 샘플 1' },
      { id: 'p02', src: dep04, alt: '유년부 사진 샘플 2' },
      { id: 'p03', src: dep05, alt: '유년부 사진 샘플 3' },
      { id: 'p04', src: dep06, alt: '유년부 사진 샘플 4' },
      { id: 'p05', src: dep07, alt: '유년부 사진 샘플 5' },
      { id: 'p06', src: dep08, alt: '유년부 사진 샘플 6' },
      { id: 'p07', src: dep09, alt: '유년부 사진 샘플 7' },
      { id: 'p08', src: inf01, alt: '유년부 사진 샘플 8' },
      { id: 'p09', src: inf02, alt: '유년부 사진 샘플 9' },
      { id: 'p10', src: inf03, alt: '유년부 사진 샘플 10' },
      { id: 'p11', src: worship, alt: '유년부 사진 샘플 11' },
      { id: 'p12', src: main01, alt: '유년부 사진 샘플 12' },
    ],
  },
  elementary: {
    dept: {
      name: '초등부',
      ages: '초등 4~6학년',
      tagline: '하나님을 기뻐하는 아이',
      intro:
        '초등부는 초등학교 4학년부터 6학년까지의 어린이가 모이는 부서입니다. 주일 오전 11시 30분 화평성전 4층에서 예배하며, 예배 뒤 반별 모임이 있습니다.',
      worship: { day: '주일', time: '오전 11:30', place: '화평성전 4F' },
      staff: [{ name: '최주찬', role: '전도사', photo: choiJuchan }],
      extra: '처음 오는 가정을 위한 안내 한 줄(도착 시각·입구)',
    },
    photos: [
      { id: 'p01', src: dep04, alt: '초등부 사진 샘플 1' },
      { id: 'p02', src: dep05, alt: '초등부 사진 샘플 2' },
      { id: 'p03', src: dep06, alt: '초등부 사진 샘플 3' },
      { id: 'p04', src: dep07, alt: '초등부 사진 샘플 4' },
      { id: 'p05', src: dep08, alt: '초등부 사진 샘플 5' },
      { id: 'p06', src: dep09, alt: '초등부 사진 샘플 6' },
      { id: 'p07', src: inf01, alt: '초등부 사진 샘플 7' },
      { id: 'p08', src: inf02, alt: '초등부 사진 샘플 8' },
      { id: 'p09', src: inf03, alt: '초등부 사진 샘플 9' },
      { id: 'p10', src: worship, alt: '초등부 사진 샘플 10' },
      { id: 'p11', src: main01, alt: '초등부 사진 샘플 11' },
      { id: 'p12', src: firstVisit, alt: '초등부 사진 샘플 12' },
    ],
  },
  middle: {
    dept: {
      name: '중등부',
      ages: '중학생',
      tagline: '은혜가 흐르는 공동체',
      intro:
        '중등부는 중학생이 모이는 부서입니다. 주일 오전 11시 30분 벧엘성전 4층에서 예배하며, 예배 뒤 반별로 모여 말씀을 나눕니다.',
      worship: { day: '주일', time: '오전 11:30', place: '벧엘성전 4F' },
      staff: [{ name: '최원재', role: '목사', photo: choiWonjae }],
      extra: '처음 오는 가정을 위한 안내 한 줄(도착 시각·입구)',
    },
    photos: [
      { id: 'p01', src: dep05, alt: '중등부 사진 샘플 1' },
      { id: 'p02', src: dep06, alt: '중등부 사진 샘플 2' },
      { id: 'p03', src: dep07, alt: '중등부 사진 샘플 3' },
      { id: 'p04', src: dep08, alt: '중등부 사진 샘플 4' },
      { id: 'p05', src: dep09, alt: '중등부 사진 샘플 5' },
      { id: 'p06', src: inf01, alt: '중등부 사진 샘플 6' },
      { id: 'p07', src: inf02, alt: '중등부 사진 샘플 7' },
      { id: 'p08', src: inf03, alt: '중등부 사진 샘플 8' },
      { id: 'p09', src: worship, alt: '중등부 사진 샘플 9' },
      { id: 'p10', src: main01, alt: '중등부 사진 샘플 10' },
      { id: 'p11', src: firstVisit, alt: '중등부 사진 샘플 11' },
      { id: 'p12', src: dep01, alt: '중등부 사진 샘플 12' },
    ],
  },
  high: {
    dept: {
      name: '고등부',
      ages: '고등학생',
      tagline: '주신 비전을 가지고',
      intro:
        '고등부는 고등학생이 모이는 부서입니다. 주일 오전 9시 벧엘성전 4층에서 예배하며, 예배 뒤 반별로 모여 말씀을 나눕니다.',
      worship: { day: '주일', time: '오전 9:00', place: '벧엘성전 4F' },
      staff: [{ name: '박병욱', role: '목사', photo: parkByungwook }],
      extra: '처음 오는 가정을 위한 안내 한 줄(도착 시각·입구)',
    },
    photos: [
      { id: 'p01', src: dep06, alt: '고등부 사진 샘플 1' },
      { id: 'p02', src: dep07, alt: '고등부 사진 샘플 2' },
      { id: 'p03', src: dep08, alt: '고등부 사진 샘플 3' },
      { id: 'p04', src: dep09, alt: '고등부 사진 샘플 4' },
      { id: 'p05', src: inf01, alt: '고등부 사진 샘플 5' },
      { id: 'p06', src: inf02, alt: '고등부 사진 샘플 6' },
      { id: 'p07', src: inf03, alt: '고등부 사진 샘플 7' },
      { id: 'p08', src: worship, alt: '고등부 사진 샘플 8' },
      { id: 'p09', src: main01, alt: '고등부 사진 샘플 9' },
      { id: 'p10', src: firstVisit, alt: '고등부 사진 샘플 10' },
      { id: 'p11', src: dep01, alt: '고등부 사진 샘플 11' },
      { id: 'p12', src: dep02, alt: '고등부 사진 샘플 12' },
    ],
  },
  'young-adult': {
    dept: {
      name: '청년부',
      ages: '20~30대',
      tagline: '함께 지어져 가는 공동체',
      intro:
        '청년부는 20대와 30대 청년이 모이는 부서입니다. 주일 오후 1시 30분 예루살렘성전 3층에서 예배하며, 예배 뒤 소그룹으로 모입니다.',
      worship: { day: '주일', time: '오후 1:30', place: '예루살렘성전 3F' },
      staff: [{ name: '김정한', role: '목사', photo: kimJunghan }],
      extra: '처음 오는 가정을 위한 안내 한 줄(도착 시각·입구)',
    },
    photos: [
      { id: 'p01', src: dep08, alt: '청년부 사진 샘플 1' },
      { id: 'p02', src: dep09, alt: '청년부 사진 샘플 2' },
      { id: 'p03', src: inf01, alt: '청년부 사진 샘플 3' },
      { id: 'p04', src: inf02, alt: '청년부 사진 샘플 4' },
      { id: 'p05', src: inf03, alt: '청년부 사진 샘플 5' },
      { id: 'p06', src: worship, alt: '청년부 사진 샘플 6' },
      { id: 'p07', src: main01, alt: '청년부 사진 샘플 7' },
      { id: 'p08', src: firstVisit, alt: '청년부 사진 샘플 8' },
      { id: 'p09', src: dep01, alt: '청년부 사진 샘플 9' },
      { id: 'p10', src: dep02, alt: '청년부 사진 샘플 10' },
      { id: 'p11', src: dep03, alt: '청년부 사진 샘플 11' },
      { id: 'p12', src: dep04, alt: '청년부 사진 샘플 12' },
    ],
  },
  english: {
    dept: {
      name: '영어예배부',
      ages: '초등 1학년 ~ 고등 3학년',
      tagline: '복음을 전할 일꾼',
      intro:
        '영어예배부는 영어로 예배하고 성경을 배우는 부서입니다. 주일 오후 2시 벧엘성전 4층에서 모이며, 한국어 예배가 낯선 가정의 자녀도 함께합니다.',
      worship: { day: '주일', time: '오후 2:00', place: '벧엘성전 4F' },
      staff: [{ name: '최주찬', role: '전도사', photo: choiJuchan }],
      extra: '처음 오는 가정을 위한 안내 한 줄(도착 시각·입구)',
    },
    photos: [
      { id: 'p01', src: dep07, alt: '영어예배부 사진 샘플 1' },
      { id: 'p02', src: dep08, alt: '영어예배부 사진 샘플 2' },
      { id: 'p03', src: dep09, alt: '영어예배부 사진 샘플 3' },
      { id: 'p04', src: inf01, alt: '영어예배부 사진 샘플 4' },
      { id: 'p05', src: inf02, alt: '영어예배부 사진 샘플 5' },
      { id: 'p06', src: inf03, alt: '영어예배부 사진 샘플 6' },
      { id: 'p07', src: worship, alt: '영어예배부 사진 샘플 7' },
      { id: 'p08', src: main01, alt: '영어예배부 사진 샘플 8' },
      { id: 'p09', src: firstVisit, alt: '영어예배부 사진 샘플 9' },
      { id: 'p10', src: dep01, alt: '영어예배부 사진 샘플 10' },
      { id: 'p11', src: dep02, alt: '영어예배부 사진 샘플 11' },
      { id: 'p12', src: dep03, alt: '영어예배부 사진 샘플 12' },
    ],
  },
};
