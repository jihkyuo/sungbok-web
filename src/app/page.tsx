import { DepartmentsSection } from '@/domains/home/components/widgets/DepartmentsSection';
import { HomeBanner } from '@/domains/home/components/widgets/HomeBanner';
import { WorshipVideoSection } from '@/domains/home/components/widgets/WorshipVideoSection';

export default function Home() {
  return (
    <>
      <HomeBanner />
      <WorshipVideoSection />
      <DepartmentsSection />

      <p className="h-[10000px]">long scroll</p>
    </>
  );
}
