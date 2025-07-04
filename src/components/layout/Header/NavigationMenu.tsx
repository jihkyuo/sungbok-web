import Link from 'next/link';
import type { PropsWithChildren } from 'react';

interface MenuItemProps extends PropsWithChildren {
  href: string;
}

const menuItems = [
  { href: '/about', children: '교회소개' },
  { href: '/worship-video', children: '예배' },
  { href: '/next-generation', children: '다음세대' },
  { href: '/news', children: '교회소식' },
  { href: '/documents', children: '자료실' },
  { href: '/map', children: '찾아오시는 길' },
] as const;

const MenuItem = ({ href, children }: MenuItemProps) => {
  return (
    <Link href={href} className="text-xl font-bold">
      {children}
    </Link>
  );
};

export const NavigationMenu = () => {
  return (
    <nav className="flex gap-8">
      {menuItems.map(item => (
        <MenuItem key={item.href} href={item.href}>
          {item.children}
        </MenuItem>
      ))}
    </nav>
  );
};
