import { DepartmentsSection } from '@/domains/home/components/widgets/DepartmentsSection';
import { HomeHero } from '@/domains/home/components/widgets/HomeHero';
import { VisionTitle } from '@/domains/home/components/widgets/VisionTitle';
import { WorshipTimeTable } from '@/domains/home/components/widgets/WorshipTimeTable';
import { WorshipVideoSection } from '@/domains/home/components/widgets/WorshipVideoSection';

export default function Home() {
  return (
    <>
      <HomeHero />
      <VisionTitle />
      <WorshipVideoSection />
      <WorshipTimeTable />
      <DepartmentsSection />

      <p className="h-[10000px]">long scroll</p>
    </>
  );
}
