import {
  DepartmentDetail,
  ENGLISH_MINISTRY,
} from '@/domains/next-generation/components/widgets/DepartmentDetail';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '영어예배부 | 성복교회' };

export default function Page() {
  return <DepartmentDetail dept={ENGLISH_MINISTRY} />;
}
