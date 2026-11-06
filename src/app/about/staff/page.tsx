import { StaffList } from '@/domains/about/components/widgets/StaffList';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '섬기는 이들 | 성복교회' };

export default function Page() {
  return <StaffList />;
}
