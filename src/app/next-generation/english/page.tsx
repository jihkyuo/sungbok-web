import { DepartmentPage } from '@/domains/next-generation/components/widgets/DepartmentPage';
import { DEPARTMENTS } from '@/domains/next-generation/data/departments';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '영어예배부 | 성복교회' };

export default function Page() {
  const { dept, photos } = DEPARTMENTS['english'];
  return <DepartmentPage dept={dept} photos={photos} />;
}
