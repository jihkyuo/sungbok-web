import { WorshipTable } from '@/domains/home/components/widgets/WorshipTimeTable/WorshipTable';
import { WorshipTimeTableRecord } from '@/domains/home/components/widgets/WorshipTimeTable/model/data';

export const WorshipSection = () => {
  return (
    <div className="flex flex-col flex-1 mt-10 gap-30">
      <WorshipTable title="장년 예배" items={WorshipTimeTableRecord.adultWorship} />
      <WorshipTable title="다음세대 예배" items={WorshipTimeTableRecord.nextGeneration} />
    </div>
  );
};
