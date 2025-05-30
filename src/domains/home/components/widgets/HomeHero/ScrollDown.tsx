'use client';

import { ScrollDownButton } from '@/shared/components/features/ScrollDownButton';

export const ScrollDown = () => {
  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <ScrollDownButton
      className={'absolute bottom-10 left-1/2 -translate-x-1/2'}
      onClick={handleScrollDown}
    />
  );
};
