import { BulletinPage } from '@/domains/news/components/widgets/BulletinPage';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '주보 | 성복교회' };

export default function Page() {
  return <BulletinPage />;
}
