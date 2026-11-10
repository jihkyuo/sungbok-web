/**
 * /plan 기획 기준 페이지의 내용.
 * 정본: .md/meetings/2026-10-08-pastor-review.md + public/plan/homepage-revisions-2026-10-08.pdf(목사님 원문).
 * 회의록은 시간순·불변이라, 여기서는 세 화면(이 페이지·새 사이트·레거시)을 나란히 비교하기 좋게 메뉴 축으로 재배열만 한다.
 * D·O 번호는 회의록 0절과 같다. "새 사이트 현재" 상태는 레포 라우트 기준 1차 판정(2026-11-08), 2026-11-09 갱신 — 미팅에서 고친다.
 */

export const LEGACY_ORIGIN = 'http://sungbok.or.kr';
/** 협업자는 로컬이 없으므로 새 사이트 링크는 Vercel 배포본(커밋된 main)으로 건다. 미커밋 작업은 배포본에 안 보인다. 이 페이지도 같은 배포본에서 열린다. */
export const NEW_SITE_ORIGIN = 'https://sungbok-web.vercel.app';
const board = (id: string) => `${LEGACY_ORIGIN}/bbs/board.php?bo_table=${id}`;

export const PDF_HREF = '/plan/homepage-revisions-2026-10-08.pdf';
export const PDF_PAGES = ['/plan/pdf-page-1.png', '/plan/pdf-page-2.png', '/plan/pdf-page-3.png'];

export type Status = 'done' | 'scaffold' | 'todo';
export const STATUS_LABEL: Record<Status, string> = {
  done: '완료',
  scaffold: '틀만 있음',
  todo: '미착수',
};

type LegacyItem = { label: string; href: string };
type Numbered = { id: string; text: string };
type CurrentPage = { label: string; href: string; status: Status; note?: string };

type Block = {
  id: string;
  title: string;
  legacy: LegacyItem[];
  /** PDF 원문 인용(항목 번호 포함, 문구 그대로) */
  request: string[];
  decisions: Numbered[];
  open: Numbered[];
  current: CurrentPage[];
  /** 레거시 하위 중 새 사이트에서 다른 메뉴로 옮긴 것 등 */
  remarks?: string[];
};

export const BLOCKS: Block[] = [
  {
    id: 'home',
    title: '메인',
    legacy: [{ label: '메인', href: `${LEGACY_ORIGIN}/` }],
    request: [
      '1. 담임목사님 인사 메인 홈 화면에 있는 건 좋음.',
      '7. 메인에 청년부 유튜브는 올리브워십 유튜브로 되어 있는데 주일 찬양 업로드 되면 “성복의 찬양” 정도로 바꾸면 좋을 듯.',
      '8. 다음세대 메인에서 별 선택하는 것 좋음. 폰에서는 어떻게 반영할 것인지. 폰에서는 위로 올리기가 어려움.',
    ],
    decisions: [
      {
        id: 'D12',
        text: '설교 영역은 최신 주일 설교 영상 자동 갱신 + 교회 유튜브 채널 링크. 청년예배 별도 영역 불필요',
      },
      {
        id: 'D8',
        text: '청년부 유튜브(올리브워십) 영역은 주일 찬양 업로드 시작 시 "성복의 찬양"류로 타이틀 교체해 재활용',
      },
      {
        id: 'D13',
        text: '행사 포스터는 팝업 대신 스크롤 중 섹션으로 노출',
      },
      {
        id: 'D11',
        text: '새가족 등록은 실시간 채팅 대신 등록 시 담당자 알림 수준. 현재 시안 수준 OK',
      },
      { id: 'D10', text: '사이트 진입 시 음악 자동재생 안 함' },
    ],
    open: [
      {
        id: 'O3',
        text: '히어로 영상 도입 여부. 쓸 만한 영상이 없어 새로 촬영·편집 필요. 담임목사님께 상의',
      },
      {
        id: 'O8',
        text: '디자인 톤. 담임목사님은 꽉 찬 구성·사진 많은 쪽 선호, 현 시안은 밝은 미니멀. 색 피드백 오면 시안 재생성',
      },
    ],
    current: [
      {
        label: '히어로 → 사진 띠 → 표어 → 담임 인사',
        href: '/',
        status: 'done',
        note: '사진은 전부 임시(옛 사이트 소스). 영상 없음',
      },
      {
        label: '예배 시간표',
        href: '/#worship',
        status: 'done',
        note: '"수요 청년예배" 표기와 장년예배/다음세대예배 구분 모두 반영(D9)',
      },
      {
        label: '라이브 스테이지 + 광고 릴',
        href: '/',
        status: 'done',
        note: '유튜브 채널 서버 연동. 라이브면 자동재생, 아니면 담임 최신 설교',
      },
      {
        label: 'LP 턴테이블(청년 예배 영상)',
        href: '/',
        status: 'scaffold',
        note: '넓은 화면만 노출, 폰에서는 숨김. D12·D8에 따라 "성복의 찬양"으로 전환 또는 제거 결정 필요',
      },
      {
        label: '다음세대 별자리',
        href: '/',
        status: 'scaffold',
        note: '넓은 화면만 노출, 폰에서는 숨김. 별을 누르면 각 부서 페이지로 이동(키보드 좌우 화살표·Enter도 됨). 폰 대체 화면 미착수(요구 8번)',
      },
      { label: '교회 소식', href: '/', status: 'scaffold', note: '레이아웃 완료, 데이터는 샘플' },
      {
        label: '오시는 길 지도',
        href: '/#location',
        status: 'done',
        note: '네이버·카카오 길찾기 링크',
      },
      {
        label: '처음 오신 분께(새가족 등록)',
        href: '/',
        status: 'scaffold',
        note: '패널·폼 UI만. 제출 시 담당자 알림 미연결(D11)',
      },
    ],
  },
  {
    id: 'about',
    title: '교회소개',
    legacy: [
      { label: '원로목사', href: board('0101') },
      { label: '담임목사', href: board('0102') },
      { label: '섬기는 이들', href: board('0104') },
      { label: '예배시간', href: board('0105') },
      { label: '새가족등록', href: board('0111') },
      { label: '온라인 새가족등록', href: board('0106') },
      { label: '양육/훈련', href: board('0109') },
      { label: '찾아오시는 길', href: board('0107') },
    ],
    request: ['1. 기존 : 교회소개 카테고리에 원로목사님 인사 있음. 반영 여부 결정.'],
    decisions: [
      {
        id: 'D1',
        text: '하위는 원로목사 · 담임목사 · 섬기는 이들 · 양육/훈련, 연혁 유지. 새가족등록·온라인 새가족등록·예배시간·찾아오시는 길은 교회소개 밖으로',
      },
    ],
    open: [],
    current: [
      { label: '원로목사', href: '/about/pastor-emeritus', status: 'done' },
      { label: '담임목사', href: '/about/pastor', status: 'done' },
      {
        label: '섬기는 이들',
        href: '/about/staff',
        status: 'done',
        note: '교역자 7명 사진이 275×350 저해상. 실사진 수신 시 교체',
      },
      { label: '양육·훈련', href: '/about/training', status: 'todo' },
      {
        label: '연혁',
        href: '/about/history',
        status: 'todo',
        note: '레거시에 없던 항목. 내용 출처 필요',
      },
    ],
    remarks: [
      '예배시간 → 예배 > 예배 안내로 이동',
      '새가족등록·온라인 새가족등록 → 메인 "처음 오신 분께" 섹션으로 이동(별도 페이지 없음)',
      '찾아오시는 길 → 독립 상위 메뉴',
    ],
  },
  {
    id: 'worship',
    title: '예배',
    legacy: [
      { label: '주일예배', href: board('0201') },
      { label: '금요생수의 강 및 월삭예배', href: board('0202') },
      { label: '특별집회 및 행사', href: board('0203') },
      { label: '수요/새벽/주일5부', href: board('0204') },
    ],
    request: ['2. 카테고리 기존 홈페이지와 통일, 세부 카테고리 기존 홈페이지 참고.'],
    decisions: [
      {
        id: 'D2',
        text: '기존 4분류 유지. 주일예배(담임) / 금요 생수의 강·월삭예배(담임) / 특별집회·행사(외부 강사) / 수요·새벽·주일5부(부교역자)',
      },
      {
        id: 'D3',
        text: '설교 영상은 유튜브 연동으로 자동 반영. 지금은 담당자가 게시글을 매번 수동 등록',
      },
      {
        id: 'D9',
        text: '시간표에서 "청년예배" → "수요 청년예배". 대예배와 주일학교 예배(영어예배 포함) 구분 표시',
      },
    ],
    open: [
      {
        id: 'O1',
        text: '금요 생수의 강을 부교역자가 설교하면 들어갈 분류가 없음. 목사님은 "그럴 일 거의 없음"',
      },
      { id: 'O2', text: '상세 페이지의 전체/하위 필터 탭 구조를 레거시대로 갈지 새로 설계할지' },
      { id: 'O6', text: '수요예배 찬양 7:20(실제) vs 7:30(주보). 당분간 주보 기준' },
    ],
    current: [
      {
        label: '예배 안내',
        href: '/worship/guide',
        status: 'todo',
        note: '레거시 "예배시간"의 자리',
      },
      {
        label: '주일예배',
        href: '/worship/sunday',
        status: 'scaffold',
        note: '구 사이트 재생목록 탭 그대로. 탭 5개를 서버가 미리 받아 두어 탭 이동이 즉시 되고, 폰에서는 쪽 번호가 한 줄. 설계한 아카이브 미연결',
      },
      { label: '금요 생수의 강·월삭예배', href: '/worship/friday', status: 'todo' },
      { label: '특별집회·행사', href: '/worship/special', status: 'todo' },
      { label: '수요·새벽·주일5부', href: '/worship/weekday', status: 'todo' },
    ],
    remarks: [
      '유튜브 연동은 메인(라이브·광고 릴)에는 돼 있고, 분류별 설교 아카이브에는 아직 안 붙었다',
    ],
  },
  {
    id: 'next-generation',
    title: '다음세대',
    legacy: [
      { label: '영아부', href: board('0301') },
      { label: '유치부', href: board('0302') },
      { label: '유년부', href: board('0303') },
      { label: '초등부', href: board('0304') },
      { label: '중등부', href: board('0305') },
      { label: '고등부', href: board('0306') },
      { label: '청년부', href: board('0307') },
      { label: '영어예배부', href: board('0309') },
    ],
    request: ['3. 기존 부서 순서대로 맞추고 엘림가족부 삭제'],
    decisions: [
      { id: 'D4', text: '부서별로 각각 분리(묶음 금지), 엘림가족부 삭제, 순서는 레거시 그대로' },
      { id: 'D5', text: '상세는 영어예배부 1개를 샘플로 먼저 제작해 보여드림' },
    ],
    open: [
      {
        id: 'O4',
        text: '상세 레이아웃. 레거시 "상단 큰 사진 + 하단 카테고리"를 답습하지 않아도 됨',
      },
    ],
    current: [
      { label: '영아부', href: '/next-generation/infant', status: 'done' },
      { label: '유치부', href: '/next-generation/kindergarten', status: 'done' },
      { label: '유년부', href: '/next-generation/lower-elementary', status: 'done' },
      { label: '초등부', href: '/next-generation/elementary', status: 'done' },
      { label: '중등부', href: '/next-generation/middle', status: 'done' },
      { label: '고등부', href: '/next-generation/high', status: 'done' },
      { label: '청년부', href: '/next-generation/young-adult', status: 'done' },
      { label: '영어예배부', href: '/next-generation/english', status: 'done' },
    ],
    remarks: [
      '8부서 모두 공통 템플릿(도입부 + 사진 쇼케이스, ADR 0007)으로 연결됨. 부서별 사진·소개 글은 임시이며 각 부서에서 취합해야 한다',
      '메인 다음세대 별자리도 8부서로 맞춤. 엘림가족부를 뺐고 순서는 레거시대로, 별마다 해당 부서 페이지로 연결(D4)',
      '목사님 전망: 부서 자료 요청 때문에 다음세대가 가장 오래 걸린다',
    ],
  },
  {
    id: 'news',
    title: '교회소식',
    legacy: [
      { label: '주일광고', href: board('0401') },
      { label: '주보', href: board('0402') },
      { label: '성복의 뜰', href: board('0407') },
      { label: '사진첩', href: board('0408') },
    ],
    request: ['4. 공지사항은 빼고 기존 유지하되 사진첩은 교회앨범으로'],
    decisions: [
      {
        id: 'D6',
        text: '공지사항 삭제(실제로 안 씀, 광고는 전부 주보에). 주일광고·주보·성복의 뜰 유지, 사진첩 → 교회앨범',
      },
    ],
    open: [
      {
        id: 'O5',
        text: '교회앨범(교구·행사 사진)과 칼럼 분리 여부. 레거시 사진첩엔 칼럼이 올라가고 있음',
      },
    ],
    current: [
      {
        label: '주일광고',
        href: '/news/announcements',
        status: 'todo',
        note: '예배 전 광고 영상. 매주 갱신되므로 관리자 기능 필요',
      },
      {
        label: '주보',
        href: '/news/bulletin',
        status: 'scaffold',
        note: '레이아웃 완료, 호수·PDF는 샘플',
      },
      { label: '성복의 뜰', href: '/news/garden', status: 'todo', note: '행사 영상·홍보 영상' },
      { label: '교회앨범', href: '/news/album', status: 'todo' },
    ],
    remarks: ['공지사항 메뉴는 처음부터 만들지 않았다(D6 반영)'],
  },
  {
    id: 'resources',
    title: '자료실',
    legacy: [
      { label: '주일 설교 시트지', href: board('0404') },
      { label: '시리즈 설교 시트지', href: board('0409') },
      { label: '가정, 명절, 절기 설교 시트지', href: board('0406') },
    ],
    request: ['5. 기존 유지. 세부 카테고리 및 자료 기존 참고.'],
    decisions: [{ id: 'D7', text: '시트지 3분류 유지. 악보(저작권)·서식 다운로드는 제외' }],
    open: [],
    current: [
      { label: '주일 설교 시트지', href: '/resources/sunday-sermon', status: 'todo' },
      {
        label: '시리즈 설교 시트지',
        href: '/resources/series-sermon',
        status: 'todo',
        note: '시리즈별 하위 분류',
      },
      { label: '가정·명절·절기 설교 시트지', href: '/resources/seasonal-sermon', status: 'todo' },
    ],
    remarks: ['대부분 레거시 콘텐츠를 옮겨 채우면 됨. 디자인만 신경'],
  },
  {
    id: 'location',
    title: '찾아오시는 길 · 새가족',
    legacy: [
      { label: '찾아오시는 길', href: board('0107') },
      { label: '새가족등록', href: board('0111') },
      { label: '온라인 새가족등록', href: board('0106') },
    ],
    request: ['6. 기존에는 교회소식에 있음. 따로 빼도 좋음.'],
    decisions: [
      {
        id: 'D1',
        text: '(교회소개 D1 참조) 찾아오시는 길·새가족등록은 교회소개 밖으로',
      },
      { id: 'D11', text: '새가족 등록은 등록 시 담당자 알림 수준이면 충분' },
    ],
    open: [],
    current: [
      {
        label: '찾아오시는 길',
        href: '/location',
        status: 'todo',
        note: '메인에 지도 섹션은 있음. 독립 페이지는 미착수',
      },
      {
        label: '새가족 등록',
        href: '/',
        status: 'scaffold',
        note: '메인 "처음 오신 분께" 패널. 알림 미연결',
      },
    ],
  },
];

/** 메뉴에 묶이지 않는 공통 사항 */
export const CROSS_CUTTING: { title: string; text: string; ref?: string }[] = [
  { title: '목표 오픈', text: '2027년 1월. 그 전에 부서 사진·소개 등 자료 수집', ref: 'D14' },
  {
    title: '유튜브 자동 연동',
    text: '유튜브에만 올리면 사이트에 자동 반영. 공수 절감의 핵심. 메인은 연동됨, 설교 아카이브는 미연결',
    ref: 'D3',
  },
  {
    title: '모바일',
    text: '메인 전체를 모바일 최적화 화면으로 다시 설계. 별 선택·LP 턴테이블 같은 넓은 인터랙션은 폰에서 숨김 처리됨. 폰 대체 화면과 메인 전체 재설계는 미착수',
    ref: '요구 8',
  },
  {
    title: '관리자 기능',
    text: '자동 반영이 안 되는 항목(광고 영상·포스터·주보 등)은 담당자가 관리자 화면에서 바꿀 수 있는 수준이면 됨',
  },
  {
    title: '히어로 영상',
    text: '쓸 만한 영상 없음. 쓰려면 컨셉에 맞게 새로 촬영·편집. 레거시는 유튜브 임베드라 컨트롤러 노출',
    ref: 'O3',
  },
  {
    title: '사진',
    text: '현재 사진은 전부 임시. 교회 전경·예배당 등 대체 사진 확보 필요. 교역자 사진 교체는 내년 업데이트에 맞춤',
  },
  {
    title: '소속 교단',
    text: '처음 교회를 찾는 사람에겐 중요. 뒤쪽에 함께 노출(메인 히어로에 교단 소속 문장 반영됨)',
  },
  {
    title: '도메인',
    text: '기존 주소를 쓰려면 현 외주 업체와 협의. 명의가 교회인지 확인 후 "새 사이트로 돌리겠다" 전달',
    ref: 'O7',
  },
];

export const ACTIONS: { owner: string; items: string[] }[] = [
  {
    owner: '개발',
    items: [
      'IA를 D1~D7대로 반영 (교회소개·예배·다음세대·교회소식·자료실)',
      '영어예배부 상세 샘플 1개 제작 (D5)',
      '메인 전체 모바일 최적화 화면 재설계',
      '예배 시간표 표기·구분 수정 (D9)',
      '유튜브 연동 설계 (D3), 관리자가 바꿀 항목 정리(광고 영상·설교 영상·포스터)',
      '포스터 섹션 고도화 시 기간 설정 → 만료 시 디폴트 전환',
    ],
  },
  {
    owner: '목사님',
    items: [
      '담임목사님께 구두 설명, 히어로 영상 촬영 건 상의',
      '각 부서에 사진·소개 자료 요청',
      '도메인 명의·이관 가능 여부 업체 확인',
    ],
  },
  { owner: '공통', items: ['교회 전경·예배당 등 대체 사진 확보'] },
];
