import { SectionShell } from '@/shared/components/layout/SectionShell';
import type { PropsWithChildren } from 'react';

export default function NewsLayout({ children }: PropsWithChildren) {
  return <SectionShell section="news">{children}</SectionShell>;
}
