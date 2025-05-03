import { WorshipTime } from '@/domains/home/components/widgets/WorshipTimeTable/types/WorshipTime';

export const WorshipTimeCard = ({ name, time, location }: WorshipTime) => {
  return (
    <div className={'rounded-lg bg-gray-50 p-4 shadow-md'}>
      <div className={'flex justify-between gap-6'}>
        <h3 className={'text-xl font-bold'}>{name}</h3>
        <p className={'font-semibold text-right'}>{time}</p>
      </div>

      <Divider />
      <div className={'flex justify-between'}>
        <p
          className={
            'flex items-center rounded-md bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-600'
          }
        >
          <span className={'mt-[-4px] mr-2 text-2xl'}>&#8226;</span> <span>{location}</span>
        </p>
      </div>
    </div>
  );
};

const Divider = () => {
  return <div className={'my-3 h-[1px] bg-gray-200'} />;
};
