import { StickyTitle } from '@/domains/home/components/widgets/WorshipTimeTable/WorshipTimeTableWide/StickyTitle';
import { WorshipSection } from '@/domains/home/components/widgets/WorshipTimeTable/WorshipTimeTableWide/WorshipSection';

export const WorshipTimeTableWide = () => {
  return (
    <div className="mx-20 my-40 rounded-[45px] border-1 bg-gray-50 px-20 py-30 shadow-lg sm:block lg:flex">
      <StickyTitle />
      <WorshipSection />
    </div>
  );
};
