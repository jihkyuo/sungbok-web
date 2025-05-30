import { LinkBgCard } from '@/shared/components/features/BgOverlayCard/LinkBgCard';
import type { PropsWithChildren } from 'react';

// 부서 이미지
import dep01Img from '@/assets/images/main/department/dep01.jpg';
import dep02Img from '@/assets/images/main/department/dep02.jpg';
import dep03Img from '@/assets/images/main/department/dep03.jpg';
import dep04Img from '@/assets/images/main/department/dep04.jpg';
import dep05Img from '@/assets/images/main/department/dep05.jpg';
import dep06Img from '@/assets/images/main/department/dep06.jpg';
import dep07Img from '@/assets/images/main/department/dep07.jpg';
import dep08Img from '@/assets/images/main/department/dep08.jpg';
import dep09Img from '@/assets/images/main/department/dep09.jpg';

// 호버 시 표시할 부서 담당자 이미지
import depManager01Img from '@/assets/images/main/department/dep_manager01.jpg';
import depManager02Img from '@/assets/images/main/department/dep_manager02.jpg';
import depManager03Img from '@/assets/images/main/department/dep_manager03.jpg';
import depManager04Img from '@/assets/images/main/department/dep_manager04.jpg';
import depManager05Img from '@/assets/images/main/department/dep_manager05.jpg';
import depManager06Img from '@/assets/images/main/department/dep_manager06.jpeg';
import depManager07Img from '@/assets/images/main/department/dep_manager07.jpg';
import depManager08Img from '@/assets/images/main/department/dep_manager08.jpg';
import { Section } from '@/domains/home/components/features/Section';
import { SectionTitle } from '@/domains/home/components/features/SectionTitle';
import { DividerLine } from '@/shared/components/features/DividerLine';

export const DepartmentsSection = () => {
  return (
    <Section className={'flex flex-col gap-15 py-20'}>
      <SectionTitle title="교육 위원회" subtitle="다음 세대" />

      <div className={'mb-40 flex flex-col gap-20'}>
        <SectionContainer>
          <Title>제1 교육 위원회</Title>
          <GridSection>
            <LinkBgCard
              imgSrc={dep01Img.src}
              hoverImgSrc={depManager01Img.src}
              title="영아부"
              subtitle={
                <p>
                  1세부터 4세까지의 영아에게 <br /> 믿음의 씨앗을 심는 곳입니다.
                </p>
              }
            />

            <LinkBgCard
              imgSrc={dep02Img.src}
              hoverImgSrc={depManager02Img.src}
              title="유치부"
              subtitle={
                <p>
                  5세부터 7세까지의 어린이들이 말씀을 <br /> 바르게 배워 견고한 믿음을 세워가는
                  곳입니다.
                </p>
              }
            />

            <LinkBgCard
              imgSrc={dep03Img.src}
              hoverImgSrc={depManager03Img.src}
              title="유년부"
              subtitle={
                <p>
                  1~3학년 아이들이 함께 모여서 <br /> 하나님의 가치관으로 살도록 가르칩니다.
                </p>
              }
            />

            <LinkBgCard
              imgSrc={dep04Img.src}
              hoverImgSrc={depManager04Img.src}
              title="초등부"
              subtitle={
                <p>
                  하나님을 기뻐하고 자랑하는 <br /> 아이가 되도록 세워갑니다.
                </p>
              }
            />

            <LinkBgCard
              imgSrc={dep05Img.src}
              hoverImgSrc={depManager05Img.src}
              title="중등부"
              subtitle={<p>하나님의 은혜가 흐르는 공동체 입니다.</p>}
            />

            <LinkBgCard
              imgSrc={dep06Img.src}
              hoverImgSrc={depManager06Img.src}
              title="고등부"
              subtitle={
                <p>
                  주님이 주신 비전을 가지고 삶을 <br /> 희망차게 살 수 있도록 세워갑니다.
                </p>
              }
            />

            <LinkBgCard
              imgSrc={dep07Img.src}
              hoverImgSrc={depManager06Img.src}
              title="영어 예배부"
              subtitle={
                <p>
                  영어로 복음을 전할 주님의 일꾼들을 <br /> 준비시키기 위한 활동이 중심입니다.
                </p>
              }
            />
          </GridSection>
        </SectionContainer>

        <SectionContainer>
          <Title>제2 교육 위원회</Title>
          <GridSection>
            <LinkBgCard
              imgSrc={dep08Img.src}
              hoverImgSrc={depManager07Img.src}
              title="청년부"
              subtitle={
                <p>
                  예수님의 사랑 안에서 이웃 청년들이 깃들 수 있는 <br /> 넓은 품으로 함께 지어져
                  가는 사랑 공동체 입니다.
                </p>
              }
            />

            <LinkBgCard
              imgSrc={dep09Img.src}
              hoverImgSrc={depManager08Img.src}
              title="엘림가족부"
              subtitle={
                <p>
                  부부와 부모로서의 서툰 시작을 하나님 안에서
                  <br /> 대화와 기도로 함께 만들어 가는 공동체 입니다.
                </p>
              }
            />
          </GridSection>
        </SectionContainer>
      </div>
    </Section>
  );
};

const SectionContainer = ({ children }: PropsWithChildren) => {
  return <div className={'flex flex-col gap-6'}>{children}</div>;
};

const GridSection = ({ children }: PropsWithChildren) => {
  return (
    <div
      className={
        'grid grid-cols-1 gap-5 sm:gap-10 lg:grid-cols-[repeat(auto-fill,minmax(430px,1fr))]'
      }
    >
      {children}
    </div>
  );
};

const Title = ({ children }: PropsWithChildren) => {
  return (
    <div>
      <h3 className={'text-2xl font-bold sm:text-3xl'}>{children}</h3>
      <DividerLine />
    </div>
  );
};
