import type { NextConfig } from 'next';
import { buildRedirects } from './src/shared/config/siteNav';

const nextConfig: NextConfig = {
  images: {
    // 원본은 이미 WebP(scripts/convert-images.mjs)로 줄여 두었고, next/image 는 화면 폭별 크기만 만든다.
    // Next 16 부터 허용 화질 기본값이 [75] 뿐이라, 코드에서 쓰는 85·90 을 명시해야 75 로 깎이지 않는다.
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
  output: 'standalone',
  // 상위 메뉴 → 첫 하위, 레거시 경로 → 새 경로. 목록은 siteNav 에서 파생(siteNav.test.ts 가 검증).
  async redirects() {
    return buildRedirects();
  },
};

export default nextConfig;
