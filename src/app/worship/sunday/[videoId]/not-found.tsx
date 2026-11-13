import { sermonPath } from '@/domains/worship-video/config/worshipPages';
import Link from 'next/link';

// 목록에 없는 설교(지워졌거나 잘못된 주소) — 서브페이지 머리(SectionShell)는 그대로 두고 안내와 목록 링크만 보인다.
// 문구는 화면이 직접 받았을 때의 안내(SermonWatchPage)와 같다.
export default function NotFound() {
  return (
    <div className="text-b1-sub flex flex-wrap items-center gap-x-4 gap-y-3 py-10">
      <p>이 설교 영상을 찾을 수 없습니다.</p>
      <Link
        href={sermonPath('sunday')}
        className="border-b1-border bg-b1-surface text-b1-text text-label hover:border-b1-accent-soft hover:bg-b1-accent-soft focus-visible:ring-b1-accent focus-visible:ring-offset-b1-bg duration-fast inline-flex min-h-11 items-center justify-center rounded-md border px-4 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
      >
        설교 목록
      </Link>
    </div>
  );
}
