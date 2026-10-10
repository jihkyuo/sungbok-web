import { SectionShell } from '@/shared/components/layout/SectionShell';
import type { PropsWithChildren } from 'react';

export default function NextGenerationLayout({ children }: PropsWithChildren) {
  return <SectionShell section="next-generation">{children}</SectionShell>;
}
