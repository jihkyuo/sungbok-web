import { StickyTitle } from '@/domains/home/components/widgets/WorshipTimeTable/StickyTitle';
import { WorshipSection } from '@/domains/home/components/widgets/WorshipTimeTable/WorshipSection';

export const WorshipTimeTable = () => {
  return (
    <div className="mx-20 my-40 flex rounded-[45px] border-1 bg-gray-50 px-20 py-30 shadow-lg">
      <StickyTitle />
      <WorshipSection />
    </div>
  );
};
