import { throttle } from 'lodash-es';
import { useEffect, useState } from 'react';

interface Props {
  scrollThreshold?: number; // 스크롤 임계점 === 스크롤 위치
}

export const useIsScrolled = ({ scrollThreshold = 200 }: Props) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > scrollThreshold && !isScrolled) {
        setIsScrolled(true);
      } else if (currentScrollY <= scrollThreshold && isScrolled) {
        setIsScrolled(false);
      }
    }, 200);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isScrolled, scrollThreshold]);

  return { isScrolled };
};
