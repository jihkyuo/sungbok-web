import { PastorIntro } from '@/domains/about/components/widgets/PastorIntro';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '담임목사 | 성복교회' };

export default function Page() {
  return <PastorIntro />;
}
