# 홈 (`/`)

성복교회 웹사이트의 진입 페이지. 1순위 사용자는 **첫 방문 예정자(비신자/탐색자)**, 궁극 전환 목표는 **주일예배 오프라인 방문**. 이 페이지의 모든 의사결정은 첫 방문자의 "이 교회 정상인가, 분위기는 어떤가 → 언제·어디로 가면 되나"의 흐름에 최적화된다.

> 결정 배경·대안 비교는 [ADR 0002](../decisions/0002-home-ia-and-tone.md) 참조.

## 흐름

> **건물 → 사람의 얼굴 → 사람의 인사 → 시간 → 영상 → 부서 → 방문 정보 → 위치**

## 섹션 IA

| #   | 섹션             | 컴포넌트                                                                                 | 상태                                   |
| --- | ---------------- | ---------------------------------------------------------------------------------------- | -------------------------------------- |
| 1   | HomeHero v2      | [HomeHero](../../src/domains/home/components/widgets/HomeHero/index.tsx)                 | v2 적용 (Bleed + 4단 Blur + Ken Burns) |
| 2   | PastorWelcome    | (신설 예정) `src/domains/home/components/widgets/PastorWelcome/`                         | 미구현                                 |
| 3   | WorshipTimes     | [WorshipTimes](../../src/domains/home/components/widgets/WorshipTimes/index.tsx)         | 유지                                   |
| 4   | RecentSermons    | [RecentSermons](../../src/domains/home/components/widgets/RecentSermons/index.tsx)       | 유지 + placeholder 카드 교체           |
| 5   | CommunityGallery | [CommunityGallery](../../src/domains/home/components/widgets/CommunityGallery/index.tsx) | 유지 + 모바일 6+더보기                 |
| 6   | VisitorAndNews   | [VisitorAndNews](../../src/domains/home/components/widgets/VisitorAndNews/index.tsx)     | 유지 + 좌:우 60:40                     |
| 7   | LocationMap      | [LocationMap](../../src/domains/home/components/widgets/LocationMap/index.tsx)           | 유지 + "주소 복사" 추가                |

조립 위치: [src/app/page.tsx](../../src/app/page.tsx)

## 섹션 사양

### 1. HomeHero v2

| 항목              | 내용                                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **목적**          | "이 교회는 누가 운영하고, 어떤 분위기인가?"에 첫 5초 안에 답한다. 스크롤하면서 외관 → 내부 → 예배 → 담임목사 4단계로 흘러간다.                                                |
| **구조**          | 360vh 스크롤 트랙 + sticky stage (100dvh). 사진은 우측 82% 폭으로 사방 흘러넘쳐 사각형 경계가 없음. 좌측만 부드러운 linear-gradient 마스크로 텍스트 영역에 자연스럽게 페이드. |
| **인터랙션**      | 사진 4단 (blur 0→20→0, scale 0.96→1.0→1.06) + 활성 사진 9초 Ken Burns. 텍스트 4단 (같은 위치 blur 페이드). CTA·위치 완전 고정. 상단 도트 진행 바.                             |
| **데이터**        | `src/domains/home/data/heroStages.ts` 의 `HERO_STAGES` 4개 항목. 각 항목에 라벨·이미지·카피 정의.                                                                             |
| **자산 미확보**   | 4단계 중 3장 (내부·예배·담임목사) 미확보 — 그라디언트 자리표시자로 대체. 촬영 후 `heroStages.ts` 에서 image 임포트로 교체.                                                    |
| **Primary CTA**   | "이번 주 예배 시간" (`#worship` 앵커)                                                                                                                                         |
| **Secondary CTA** | "오시는 길" (`#location` 앵커)                                                                                                                                                |
| **성공 지표**     | 2번 섹션 도달률 ≥ 70%, Primary CTA 클릭률, 평균 체류 5초+                                                                                                                     |

> 배경·대안 비교는 [ADR 0003](../decisions/0003-hero-v2-bleed-blur-kenburns.md) 참조.

#### HomeHero — 회귀 방지 불변식

> 현재 구현은 v8(고정 전경 문열림 히어로 + 차오르는 예배·담임 섹션 + 무빙 그라데이션)이다(위 v2 표는 추후 전면 갱신 예정). 아래는 개발 중 **다시 깨지면 안 되는** 인터랙션 불변식 — 수정 시 반드시 유지·검증할 것.

1. **타이틀 SSR 중앙화** — 닫힘 타이틀은 **첫 페인트(서버)부터 중앙**이어야 하고, JS가 스크롤 `open`에 따라 좌측으로 보간한다. 기본 CSS를 좌측 도크 위치로 두지 말 것.
   - 깨지면: 최상단 새로고침 시 타이틀이 **왼쪽→중앙으로 튐**.
   - 위치: `HomeHero` `#a1copy` (기본 `left-1/2` + 인라인 `translate(-50%,-50%)`).
2. **문 경계 그림자는 좌측 페이드 마스크 밖, 풀폭 오버레이** — 사진 `#a1wrap`(좌측 `mask-image`) **안에 넣지 말 것**. rAF로 클립 경계의 뷰포트 y에 맞춰 화면 전체 너비로 배치.
   - 깨지면: 문 열림 경계선이 **왼쪽에서 잘림**(불완전한 문).
   - 위치: `HomeHero` `edgeTop`/`edgeBottom` (히어로 직계, z 사진과 타이틀 사이).
3. **스크롤 위치 복원은 즉시(non-smooth)로 유지** — 로드 시 `scroll-behavior:auto`를 잠깐 강제해 복원을 즉시화하고, 그 뒤 CSS `smooth`로 복귀. **복원 기능 자체는 유지**.
   - 깨지면: 중간 스크롤에서 새로고침 시 인터랙션이 **처음부터 바쁘게 재생**되며 자리잡음.
   - 위치: `src/app/_provider.tsx` (마운트 시 토글). cf. `globals.css` `html { scroll-behavior: smooth }`.
4. **히어로 이미지 `sizes`는 `scale(1.08)`+bleed 반영 반응형** + `quality` 명시.
   - 깨지면: 가로 뷰포트를 좁히면 전경 사진이 **흐릿**(작은 후보 업스케일).
   - 위치: `HomeHero` `<Image sizes="(max-width:768px) 96vw, 84vw" quality={85} />`.
5. **문 열림은 최상단 트리거 일방향(latch)** — door/CTA/타이틀은 단조 래치 `introMax`로 구동. 닫힘에서 시작하는 건 "최상단에서 로드"될 때뿐(신규 진입/최상단 새로고침); 한번 열리면 스크롤 업에도 **닫히지 않고** open+CTA 유지, 중간 위치 새로고침은 즉시 open+CTA.
   - 깨지면: 문이 열렸다 스크롤 올리면 **역방향으로 다시 닫힘**, 또는 중간 새로고침 시 인트로가 다시 재생.
   - 위치: `HomeHero`. 문 열림 연출은 **시간 기반 `introOverride`(선형)**로 그리고(스크롤 이징에 묶지 말 것 — 빠른 중간에 몰려 안 보임), 재생 후 `introMax` 래치로 고정. 인트로 자동재생/예배·담임 보정은 JS 가이드 스냅이 담당(CSS scroll-snap 미사용).
   - 재사용 패턴 상세: [patterns/scroll-autoplay-intro.md](../patterns/scroll-autoplay-intro.md).

### 2. PastorWelcome (신설)

| 항목              | 내용                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **목적**          | "이 교회는 누가 인도하나?" — 사람의 얼굴 다음에 사람의 1인칭 메시지로 자연스럽게 이어간다.                                                                                                                                                                                                                             |
| **콘텐츠**        | • 담임목사 정면 인물 사진 (자연광)<br>• 인사말 2~3문장. 신학 용어·약속·환대형 멘트 배제, 단정한 환영의 진술. 안: 「성복교회에 오신 것을 환영합니다. 이 자리는 신앙의 유무와 상관없이 누구에게나 열려 있습니다.」<br>• 직함·이름·서명체 1줄 (예: 「담임목사 ○○○」)<br>• 보조 CTA: "담임목사 소개" 또는 "설교 영상 보기" |
| **타이포·톤**     | 카드형 b1-surface, 라운드 16px. 인사말 18px medium, 줄간 1.7. 사진 좌측 1/3, 텍스트 2/3 (모바일은 위/아래).                                                                                                                                                                                                            |
| **Primary CTA**   | "설교 영상 보기" (`#sermons` 앵커)                                                                                                                                                                                                                                                                                     |
| **Secondary CTA** | 없음                                                                                                                                                                                                                                                                                                                   |
| **성공 지표**     | 다음 섹션 도달률, 페이지 깊이 50% 도달률                                                                                                                                                                                                                                                                               |

### 3. WorshipTimes

| 항목              | 내용                                                                                                                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **목적**          | "그래서 몇 시에 가면 되나?"의 즉답.                                                                                                                                                                                                 |
| **콘텐츠**        | • 1~4부 카드 4개 (현재 데이터 유지)<br>• 4개 시간을 동등하게 보여주고 사용자가 스스로 선택. 추천 뱃지·"부담 없이" 류 멘트 배제.<br>• "예배 약 70분" 정도는 단정한 사실 라벨로 카드에 삽입 가능 (4개 부수 시간 동일 여부 확인 필요). |
| **타이포·톤**     | 시간은 b1-mono. 카드 4개 동등 비중.                                                                                                                                                                                                 |
| **Primary CTA**   | "전체 예배 안내" (`/worship-video`)                                                                                                                                                                                                 |
| **Secondary CTA** | "오시는 길" (`#location`)                                                                                                                                                                                                           |
| **성공 지표**     | 4개 카드 클릭/포커스 분포, Primary CTA 클릭률                                                                                                                                                                                       |

### 4. RecentSermons

| 항목              | 내용                                                                                                                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **목적**          | "예배 분위기는 실제로 어떤가?" — 멘트로 설명하지 않고 보여준다.                                                                                                                                                                                              |
| **콘텐츠**        | • 담임 설교 1개 (메인, YouTube 임베드)<br>• 청년부 영상 1개 (서브) — 현재 placeholder 그라디언트 카드는 "준비 안 된 사이트" 신호이므로 정적 사진(청년부 활동컷) 또는 실제 영상으로 교체.<br>• 카드 메타: 설교 제목·날짜·본문절. 시청 부담 해소 류 멘트 배제. |
| **타이포·톤**     | 메인 영상 자동재생·음소거·루프 (현재 유지).                                                                                                                                                                                                                  |
| **Primary CTA**   | "설교 모아보기" (`/worship-video`)                                                                                                                                                                                                                           |
| **Secondary CTA** | "청년부 영상"                                                                                                                                                                                                                                                |
| **성공 지표**     | unmute 클릭률, 30초+ 시청률, `/worship-video` 이동률                                                                                                                                                                                                         |

### 5. CommunityGallery

| 항목              | 내용                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **목적**          | "내 또래/가족이 갈 자리가 있는가?" — 사진의 진정성으로 답한다.                                                                            |
| **콘텐츠**        | 9개 부서 카드 유지. 모바일 6개까지 노출 + "전 부서 보기 ▼". 카드는 모델컷·연출컷이 아닌 실제 활동컷. 카피는 부서명·연령대 같은 사실 라벨. |
| **타이포·톤**     | 섹션 헤더 "한 사람을 환대하는 공동체" 유지.                                                                                               |
| **Primary CTA**   | 각 카드 → `/next-generation`                                                                                                              |
| **Secondary CTA** | 없음                                                                                                                                      |
| **성공 지표**     | 카드 클릭률 (특히 청년부·엘림가족부 — 첫 방문자 페르소나 두 축)                                                                           |

### 6. VisitorAndNews

| 항목              | 내용                                                                                                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **목적**          | 방문 안내(좌, 60%): 결정한 사람의 마지막 실용 정보 / 소식(우, 40%): 살아있는 교회 신호.                                                                                                                                 |
| **콘텐츠**        | • 좌측: 방문 안내 카드(주소·주차·문의·메일). 환대 약속 멘트 배제, 정보만 단정하게.<br>• `mailto:`/`tel:` 진짜 클릭 가능 링크로 (현재 `div`로만 표시되어 동작 X).<br>• 우측: 소식 4개. 날짜 절대 표기(예: "2026.04.28"). |
| **타이포·톤**     | 좌측 카드 b1-accent 배경(현재 유지). 우측 태그 컬러는 1가지로 통일.                                                                                                                                                     |
| **Primary CTA**   | "전화 문의" (`tel:`)                                                                                                                                                                                                    |
| **Secondary CTA** | "소식 더 보기" (`/news`)                                                                                                                                                                                                |
| **성공 지표**     | `tel:`/`mailto:` 클릭률                                                                                                                                                                                                 |

### 7. LocationMap

| 항목              | 내용                                                                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **목적**          | "지금 결정 → 어떻게 가지?" 마지막 행동 도구.                                                                                                                                                                                 |
| **콘텐츠**        | • Google Maps 임베드 (현재 유지)<br>• PARKING / TRANSIT / CONTACT 3카드 (현재 유지)<br>• "주소 복사" 버튼 추가 — 모바일 사용자가 본인 지도앱으로 옮기는 가장 빠른 행동.<br>• 도착 시나리오 멘트("정문에 안내 위원" 등) 배제. |
| **타이포·톤**     | 헤더 "찾아오시는 길" 유지. 지도 16:10 + 우측 카드 정렬.                                                                                                                                                                      |
| **Primary CTA**   | "네이버 지도로 길찾기"                                                                                                                                                                                                       |
| **Secondary CTA** | "주소 복사" / "전화 문의"                                                                                                                                                                                                    |
| **성공 지표**     | **외부 지도 링크 클릭률 = 사실상 전환 이벤트** (오프라인 방문 의도의 가장 강한 신호)                                                                                                                                         |

## 히어로 인터랙티브 — 종결

`__sketches/home-hero/`(9개) + `__sketches/home-hero-v2/`(14개) 시안을 거쳐, **사진 4단 Bleed + Blur 페이드 + Ken Burns**(sketch 12) 구성으로 결정. ADR 0002 미결 "Option 1 vs Option 3"을 종결. 배경·대안 비교는 [ADR 0003](../decisions/0003-hero-v2-bleed-blur-kenburns.md) 참조.

## 모바일 우선 고려사항

한국 교회 사이트 모바일 비중 75~90%. 모든 결정은 모바일 기준.

| 섹션             | 모바일 처리                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| HomeHero         | sticky 4단 스크롤 유지. 사진은 더 넓게(130%) 깔되 불투명도 0.35~0.5로 낮춰 배경처럼, 텍스트는 그 위에 풀폭으로. 도트 진행 바로 4단 위치 안내. |
| PastorWelcome    | 사진 위 → 텍스트 아래. 사진 4:5 인물 비율. 인사말 17px medium.                                                                                |
| WorshipTimes     | 4개 카드 2×2 그리드. 4개 모두 동등 비중.                                                                                                      |
| RecentSermons    | 메인 영상 위, 서브 카드 아래. 첫 프레임 썸네일 품질 중요(자동재생 제한 대비).                                                                 |
| CommunityGallery | 2열, 6개까지 + "전체 부서 보기 ▼".                                                                                                            |
| VisitorAndNews   | 1열 스택 (방문 안내 위 / 소식 아래).                                                                                                          |
| LocationMap      | 지도 4:3 압축. 지도 위 "지도 앱으로 열기" 버튼 우선.                                                                                          |

**글로벌 모바일 룰**:

- CTA는 화면 폭 가득 또는 그에 가깝게.
- 섹션 패딩 데스크톱 96px → 모바일 56~64px (현재 `py-14` 적정).
- 본문 16px 하한, 보조 텍스트도 14px 미만 금지 (시니어 비중).
- Reveal 애니메이션 delay 모바일에서 절반, 첫 뷰포트는 즉시 표시.

## 카피 톤 원칙

홈의 모든 카피는 **사실의 정중한 진술** 톤으로 작성한다. 영업·약속·환대 멘트는 일괄 배제. 상세 가이드와 배제/사용 예시는 [ADR 0002](../decisions/0002-home-ia-and-tone.md) 의 "결정 2" 참조.

## 데이터 소스

현재 모든 데이터는 정적 상수. CMS/DB 미사용.

| 데이터       | 위치                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| 히어로 4단계 | [src/domains/home/data/heroStages.ts](../../src/domains/home/data/heroStages.ts) (`HERO_STAGES`)            |
| 예배 시간    | [src/domains/home/data/worshipTimes.ts](../../src/domains/home/data/worshipTimes.ts) (`HERO_WORSHIP_TIMES`) |
| 부서 정보    | [src/domains/home/data/ministries.ts](../../src/domains/home/data/ministries.ts) (`MINISTRIES`)             |
| 설교/뉴스    | 각 위젯 컴포넌트 내 상수 (`SERMON_FEATURED`, `NEWS_ITEMS`)                                                  |
| 이미지       | `src/assets/images/main/` (정적 임포트)                                                                     |

신설 시 권장 위치: `src/domains/home/data/pastorWelcome.ts` 등 도메인 `data/` 디렉터리에 일관 배치.

## 미결 사항 (Open Questions)

다음 사항은 시안·구현 단계에서 결정한다. 결정될 때마다 본 섹션에서 제거하고 본문에 반영한다.

- [ ] **메인 카피 최종 문구** — 히어로 4단 카피(`heroStages.ts`)는 모두 placeholder. 담임목사·교회 사무국 검수 필요. 특히 0번 교단 정식 명칭·창립 연도, 3번 담임목사 이름·부임 연도, 2번 매주 본문 갱신 정책
- [ ] **PastorWelcome 인사말 문구** — 담임목사 본인 검수 필수
- [ ] **객관 정보 정확값** — 교단(예장 합동/통합), 창립 연도, 출석 인원, 법인 정보. 카피 반영 전 실값 확인
- [ ] **히어로 사진 3장 촬영** — 본당 내부(`main02.jpg`)·예배 풍경(`main03.jpg`)·담임목사 정면(`pastor.jpg`). 미확보 시 그라디언트 자리표시자로 동작. 담임목사 정면 컷은 PastorWelcome에서도 사용
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
- [ADR 0003 — 히어로 v2: Bleed + 4단 Blur + Ken Burns](../decisions/0003-hero-v2-bleed-blur-kenburns.md)
