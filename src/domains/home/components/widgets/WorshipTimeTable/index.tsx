import { WorshipTimeTableMini } from '@/domains/home/components/widgets/WorshipTimeTable/WorshipTimeTableMini';
import { WorshipTimeTableWide } from '@/domains/home/components/widgets/WorshipTimeTable/WorshipTimeTableWide';

export const WorshipTimeTable = () => {
  return (
    <>
      <div className={'hidden lg:block'}>
        <WorshipTimeTableWide />
      </div>

      <div className={'block lg:hidden'}>
        <WorshipTimeTableMini />
      </div>
    </>
  );
};
