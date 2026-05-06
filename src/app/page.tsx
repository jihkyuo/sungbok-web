import { CommunityGallery } from '@/domains/home/components/widgets/CommunityGallery';
import { HomeHero } from '@/domains/home/components/widgets/HomeHero';
import { LocationMap } from '@/domains/home/components/widgets/LocationMap';
import { RecentSermons } from '@/domains/home/components/widgets/RecentSermons';
import { VisitorAndNews } from '@/domains/home/components/widgets/VisitorAndNews';
import { WorshipTimes } from '@/domains/home/components/widgets/WorshipTimes';

export default function Home() {
  return (
    <>
      <HomeHero />
      <WorshipTimes />
      <RecentSermons />
      <CommunityGallery />
      <VisitorAndNews />
      <LocationMap />
    </>
  );
}
