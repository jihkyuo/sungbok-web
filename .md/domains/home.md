# 홈 (`/`)

성복교회 웹사이트의 진입 페이지. 1순위 사용자는 **첫 방문 예정자(비신자/탐색자)**, 궁극 전환 목표는 **주일예배 오프라인 방문**. 이 페이지의 모든 의사결정은 첫 방문자의 "이 교회 정상인가, 분위기는 어떤가 → 언제·어디로 가면 되나"의 흐름에 최적화된다.

> 결정 배경·대안 비교는 [ADR 0002](../decisions/0002-home-ia-and-tone.md) 참조.

## 흐름

> **건물 → 사람의 얼굴 → 사람의 인사 → 시간 → 영상 → 부서 → 방문 정보 → 위치**

## 섹션 IA

| # | 섹션 | 컴포넌트 | 상태 |
|---|---|---|---|
| 1 | HomeHero | [HomeHero](../../src/domains/home/components/widgets/HomeHero/index.tsx) | 개편 |
| 2 | PastorWelcome | (신설 예정) `src/domains/home/components/widgets/PastorWelcome/` | 미구현 |
| 3 | WorshipTimes | [WorshipTimes](../../src/domains/home/components/widgets/WorshipTimes/index.tsx) | 유지 |
| 4 | RecentSermons | [RecentSermons](../../src/domains/home/components/widgets/RecentSermons/index.tsx) | 유지 + placeholder 카드 교체 |
| 5 | CommunityGallery | [CommunityGallery](../../src/domains/home/components/widgets/CommunityGallery/index.tsx) | 유지 + 모바일 6+더보기 |
| 6 | VisitorAndNews | [VisitorAndNews](../../src/domains/home/components/widgets/VisitorAndNews/index.tsx) | 유지 + 좌:우 60:40 |
| 7 | LocationMap | [LocationMap](../../src/domains/home/components/widgets/LocationMap/index.tsx) | 유지 + "주소 복사" 추가 |

조립 위치: [src/app/page.tsx](../../src/app/page.tsx)

## 섹션 사양

### 1. HomeHero

| 항목 | 내용 |
|---|---|
| **목적** | "이 교회는 누가 운영하고, 어떤 분위기인가?"에 첫 5초 안에 답한다. |
| **콘텐츠** | • 좌측 텍스트: 환영 라벨 / 메인 카피 / 서브 카피 / CTA 2개<br>• 우측 비주얼: 전경 + 담임목사 (인터랙티브 옵션은 아래 "히어로 인터랙티브" 참조)<br>• 메인 카피 안: 「처음 오신 분의 자리, 그대로 두었습니다」<br>• 서브 카피에 교단·연혁 한 줄 객관 정보로 자연 삽입 — 예: 「대한예수교장로회 ○○ · 1979년 창립 · 동대문 장안동」 (실값 확인 필요)<br>• 작은 b1-mono 라벨: "● SUNGBOK · 2026.05" |
| **타이포·톤** | 메인 76px 볼드 + 두 번째 줄 medium·muted. 인물 컷 자연광, 전경은 채도 살짝 ↓. |
| **Primary CTA** | "이번 주 예배 시간" (`#worship` 앵커) |
| **Secondary CTA** | "오시는 길" (`#location` 앵커) |
| **성공 지표** | 2번 섹션 도달률 ≥ 70%, Primary CTA 클릭률, 평균 체류 5초+ |

### 2. PastorWelcome (신설)

| 항목 | 내용 |
|---|---|
| **목적** | "이 교회는 누가 인도하나?" — 사람의 얼굴 다음에 사람의 1인칭 메시지로 자연스럽게 이어간다. |
| **콘텐츠** | • 담임목사 정면 인물 사진 (자연광)<br>• 인사말 2~3문장. 신학 용어·약속·환대형 멘트 배제, 단정한 환영의 진술. 안: 「성복교회에 오신 것을 환영합니다. 이 자리는 신앙의 유무와 상관없이 누구에게나 열려 있습니다.」<br>• 직함·이름·서명체 1줄 (예: 「담임목사 ○○○」)<br>• 보조 CTA: "담임목사 소개" 또는 "설교 영상 보기" |
| **타이포·톤** | 카드형 b1-surface, 라운드 16px. 인사말 18px medium, 줄간 1.7. 사진 좌측 1/3, 텍스트 2/3 (모바일은 위/아래). |
| **Primary CTA** | "설교 영상 보기" (`#sermons` 앵커) |
| **Secondary CTA** | 없음 |
| **성공 지표** | 다음 섹션 도달률, 페이지 깊이 50% 도달률 |

### 3. WorshipTimes

| 항목 | 내용 |
|---|---|
| **목적** | "그래서 몇 시에 가면 되나?"의 즉답. |
| **콘텐츠** | • 1~4부 카드 4개 (현재 데이터 유지)<br>• 4개 시간을 동등하게 보여주고 사용자가 스스로 선택. 추천 뱃지·"부담 없이" 류 멘트 배제.<br>• "예배 약 70분" 정도는 단정한 사실 라벨로 카드에 삽입 가능 (4개 부수 시간 동일 여부 확인 필요). |
| **타이포·톤** | 시간은 b1-mono. 카드 4개 동등 비중. |
| **Primary CTA** | "전체 예배 안내" (`/worship-video`) |
| **Secondary CTA** | "오시는 길" (`#location`) |
| **성공 지표** | 4개 카드 클릭/포커스 분포, Primary CTA 클릭률 |

### 4. RecentSermons

| 항목 | 내용 |
|---|---|
| **목적** | "예배 분위기는 실제로 어떤가?" — 멘트로 설명하지 않고 보여준다. |
| **콘텐츠** | • 담임 설교 1개 (메인, YouTube 임베드)<br>• 청년부 영상 1개 (서브) — 현재 placeholder 그라디언트 카드는 "준비 안 된 사이트" 신호이므로 정적 사진(청년부 활동컷) 또는 실제 영상으로 교체.<br>• 카드 메타: 설교 제목·날짜·본문절. 시청 부담 해소 류 멘트 배제. |
| **타이포·톤** | 메인 영상 자동재생·음소거·루프 (현재 유지). |
| **Primary CTA** | "설교 모아보기" (`/worship-video`) |
| **Secondary CTA** | "청년부 영상" |
| **성공 지표** | unmute 클릭률, 30초+ 시청률, `/worship-video` 이동률 |

### 5. CommunityGallery

| 항목 | 내용 |
|---|---|
| **목적** | "내 또래/가족이 갈 자리가 있는가?" — 사진의 진정성으로 답한다. |
| **콘텐츠** | 9개 부서 카드 유지. 모바일 6개까지 노출 + "전 부서 보기 ▼". 카드는 모델컷·연출컷이 아닌 실제 활동컷. 카피는 부서명·연령대 같은 사실 라벨. |
| **타이포·톤** | 섹션 헤더 "한 사람을 환대하는 공동체" 유지. |
| **Primary CTA** | 각 카드 → `/next-generation` |
| **Secondary CTA** | 없음 |
| **성공 지표** | 카드 클릭률 (특히 청년부·엘림가족부 — 첫 방문자 페르소나 두 축) |

### 6. VisitorAndNews

| 항목 | 내용 |
|---|---|
| **목적** | 방문 안내(좌, 60%): 결정한 사람의 마지막 실용 정보 / 소식(우, 40%): 살아있는 교회 신호. |
| **콘텐츠** | • 좌측: 방문 안내 카드(주소·주차·문의·메일). 환대 약속 멘트 배제, 정보만 단정하게.<br>• `mailto:`/`tel:` 진짜 클릭 가능 링크로 (현재 `div`로만 표시되어 동작 X).<br>• 우측: 소식 4개. 날짜 절대 표기(예: "2026.04.28"). |
| **타이포·톤** | 좌측 카드 b1-accent 배경(현재 유지). 우측 태그 컬러는 1가지로 통일. |
| **Primary CTA** | "전화 문의" (`tel:`) |
| **Secondary CTA** | "소식 더 보기" (`/news`) |
| **성공 지표** | `tel:`/`mailto:` 클릭률 |

### 7. LocationMap

| 항목 | 내용 |
|---|---|
| **목적** | "지금 결정 → 어떻게 가지?" 마지막 행동 도구. |
| **콘텐츠** | • Google Maps 임베드 (현재 유지)<br>• PARKING / TRANSIT / CONTACT 3카드 (현재 유지)<br>• "주소 복사" 버튼 추가 — 모바일 사용자가 본인 지도앱으로 옮기는 가장 빠른 행동.<br>• 도착 시나리오 멘트("정문에 안내 위원" 등) 배제. |
| **타이포·톤** | 헤더 "찾아오시는 길" 유지. 지도 16:10 + 우측 카드 정렬. |
| **Primary CTA** | "네이버 지도로 길찾기" |
| **Secondary CTA** | "주소 복사" / "전화 문의" |
| **성공 지표** | **외부 지도 링크 클릭률 = 사실상 전환 이벤트** (오프라인 방문 의도의 가장 강한 신호) |

## 히어로 인터랙티브 — 결정 보류 (Option 1 vs Option 3)

전제: 두 안 모두 **전경 + 담임목사** 둘 다 노출. 시안 단계에서 비교 결정.

### Option 1 — 스크롤 크로스페이드

페이지 진입 시 전경 사진. 스크롤 진행도(0~1)에 따라 전경이 페이드아웃되고 담임목사 인물이 페이드인. 두 사진은 같은 프레임에 겹침.

- **시각 언어**: 시간이 흐르며 의미가 드러나는 영화적 디졸브. 다큐멘터리적·정중함·여백.
- **구현 난이도**: 중간. IntersectionObserver + scroll progress, 작은 클라이언트 컴포넌트 1개.
- **모바일**: 같은 로직으로 자연 적응. transition duration 짧게(0.2~0.3s).
- **리스크**: 빠른 스크롤에선 의도 인지 실패 가능, 두 사진의 색감/구도 보정 필수.

### Option 3 — 타이포 마스킹

거대한 타이포(예: "성복" 한자, "SUNGBOK", 또는 짧은 한국어 문장)를 화면을 가로지르게 배치, 글자 안쪽에 전경 사진을 배경 마스크. 글자 옆 별도 영역에 담임목사 인물컷.

- **시각 언어**: 미술관·갤러리·아트북. 한 컷 임팩트, 타이포 자체가 콘텐츠.
- **구현 난이도**: 높음. CSS `background-clip:text` 가능하나 폰트 fallback·반응형이 까다로움. 모바일 별도 디자인 필요.
- **모바일**: 글자 작아지면 마스킹 의미 약해짐 → 별도 레이아웃.
- **리스크**: 시니어에게 "디자이너 사이트" 거리감, 마스킹된 사진이 가려져 본래 모습이 약해질 위험.

### 두 안의 본질적 차이

| 축 | Option 1 | Option 3 |
|---|---|---|
| 시간 | 흐름·서사 | 한 순간 임팩트 |
| 무게 중심 | 우측 비주얼이 변함, 좌측 타이포 보조 | 타이포가 화면 지배 |
| 분위기 | 다큐멘터리적·시적 | 갤러리·아트북 |
| 자산 요구 | 사진 2장 | 사진 2장 + 거대 타이포 디자인 |
| 모바일 | 같은 로직 자연 적응 | 별도 디자인 필요 |
| 시니어 친화도 | 높음 | 낮을 수 있음 |

## 모바일 우선 고려사항

한국 교회 사이트 모바일 비중 75~90%. 모든 결정은 모바일 기준.

| 섹션 | 모바일 처리 |
|---|---|
| HomeHero | 1뷰포트 전부 안 들어감 → 상단 70% 텍스트 + 하단 30% 사진 티저로 잘라 "더 있다" 신호. 인물 컷은 두 번째 뷰포트(=PastorWelcome)에서 다시 정면 노출. |
| PastorWelcome | 사진 위 → 텍스트 아래. 사진 4:5 인물 비율. 인사말 17px medium. |
| WorshipTimes | 4개 카드 2×2 그리드. 4개 모두 동등 비중. |
| RecentSermons | 메인 영상 위, 서브 카드 아래. 첫 프레임 썸네일 품질 중요(자동재생 제한 대비). |
| CommunityGallery | 2열, 6개까지 + "전체 부서 보기 ▼". |
| VisitorAndNews | 1열 스택 (방문 안내 위 / 소식 아래). |
| LocationMap | 지도 4:3 압축. 지도 위 "지도 앱으로 열기" 버튼 우선. |

**글로벌 모바일 룰**:
- CTA는 화면 폭 가득 또는 그에 가깝게.
- 섹션 패딩 데스크톱 96px → 모바일 56~64px (현재 `py-14` 적정).
- 본문 16px 하한, 보조 텍스트도 14px 미만 금지 (시니어 비중).
- Reveal 애니메이션 delay 모바일에서 절반, 첫 뷰포트는 즉시 표시.

## 카피 톤 원칙

홈의 모든 카피는 **사실의 정중한 진술** 톤으로 작성한다. 영업·약속·환대 멘트는 일괄 배제. 상세 가이드와 배제/사용 예시는 [ADR 0002](../decisions/0002-home-ia-and-tone.md) 의 "결정 2" 참조.

## 데이터 소스

현재 모든 데이터는 정적 상수. CMS/DB 미사용.

| 데이터 | 위치 |
|---|---|
| 예배 시간 | [src/domains/home/data/worshipTimes.ts](../../src/domains/home/data/worshipTimes.ts) (`HERO_WORSHIP_TIMES`) |
| 부서 정보 | [src/domains/home/data/ministries.ts](../../src/domains/home/data/ministries.ts) (`MINISTRIES`) |
| 설교/뉴스 | 각 위젯 컴포넌트 내 상수 (`SERMON_FEATURED`, `NEWS_ITEMS`) |
| 이미지 | `src/assets/images/main/` (정적 임포트) |

신설 시 권장 위치: `src/domains/home/data/pastorWelcome.ts` 등 도메인 `data/` 디렉터리에 일관 배치.

## 미결 사항 (Open Questions)

다음 사항은 시안·구현 단계에서 결정한다. 결정될 때마다 본 섹션에서 제거하고 본문에 반영한다.

- [ ] **히어로 인터랙티브: Option 1 vs Option 3** — 시안 단계에서 두 안을 만들어 비교
- [ ] **메인 카피 최종 문구** — 본 문서 후보(「처음 오신 분의 자리, 그대로 두었습니다」 등)는 안. 담임목사·교회 사무국 검수 필요
- [ ] **PastorWelcome 인사말 문구** — 담임목사 본인 검수 필수
- [ ] **객관 정보 정확값** — 교단(예장 합동/통합), 창립 연도, 출석 인원, 법인 정보. 카피 반영 전 실값 확인
- [ ] **담임목사 인물 사진 촬영** — 정면, 자연광. 현재 자산 없음
- [ ] **WorshipTimes "예배 약 70분" 객관 표기** — 4개 부수 모두 동일한 시간인지 확인. 다르면 카드별 명시

## 관련 코드

조립:
- [src/app/page.tsx](../../src/app/page.tsx) — 섹션 순서 재배열, PastorWelcome 추가

수정 대상:
- [src/domains/home/components/widgets/HomeHero/index.tsx](../../src/domains/home/components/widgets/HomeHero/index.tsx)
- [src/domains/home/components/widgets/WorshipTimes/index.tsx](../../src/domains/home/components/widgets/WorshipTimes/index.tsx)
- [src/domains/home/components/widgets/RecentSermons/index.tsx](../../src/domains/home/components/widgets/RecentSermons/index.tsx)
- [src/domains/home/components/widgets/VisitorAndNews/index.tsx](../../src/domains/home/components/widgets/VisitorAndNews/index.tsx)
- [src/domains/home/components/widgets/LocationMap/index.tsx](../../src/domains/home/components/widgets/LocationMap/index.tsx)

신설 예정:
- `src/domains/home/components/widgets/PastorWelcome/index.tsx`

자산 필요:
- 담임목사 정면 인물 사진 (자연광) → `src/assets/images/main/pastor.jpg` 권장

## 관련 결정

- [ADR 0001 — Warm Paper → Sky Blue 팔레트 전환](../decisions/0001-sky-palette.md)
- [ADR 0002 — 홈 IA 재구성과 카피 톤 원칙](../decisions/0002-home-ia-and-tone.md)
