import { DesignShowcase } from '@/app/design/_sections/DesignShowcase';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: '디자인 견본 | 성복교회',
  robots: { index: false, follow: false },
};

/**
 * 디자인 견본 — 개발할 때만 열린다(운영 빌드에서는 404). 넘겨받는 사람의 첫 입구.
 * 정본 문서: .md/design/design-system.md · .md/design/color-palette.md
 */
export default function DesignPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <DesignShowcase />;
}
