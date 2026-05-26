// 임시 시안 공용 목업 — 확정 후 RecentSermons/_variants 폴더째 삭제.
import type { StaticImageData } from 'next/image';

import dep01 from '@/assets/images/main/department/dep01.jpg';
import dep03 from '@/assets/images/main/department/dep03.jpg';
import dep05 from '@/assets/images/main/department/dep05.jpg';
import dep07 from '@/assets/images/main/department/dep07.jpg';
import dep09 from '@/assets/images/main/department/dep09.jpg';
import main01 from '@/assets/images/main/main01.jpg';
import worship from '@/assets/images/main/worship.jpg';

/**
 * 청년 예배 앰비언트 영상 — 효과 시연용 stand-in(CC0). 실제 청년 예배 영상으로 교체 예정.
 * <video> 픽셀 접근이 필요한 효과(듀오톤·마스크·스크럽·cover)를 모든 시안에서 동일하게
 * 보여주기 위해 유튜브 임베드 대신 파일 소스를 쓴다. 교체 시 이 상수만 바꾸면 됨.
 */
export const STANDIN_VIDEO = 'https://mdn.github.io/shared-assets/videos/flower.mp4';
/** 현재 홈에 박혀 있는 유튜브 임베드(참고용) */
export const YOUTH_VIDEO_EMBED =
  'https://www.youtube.com/embed/HYruCseVKZo?autoplay=1&mute=1&controls=0&loop=1&playlist=HYruCseVKZo&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1';

/** 설교 아카이브 라우트 */
export const ARCHIVE_HREF = '/worship-video';

/** 청년부 유튜브 채널 (외부 링크) — 실제 채널 URL로 교체 예정 */
export const YOUTH_CHANNEL_HREF = 'https://www.youtube.com/';

export const YOUTH = {
  team: '청년부 예배팀',
  date: '2026.05.03',
  schedule: '매주 토요일 오후 7시',
  place: '비전홀',
};

export const LATEST_SERMON = {
  date: '2026.05.04',
  preacher: '이요셉 담임목사',
  title: '두려워하지 말라',
  scripture: '이사야 41:10',
  series: '말씀과 함께',
};

/** 메인 포스터(정지 이미지) — video poster 및 설교 유도부 이미지로 재사용 */
export const POSTER = worship;
export const POSTER_ALT = main01;

export type Still = { img: StaticImageData; date: string; title: string; scripture: string };
/** 아카이브 티저용 설교 목록(마퀴·벤토) — 실제 설교 메타로 교체 가능 */
export const SERMON_STILLS: Still[] = [
  { img: worship, date: '2026.05.04', title: '두려워하지 말라', scripture: '이사야 41:10' },
  { img: dep01, date: '2026.04.27', title: '광야를 지나는 걸음', scripture: '신명기 8:2' },
  { img: dep03, date: '2026.04.20', title: '다시 빚으시는 손', scripture: '예레미야 18:4' },
  { img: dep05, date: '2026.04.13', title: '머무는 사랑', scripture: '요한복음 15:9' },
  { img: dep07, date: '2026.04.06', title: '낮은 곳의 빛', scripture: '마태복음 5:14' },
  { img: dep09, date: '2026.03.30', title: '잠잠히 아는 자리', scripture: '시편 46:10' },
];
