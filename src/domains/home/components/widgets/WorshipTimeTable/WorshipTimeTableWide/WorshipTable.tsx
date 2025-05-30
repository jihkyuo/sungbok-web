import type { WorshipTime } from '@/domains/home/components/widgets/WorshipTimeTable/types/WorshipTime';
import type { TableColumn } from '@/shared/components/features/Table';
import { Table } from '@/shared/components/features/Table';

interface Props {
  title: string;
  items: WorshipTime[];
}

export const WorshipTable = ({ title, items }: Props) => {
  const columns: TableColumn<WorshipTime>[] = [
    {
      title: '예배명',
      row: row => row.name,
      rowOptions: {
        className: 'text-xl font-semibold',
      },
    },
    {
      title: '시간',
      row: row => row.time,
    },
    {
      title: '장소',
      row: row => row.location,
      rowOptions: {
        className: 'text-gray-500',
      },
    },
  ];

  return (
    <div>
      <WorshipCategoryTitle title={title} />
      <Table
        className={'mt-2'}
        dataSource={items}
        columns={columns}
        rowKey={row => row.name}
        columnsOptions={{
          className:
            'py-5 border-b-2 border-gray-400 text-lg text-center font-semibold text-gray-400',
        }}
        rowsOptions={{ className: 'py-5 font-semibold text-center whitespace-pre-wrap leading-8' }}
      />
    </div>
  );
};

interface WorshipCategoryTitleProps {
  title: string;
}

const WorshipCategoryTitle = ({ title }: WorshipCategoryTitleProps) => {
  return <h3 className="mb-6 text-2xl font-bold text-center text-blue-600">{title}</h3>;
};
