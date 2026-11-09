import { FOCUS_RING } from '@/shared/components/ui/focusRing';
import * as OriginTabs from '@/shared/components/ui/tabs';

interface TabOption {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps extends React.ComponentProps<typeof OriginTabs.Tabs> {
  options: TabOption[];
}

export const Tabs = ({ options, ...props }: TabsProps) => {
  return (
    <OriginTabs.Tabs {...props}>
      <OriginTabs.TabsList>
        {options.map(option => (
          // 탭 버튼 포커스 링은 사이트 공용(b1) — shadcn 기본 회색 링은 b1 배경에서 거의 안 보인다
          <OriginTabs.TabsTrigger key={option.value} value={option.value} className={FOCUS_RING}>
            {option.label}
          </OriginTabs.TabsTrigger>
        ))}
      </OriginTabs.TabsList>

      {options.map(option => (
        <OriginTabs.TabsContent key={option.value} value={option.value}>
          {option.content}
        </OriginTabs.TabsContent>
      ))}
    </OriginTabs.Tabs>
  );
};
