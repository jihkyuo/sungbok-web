import { PastorIntro } from '@/domains/about/components/widgets/PastorIntro';
import { PASTOR_EMERITUS } from '@/domains/about/components/widgets/PastorIntro/pastors';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '원로목사 | 성복교회' };

export default function Page() {
  return <PastorIntro pastor={PASTOR_EMERITUS} />;
}
