// HomeLead 사진 띠 — 교회 안 실제 모습(부서 활동컷). 세대·장면이 번갈아 나오게 배열.
import dep01 from '@/assets/images/main/department/dep01.webp';
import dep02 from '@/assets/images/main/department/dep02.webp';
import dep03 from '@/assets/images/main/department/dep03.webp';
import dep04 from '@/assets/images/main/department/dep04.webp';
import dep05 from '@/assets/images/main/department/dep05.webp';
import dep06 from '@/assets/images/main/department/dep06.webp';
import dep07 from '@/assets/images/main/department/dep07.webp';
import dep08 from '@/assets/images/main/department/dep08.webp';
import dep09 from '@/assets/images/main/department/dep09.webp';
import worship from '@/assets/images/main/worship.webp';

/** 찬양·유아·야외·단체·풍선·청년·유치부·예배·초등 */
export const FLOW_PHOTOS = [dep05, dep01, dep09, dep03, dep02, dep06, dep07, dep04, dep08];

/** 셋째 줄 — 예배 전경 1장 추가, 위 두 줄과 다른 순서 */
export const THIRD_PHOTOS = [
  worship,
  dep04,
  dep08,
  dep05,
  dep02,
  dep07,
  dep01,
  dep09,
  dep06,
  dep03,
];
