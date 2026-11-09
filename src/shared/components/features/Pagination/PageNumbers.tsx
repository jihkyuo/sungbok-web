import * as OriginPagination from '@/shared/components/ui/pagination';
import { pageItems, type PageItem } from './pageItems';

interface Props {
  totalPageCount: number;
  page: number;
  navToPage: (page: number) => void;
}

const JUMP = 5;

// 휴대폰에서만 숨김 / 휴대폰에서만 보임 — 칸 계산은 pageItems 한 곳에서.
const visibility = (it: PageItem) =>
  it.desktop && it.mobile ? undefined : it.desktop ? 'max-sm:hidden' : 'sm:hidden';

// 생략부호 — 화면낭독기에는 도착할 쪽을 읽힌다(휴대폰은 1 과 지금 쪽 사이가 모두 숨어 «앞쪽» 만으로는 결과를 알 수 없다).
const JumpTo = ({ to, navToPage }: { to: number; navToPage: (page: number) => void }) => (
  <OriginPagination.PaginationJump
    onClick={() => navToPage(to)}
    aria-label={`${to}페이지로 건너뛰기`}
  />
);

/**
 * 쪽 번호 줄 — PC 는 1 … (현재 ±2) … 끝, 휴대폰은 1 … 현재 … 끝(pageItems). 생략부호는 누르면 5쪽씩 건너뛴다.
 * 생략부호가 한 쪽만 가리게 되면(예: 1 … 3) 생략부호 대신 그 쪽 번호를 보인다 — 같은 자리를 차지하면서 한 쪽만 건너뛰는 건 헷갈린다.
 */
export const PageNumbers = ({ totalPageCount, page, navToPage }: Props) => (
  <>
    {pageItems(totalPageCount, page).map(it => (
      <OriginPagination.PaginationItem
        // 생략부호는 보이는 화면(PC·휴대폰)이 바뀌면 새로 그린다 — 누른 생략부호가 지워지지 않고 숨기만 하면
        // Pagination 의 포커스 복원(누른 버튼이 빠졌을 때만)이 놓쳐 포커스가 문서 맨 위로 튄다
        key={it.kind === 'page' ? it.page : `${it.kind}-${visibility(it) ?? 'all'}`}
        className={visibility(it)}
      >
        {it.kind === 'page' ? (
          <OriginPagination.PaginationLink
            onClick={() => navToPage(it.page)}
            isActive={page === it.page}
          >
            {it.page}
          </OriginPagination.PaginationLink>
        ) : it.kind === 'jump-back' ? (
          <JumpTo to={Math.max(page - JUMP, 2)} navToPage={navToPage} />
        ) : (
          <JumpTo to={Math.min(page + JUMP, totalPageCount - 1)} navToPage={navToPage} />
        )}
      </OriginPagination.PaginationItem>
    ))}
  </>
);
