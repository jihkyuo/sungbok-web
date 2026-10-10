import type { NextConfig } from 'next';
import { buildRedirects } from './src/shared/config/siteNav';

const nextConfig: NextConfig = {
  images: {
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
