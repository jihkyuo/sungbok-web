import { LinkBgCard } from '@/domains/home/components/features/LinkBgCard';

// 부서 이미지
import dep01Img from '@/assets/images/main/dep01.jpg';
import dep02Img from '@/assets/images/main/dep02.jpg';
import dep03Img from '@/assets/images/main/dep03.jpg';
import dep04Img from '@/assets/images/main/dep04.jpg';
import dep05Img from '@/assets/images/main/dep05.jpg';
import dep06Img from '@/assets/images/main/dep06.jpg';
import dep07Img from '@/assets/images/main/dep07.jpg';
import dep08Img from '@/assets/images/main/dep08.jpg';
import dep09Img from '@/assets/images/main/dep09.jpg';
import { GridSection } from '@/domains/home/components/features/GridSection';
import type { PropsWithChildren } from 'react';

export const DepartmentsSection = () => {
  return (
    <div className={'my-40 flex flex-col gap-20'}>
      <SectionContainer>
        <Title>제1 교육 위원회</Title>
        <GridSection>
          <LinkBgCard
            imgSrc={dep01Img.src}
            title="영아부"
            subtitle={
              <p>
                1세부터 4세까지의 영아에게 <br /> 믿음의 씨앗을 심는 곳입니다.
              </p>
            }
          />

          <LinkBgCard
            imgSrc={dep02Img.src}
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
            title="유년부"
            subtitle={
              <p>
                1~3학년 아이들이 함께 모여서 <br /> 하나님의 가치관으로 살도록 가르칩니다.
              </p>
            }
          />

          <LinkBgCard
            imgSrc={dep04Img.src}
            title="초등부"
            subtitle={
              <p>
                하나님을 기뻐하고 자랑하는 <br /> 아이가 되도록 세워갑니다.
              </p>
            }
          />

          <LinkBgCard
            imgSrc={dep05Img.src}
            title="중등부"
            subtitle={<p>하나님의 은혜가 흐르는 공동체 입니다.</p>}
          />

          <LinkBgCard
            imgSrc={dep06Img.src}
            title="고등부"
            subtitle={
              <p>
                주님이 주신 비전을 가지고 삶을 <br /> 희망차게 살 수 있도록 세워갑니다.
              </p>
            }
          />

          <LinkBgCard
            imgSrc={dep07Img.src}
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
            title="청년부"
            subtitle={
              <p>
                예수님의 사랑 안에서 이웃 청년들이 깃들 수 있는 <br /> 넓은 품으로 함께 지어져 가는
                사랑 공동체 입니다.
              </p>
            }
          />

          <LinkBgCard
            imgSrc={dep09Img.src}
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
  );
};

const SectionContainer = ({ children }: PropsWithChildren) => {
  return <div className={'mx-10'}>{children}</div>;
};

const Title = ({ children }: PropsWithChildren) => {
  return (
    <div>
      <h3 className={'text-4xl font-bold'}>{children}</h3>
      <DividerLine />
    </div>
  );
};

const DividerLine = () => {
  return <div className={'mt-4 h-[2px] w-full bg-gradient-to-r from-gray-400 to-transparent'} />;
};
