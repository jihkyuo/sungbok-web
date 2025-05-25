import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  subtitle: ReactNode;
}

export const SectionTitle = ({ title, subtitle }: Props) => {
  return (
    <div className={'flex flex-col gap-3 font-bold tracking-wide'}>
      <h3 className={'text-2xl text-blue-600'}>{subtitle}</h3>
      <h2 className={'text-4xl'}>{title}</h2>
    </div>
  );
};
