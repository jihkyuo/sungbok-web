import { fetchSermonLibrary } from '@/domains/worship-video/api/worshipVideo.server';
import SermonWatch from '@/domains/worship-video/components/widgets/SermonWatch';
import type { Metadata } from 'next';

type Props = { params: Promise<{ videoId: string }> };

// 목록 페이지(../page.tsx)와 같은 주기 — 유튜브 응답은 Data Cache 1시간이라 다시 만들어도 쿼터를 더 쓰지 않는다.
export const revalidate = 600;
// 설교 페이지는 빌드 때 만들지 않는다(빌드가 유튜브 응답에 묶이지 않게) — 처음 열릴 때 만들어 두고 그 뒤로는 저장된 것을 준다.
export const generateStaticParams = () => [];

const FALLBACK_TITLE = '주일예배 | 성복교회';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoId } = await params;
  try {
    const sermon = (await fetchSermonLibrary('sunday')).find(s => s.id === videoId);
    if (sermon) return { title: `${sermon.title} | ${FALLBACK_TITLE}` };
  } catch {
    // 목록을 못 받았으면 제목만 기본값으로 — 화면은 SermonWatch 의 규칙을 따른다
  }
  return { title: FALLBACK_TITLE };
}

// 설교 한 편 — 유튜브 플레이어·설명란·설교 목록. 목록 페이지(/worship/sunday)에서 설교를 누르면 여기로 와 바로 재생된다.
export default async function Page({ params }: Props) {
  const { videoId } = await params;
  return <SermonWatch page="sunday" videoId={videoId} />;
}
