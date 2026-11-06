import { SectionShell } from '@/shared/components/layout/SectionShell';
import type { PropsWithChildren } from 'react';

export default function AboutLayout({ children }: PropsWithChildren) {
  return <SectionShell section="about">{children}</SectionShell>;
}
