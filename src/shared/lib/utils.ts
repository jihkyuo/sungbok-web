import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge 는 우리 글자 크기 토큰(text-body-sm 등)을 모르면 `text-b1-sub` 같은 색 유틸과
 * 같은 그룹으로 보고 앞의 것을 지운다. 토큰 이름을 font-size 테마에 알려 준다(globals.css --text-*).
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['display', 'h1', 'h2', 'h3', 'title', 'body', 'body-sm', 'label', 'caption', 'eyebrow'],
      ease: ['standard'],
    },
    // duration-fast/base/slow 는 @utility 라 테마가 아니다 — 같은 duration 그룹으로 알려 뒤의 값이 이기게 한다
    classGroups: {
      duration: ['duration-fast', 'duration-base', 'duration-slow'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
