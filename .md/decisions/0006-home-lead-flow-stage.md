# ADR 0006 — 홈 상단: 히어로가 사진 띠로 내려앉는 변형 무대 (HomeLead 재설계)

- 일자: 2026-10-19
- 상태: 채택 (시안 P 승격)
- 관련: [0003 히어로 v2](0003-hero-v2-bleed-blur-kenburns.md), 메모리 `project-hero-lead-morph`

## 맥락
히어로(웜화이트 메시 + 우측 전경) 바로 아래 HomeLead 가 앰버→네이비 풀블리드 그라데이션이라 색이 끊기고, 두 섹션이 독립된 정지 화면이라 "연결"이 없었다. 랜딩도 전부 정적이었다.

## 결정
1. **HomeHero 에 랜딩 등장 모션**(CSS keyframe 1회): 사진 →, 텍스트 ← + 블러, CTA ↑. toss.im 실측 easing. 1회성 등장 블러는 DESIGN.md 모션 바 예외로 명문화.
2. **HomeLead 를 "변형 무대"로 재설계**하고 HomeHero 를 안에 품는다. 170svh 트랙 + 100svh sticky. 무대에는 상단 왼쪽 표어(정적)와 항상 흐르는 두 줄 교인 사진 띠(역방향 — 2026-10-25 후속: 세 줄로 확장, 셋째 줄은 모바일 숨김)가 깔려 있고, 스크롤하면 전체화면 히어로가 줄어들어 윗줄 빈 칸에 **전경 사진 그대로** 내려앉는다(사진 교체 없음). 안착 후 핀이 풀리고 담임 인사는 일반 스크롤 섹션(PastorStatic). 전체 화이트 톤.
3. 카드 변형은 바깥 창 비균등 scale × 안쪽 역scale(FLIP) 로 transform/opacity 만 사용. 역스크롤은 빈 칸을 화면 중앙으로 되감는 블렌드로 튐을 없앤다.

## 거부한 대안
- 담임까지 모션으로 잇는 3단 핀(A~C): 핀 1,000px 구간에 읽을 콘텐츠가 없어 "스크롤해도 아무 일 없음".
- 콘텐츠 밀도형(스티키 미디어·압축 핀·벤토, D~F) 및 정적 갤러리(H~J): 사용자 거부(방향 오류 / 분위기 안 삶).
- 안착 후 띠가 흐르기 시작하는 안(K~M): 역스크롤 시 떠내려간 카드가 화면 밖에서 튐, 축소 중 사진 교체가 어색.

## 결과
- 정식: `HomeHero/index.tsx`(등장 모션·copyClassName), `HomeLead/{index,MorphFrame,PastorStatic}.tsx`, `morphMath.ts`(+test), `flowPhotos.ts`. `page.tsx` 는 `<HomeLead />` 하나로 히어로~담임을 렌더.
- 표어·인사말 카피는 placeholder(사무국 검수 전). 구 HomeLead(앰버·네이비 그라데)는 폐기.
