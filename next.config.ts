import type { NextConfig } from 'next';
import { buildRedirects } from './src/shared/config/siteNav';

const nextConfig: NextConfig = {
  // next/image 변환기(/_next/image)는 쓰지 않는다 — 레포 사진은 미리 만든 크기 파일(<Photo>),
  // 유튜브 썸네일은 유튜브의 크기별 주소(<YoutubeThumb>)로 받는다(ADR 0013). 외부 주소 허용 목록도 두지 않는다.
  output: 'standalone',
  // 상위 메뉴 → 첫 하위, 레거시 경로 → 새 경로. 목록은 siteNav 에서 파생(siteNav.test.ts 가 검증).
  async redirects() {
    return buildRedirects();
  },
};

export default nextConfig;
