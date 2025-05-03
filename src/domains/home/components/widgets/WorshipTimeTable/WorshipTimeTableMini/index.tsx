import { WorshipTimeTableRecord } from '@/domains/home/components/widgets/WorshipTimeTable/model/data';
import { WorshipTimeCardGroup } from '@/domains/home/components/widgets/WorshipTimeTable/WorshipTimeTableMini/WorshipTimeCardGroup';

export const WorshipTimeTableMini = () => {
  return (
    <div className={'my-30 px-5'}>
      <h2 className={'text-4xl font-bold text-center'}>예배시간 안내</h2>

      <div className={'flex flex-col gap-20 mt-15 '}>
        <WorshipTimeCardGroup title="장년 예배" items={WorshipTimeTableRecord.adultWorship} />
        <WorshipTimeCardGroup title="다음세대 예배" items={WorshipTimeTableRecord.nextGenerationMini} />
      </div>
    </div>
  );
};
