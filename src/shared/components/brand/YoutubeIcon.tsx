import type { SVGProps } from 'react';

// lucide-react 1.x 가 브랜드 아이콘을 뺐다 — 0.488 의 `Youtube` 와 같은 모양·같은 API(size)를 그대로 옮겨 둔다.
// 원본: lucide-react v0.488.0 icons/youtube (ISC License).
type Props = Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> & { size?: number | string };

export const YoutubeIcon = ({ size = 24, strokeWidth = 2, ...props }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);
