import { DepartmentsSection } from '@/domains/home/components/widgets/DepartmentsSection';
import { HomeBanner } from '@/domains/home/components/widgets/HomeBanner';

export default function Home() {
  return (
    <>
      <HomeBanner />
      <DepartmentsSection />

      <p className="h-[10000px]">long scroll</p>
    </>
  );
}
