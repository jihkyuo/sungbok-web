# ADR 0007: 다음세대 부서 페이지 템플릿 — 도입부 + 사진 쇼케이스(데스크톱 «놓기» · 모바일 «부채»)

**상태**: 채택
**날짜**: 2026-11-04

## 배경
다음세대 9개 부서 페이지가 전부 `PagePlaceholder` 였다. 부서 페이지의 목적은 «이 부서가 어떤 곳인지»를 **분위기**로 느끼게 하는 소개이지 활동 목록·커리큘럼 안내가 아니다(2026-10-31 라운드 1 기각). 영아부 하나를 템플릿으로 확정해 나머지 8부서에는 콘텐츠만 바꿔 복제한다. 시안은 `design-variant-rounds` 방식으로 4라운드·16슬롯을 돌렸다(`design-rounds/department-page/`).

## 결정
**도입부 한 덩어리 + 그 아래 사진 쇼케이스** 두 부분으로 고정하고, 쇼케이스만 뷰포트 폭으로 갈라 쓴다.

- **도입부(Intro)** — 라운드 1 «들어서기»의 도입부를 사용자 확정(2026-11-02) 그대로. 1440: 전폭 사진 100svh 핀이 스크롤로 왼쪽 카드로 물러나고 오른쪽에 사실줄(예배 요일·시간·장소·나이) → 소개 → 담당 → 안내 한 줄이 떠오른다. 390: 사진이 뒤에 서고 흰 시트가 올라오며 정보를 싣는다. 정보는 한 자리에 모으고 사진 사이에 흩뿌리지 않는다. 사진 캡션 없음(alt 만).
- **쇼케이스 ≥ 900px «놓기»(Landing)** — 라운드 2 «속도»의 정지 형태(8장 주기 격자·행이 앞 행 밑으로 파고듦·±1.6~3.4° 기울기)만 킵하고, 모션 의도를 하나로 좁혔다: 장의 60% 가 보이는 순간 공중 자세에서 더미로 **한 번 놓인다**(1100~1300ms, 되돌리지 않음). 스크롤 속도 반응 모션은 «의도가 애매하다»는 판정으로 버렸다.
- **쇼케이스 ≤ 899px «부채»(Fan)** — 라운드 3 «부채 v1»: 포개진 더미가 뷰포트를 지나는 자리에서 세로로만 부채처럼 벌어졌다 다시 포개진다(커서 하나의 함수, 100svh 핀). 작가의 v2(대각선 펼침)가 v1 을 덮어썼던 것을 사용자 판정에 따라 v1 으로 되살려 승격.
- **분기 방식** — `DepartmentPage` 가 `useSyncExternalStore` 로 `(max-width: 899px)` 를 구독해 쇼케이스 컴포넌트만 바꿔 끼운다. 도입부는 한 번만 렌더되어 창 폭이 바뀌어도 다시 그리지 않는다. 서버 스냅샷은 데스크톱(쇼케이스는 100svh 핀 아래라 모바일의 하이드레이션 교체가 첫 화면 밖에서 일어난다).
- **데이터 계약** — `DepartmentPage/types.ts`(Department·Staff·Photo). 8부서 데이터는 `domains/next-generation/data/departments.ts` 한 파일(slug 키). 사진 개수 상한 없음, «더 보기» 없음.
- 모션 바: 전부 transform/opacity, `prefers-reduced-motion` 이면 핀을 풀고 정적 흐름.

## 대안 비교
- **활동 목록·연간 달력·동선 중심 구성(라운드 1 A·E)** — «학원 커리큘럼 같다»로 기각.
- **정보를 사진 사이에 끼우는 편집 구성(라운드 2 화보·정보 앵커·챕터 띠)** — 기각. 정보는 한 덩어리로.
- **막(act) 단위 연출(모임·통과: 한 무리가 무대에서 공연하고 리셋)** — «최악». 사진 전부가 하나의 연속 체계여야 한다.
- **스크롤 속도 반응 모션(속도)** — 형태는 좋으나 모션 의도가 애매해 버림. «초점»(가운데 한 장 들어 올림·가역)은 «놓기»에 밀림.
- **역류·굽이(열이 반대로 흐름·좌우 드리프트)** — 후보로 남았으나 미채택.
- **CSS 만으로 두 쇼케이스를 한 DOM 에 합치기** — 격자(놓기)와 핀+절대 배치(부채)의 DOM 이 달라 한 트리로는 둘 다 흐려진다. 컴포넌트 분기를 택했다.

## 결과 / 영향
- 정식: `src/domains/next-generation/components/widgets/DepartmentPage/{index,Intro,Landing,Fan}.tsx` + `types.ts`, 데이터 `src/domains/next-generation/data/departments.ts`, 라우트 `src/app/next-generation/{infant,kindergarten,lower-elementary,elementary,middle,high,young-adult,english}/page.tsx` 8개 전부 이 위젯.
- **사실**(나이·예배 요일/시간/장소·담당·직함)은 `worshipTimes.ts`·`staff.ts`·`ministries.ts` 와 같은 출처. 유년부/초등부 학년 구분·영어예배부 대상 연령은 부서 확인 전. **소개 문단·인사말·안내 한 줄·사진 12장은 부서 취합 전 샘플**(홈 부서 컷 9장 + 레거시 영아부 3장 + 메인 3장 돌려 씀) — 취합 후 데이터 파일만 교체.
- 구 `DepartmentDetail` 위젯은 라우트에서 빠졌다(`infant-preview` 만 참조). 시안 무대(`infant/showcase-preview/`, `DepartmentPage/_variants/`, `design-rounds/department-page/`)와 구 `DepartmentDetail/_variants/`·`infant-preview/` 는 정리 대상(prototype-preview §E).
