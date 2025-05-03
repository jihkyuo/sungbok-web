import { HomeHero } from '@/domains/home/components/widgets/HomeHero';
import { VisionTitle } from '@/domains/home/components/widgets/VisionTitle';
import { WorshipTimeTable } from '@/domains/home/components/widgets/WorshipTimeTable';
import { WorshipVideoSection } from '@/domains/home/components/widgets/WorshipVideoSection';

export default function Home() {
  return (
    <>
      <HomeHero />
      <VisionTitle />
      <WorshipVideoSection />
      <WorshipTimeTable />
      {/* <DepartmentsSection /> */}

      <div className="bg-green-200 py-30">
        <h3 className="text-2xl font-bold">메인홈 TODO</h3>
        <ul>
          <li>ON AIR 가능? 성복교회 유튜브 실시간 영상 연동</li>
          <li>예배 영상 유튜브 링크말고 파일로 받기(추후 어드민으로 변경) and 액션 아이콘 논의</li>
          <li>부서별 인스타 SNS preview 및 링크 버튼 추가</li>
          <li>새가족등록 form(사이드 플로팅 버튼)</li>
          <li>양육/훈련</li>
          <li>부서 카드 호버 시 담당자 화면 전환</li>
          <li>헤더 메뉴 호버 화면 추가</li>
          <li>스크롤 옵저버 쇼인 애니메이션 추가</li>
          <li>비젼 타이틀 스크롤 시 배경 전환과 함께 텍스트 전환되기</li>
          <li>전체적인 분위기를 모던하고 영하게 하며, 가시성을 최우선으로 하기</li>
        </ul>

        <h3 className="mt-10 text-2xl font-bold">DEV</h3>
        <ul>
          <li>반응형</li>
          <li>SEO</li>
          <li>메타 데이터 설정</li>
          <li>개발용 배포 (vercel)</li>
          <li>목데이터 supabase 연동</li>
        </ul>
      </div>
    </>
  );
}
