import type { PropsWithChildren } from 'react';

export const GridSection = ({ children }: PropsWithChildren) => {
  return <section className={'grid grid-cols-1 gap-10 pt-6 lg:grid-cols-2'}>{children}</section>;
};
