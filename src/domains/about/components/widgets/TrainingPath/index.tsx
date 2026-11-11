// 교회소개 › 양육·훈련 본문. 기초 → 성장 → 섬김으로 이어지는 세로 경로.
// 왼쪽 레일: 단계 번호 원(accent) + 다음 단계까지 이어지는 hairline. 오른쪽: 단계 이름(md 이상 4/12) + 과정 카드(8/12).
// 카드는 과정 이름 + 기간(주)을 큰 숫자로 — 원문 표에서 가장 비교하기 좋은 정보가 기간이라 그것만 키운다.
// 단계마다 레일·본문을 한 Reveal(li)로 묶는다 — 본문만 숨기면 등장 전에 번호 원만 떠 보인다.
// 내용은 courses.ts(기존 사이트 원문). 신청·일정 안내는 자료가 없어 두지 않는다.
import { Reveal } from '@/shared/components/features/Reveal';
import { cn } from '@/shared/lib/utils';
import { TRAINING_STAGES, type Course } from './courses';

const CourseCard = ({ course }: { course: Course }) => (
  <article className="bg-b1-surface ring-b1-border rounded-xl p-6 shadow-sm ring-1 md:p-8">
    <header className="border-b1-border flex items-end justify-between gap-4 border-b pb-4">
      <h3 className="text-b1-text text-h3">{course.name}</h3>
      {/* line-height 는 text-* 토큰이 span 마다 정하고, p 의 strut 도 줄 높이를 만든다 → 둘 다 leading-none */}
      <p className="text-b1-accent shrink-0 leading-none">
        <span className="text-h1 leading-none tabular-nums">{course.weeks}</span>
        <span className="text-title ml-0.5 leading-none">주</span>
      </p>
    </header>
    <p className="text-b1-sub text-body mt-4">{course.description}</p>
  </article>
);

export const TrainingPath = () => (
  // role="list": list-style:none 이면 Safari/VoiceOver 가 목록 의미를 지운다 — 단계 순서(번호는 aria-hidden)를 지키려고 명시
  <ol role="list" aria-label="양육·훈련 과정">
    {TRAINING_STAGES.map((stage, i) => {
      const last = i === TRAINING_STAGES.length - 1;
      return (
        <Reveal as="li" key={stage.title} className="grid grid-cols-[auto_1fr] gap-x-5 md:gap-x-8">
          <div aria-hidden className="flex flex-col items-center">
            <span className="bg-b1-accent text-label text-b1-bg flex size-10 items-center justify-center rounded-full font-bold tabular-nums">
              {i + 1}
            </span>
            {!last && <span className="bg-b1-border my-3 w-px flex-1" />}
          </div>
          <div
            className={cn(
              'grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-x-8',
              !last && 'pb-14 md:pb-20'
            )}
          >
            <h2 className="text-b1-text text-h2 pt-0.5 md:col-span-4">{stage.title}</h2>
            <div className="space-y-4 md:col-span-8">
              {stage.courses.map(c => (
                <CourseCard key={c.name} course={c} />
              ))}
            </div>
          </div>
        </Reveal>
      );
    })}
  </ol>
);
