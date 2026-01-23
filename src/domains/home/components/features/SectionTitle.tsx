import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  subtitle: ReactNode;
}

export const SectionTitle = ({ title, subtitle }: Props) => {
  return (
    <div className={'flex flex-col gap-3 font-bold tracking-wide'}>
      <h3 className={'text-xl text-blue-600 sm:text-2xl'}>{subtitle}</h3>
      <h2 className={'text-3xl sm:text-4xl md:text-5xl text-gray-900'}>{title}</h2>
    </div>
  );
};
