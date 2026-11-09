/**
 * 운영 서버가 페이지를 다시 만드는 중인지(ISR 재생성). 이때 데이터 받기에 실패하면 던져야 Next 가
 * 직전에 성공한 페이지를 계속 보여 준다. 빌드 중(배포를 막지 않게)·개발 서버에서는 실패를 넘기고 화면이 직접 받게 한다.
 */
export const isRuntimeRegeneration = () =>
  process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build';
