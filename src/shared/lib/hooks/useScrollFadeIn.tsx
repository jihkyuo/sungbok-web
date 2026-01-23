import { useEffect, useRef, useState } from 'react';

interface UseScrollFadeInOptions {
  threshold?: number; // 요소가 얼마나 보여야 트리거될지 (0~1)
  rootMargin?: string; // 뷰포트 기준 마진 (예: '0px', '-100px')
  triggerOnce?: boolean; // 한 번만 트리거할지 여부
}

export const useScrollFadeIn = ({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
}: UseScrollFadeInOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};
