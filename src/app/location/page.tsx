import { PagePlaceholder } from '@/shared/components/layout/PagePlaceholder';
import { SectionShell } from '@/shared/components/layout/SectionShell';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '찾아오시는 길 | 성복교회' };

export default function Page() {
  return (
    <SectionShell section="location">
      <PagePlaceholder />
    </SectionShell>
  );
}
