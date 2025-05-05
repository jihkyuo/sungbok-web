import { DividerLine } from '@/components/features/DividerLine';
import { WorshipTime } from '@/domains/home/components/widgets/WorshipTimeTable/types/WorshipTime';
import { WorshipTimeCard } from '@/domains/home/components/widgets/WorshipTimeTable/WorshipTimeTableMini/WorshipTimeCard';
interface Props {
  title: string;
  items: WorshipTime[];
}

export const WorshipTimeCardGroup = ({ title, items }: Props) => {
  return (
    <div>
      <h2 className={'text-2xl font-bold'}>{title}</h2>
      <DividerLine className={'my-5'} />

      <div className={'flex flex-col gap-6'}>
        {items.map(item => (
          <WorshipTimeCard key={item.name} {...item} />
        ))}
      </div>
    </div>
  );
};
