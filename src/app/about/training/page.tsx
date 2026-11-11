import { TrainingPath } from '@/domains/about/components/widgets/TrainingPath';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '양육·훈련 | 성복교회' };

export default function Page() {
  return <TrainingPath />;
}
