# 성복교회 웹사이트

## 폴더 구조(예시)

```
src/
├── app/                    
│   ├── (auth)/            
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/       
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/               # API 라우트
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── users/
│   │       └── route.ts
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
│
├── components/            # 재사용 가능한 컴포넌트
│   ├── common/               # 기본 UI 컴포넌트
│   │   ├── button.tsx    
│   │   ├── input.tsx     
│   │   └── card.tsx      
│   ├── layout/           # 레이아웃 컴포넌트
│   └── features/           # 기능단위 컴포넌트
│
├── domains/             # 도메인별 컴포넌트 및 로직
│   └── auth/            
│       ├── components/
│       │   ├── features/
│       │   └── widgets/
│       ├── hooks/
│       ├── api/
│       └── types/
│
├── lib/                 # 유틸리티 함수
│   ├── api-client.ts   # API 클라이언트
│   ├── utils.ts        # 유틸리티 함수
│   └── db.ts           # 데이터베이스 연결
│
├── hooks/              # 공통 훅
│   └── use-local-storage.ts  
│
├── store/              # 상태 관리 (Zustand)
│   ├── auth-store.ts   
│   └── product-store.ts  
│
├── styles/             # 스타일
│   └── globals.css
│
├── types/              # 전역 타입 정의
│   └── index.ts
│
├── locales/            # 국제화
│   ├── en.json
│   └── ko.json
│
└── config/            # 설정
    └── site.ts       # 사이트 설정
```

## 폴더 역할 설명

### app 폴더
- **페이지 및 라우팅**: 모든 페이지 컴포넌트를 포함
- **그룹화 방식**: 괄호를 사용한 폴더(`(auth)`)는 URL에 포함되지 않는 논리적 그룹
- **중첩 라우팅**: 폴더 구조가 그대로 URL 경로가 됨 (예: `/products/[id]`)

### components 폴더
- **ui**: 버튼, 입력창 등 기본 UI 컴포넌트
- **layout**: 페이지 레이아웃을 구성하는 컴포넌트
- **features**: 여러 페이지에서 공유되는 기능 컴포넌트

### domains 폴더
- **도메인별 모듈화**: 각 비즈니스 도메인별로 관련 코드를 모아둠
- **features**: 도메인 의존적인 기능 컴포넌트
- **widgets**: 도메인 의존적인 유기 컴포넌트
- **훅**: 기능별 상태 관리 및 로직
- **API**: 기능별 API 통신 로직
- **타입**: 기능별 타입 정의

### lib 폴더
- 프로젝트 전반에서 사용되는 유틸리티 함수 및 클래스
- API 클라이언트, 헬퍼 함수 등

### hooks 폴더
- 여러 기능에서 공통으로 사용되는 커스텀 훅

### store 폴더
- 전역 상태 관리 로직 (Zustand, Jotai, Redux 등)

### styles 폴더
- 전역 스타일 및 테마 정의

### types 폴더
- 전역적으로 사용되는 타입 정의

## 개발 원칙

1. **계층 간 의존성 방향**
   - 상위 계층은 하위 계층에 의존
   - Common → Features → Widgets → Page
   - 역방향 의존성 지양 (상위 컴포넌트를 하위에서 import 금지)

2. **도메인 분리**
   - 각 도메인은 독립적으로 운영
   - 도메인 간 직접 의존성 최소화
   - 필요시 전역 상태나 이벤트를 통해 통신

3. **재사용성**
   - 공통 컴포넌트는 최대한 재사용 가능하게 설계
   - 도메인 Features는 해당 도메인 내에서 재사용 가능하게 설계