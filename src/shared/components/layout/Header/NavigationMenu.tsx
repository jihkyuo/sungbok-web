import Link from 'next/link';
import type { PropsWithChildren } from 'react';

interface MenuItemProps extends PropsWithChildren {
  href: string;
}

export const menuItems = [
  { href: '/about', children: '교회소개' },
  { href: '/worship-video', children: '예배' },
  { href: '/next-generation', children: '다음세대' },
  { href: '/news', children: '교회소식' },
  { href: '/documents', children: '자료실' },
  { href: '/map', children: '찾아오시는 길' },
] as const;

const MenuItem = ({ href, children }: MenuItemProps) => {
  return (
    <Link
      href={href}
      className="text-b1-text hover:bg-b1-text/[0.04] rounded-md px-3.5 py-2.5 text-[14px] font-medium transition-colors"
    >
      {children}
    </Link>
  );
};

export const NavigationMenu = () => {
  return (
    <nav className="hidden gap-1 md:flex">
      {menuItems.map(item => (
        <MenuItem key={item.href} href={item.href}>
          {item.children}
        </MenuItem>
      ))}
    </nav>
  );
};
