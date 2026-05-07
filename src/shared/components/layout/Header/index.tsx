import { HomeLogo } from '@/shared/components/layout/Header/HomeLogo';
import { NavigationMenu } from '@/shared/components/layout/Header/NavigationMenu';
import { SideMenu } from '@/shared/components/layout/Header/SideMenu';

export const Header = () => {
  return (
    <header className="bg-b1-bg/70 border-b-b1-border sticky top-0 right-0 left-0 z-50 border-b backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-4 md:px-10">
        <HomeLogo />
        <NavigationMenu />
        <SideMenu />
      </div>
    </header>
  );
};
