import { SectionShell } from '@/shared/components/layout/SectionShell';
import type { PropsWithChildren } from 'react';

export default function WorshipLayout({ children }: PropsWithChildren) {
  return <SectionShell section="worship">{children}</SectionShell>;
}
