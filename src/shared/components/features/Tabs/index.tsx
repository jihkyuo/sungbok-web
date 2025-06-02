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
          <OriginTabs.TabsTrigger key={option.value} value={option.value}>
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
