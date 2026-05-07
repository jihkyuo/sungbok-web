import Link from 'next/link';
import { Fragment } from 'react';

export const menuItems = [
  { href: '/about', children: '교회소개' },
  { href: '/worship-video', children: '예배' },
  { href: '/next-generation', children: '다음세대' },
  { href: '/news', children: '교회소식' },
  { href: '/documents', children: '자료실' },
  { href: '/map', children: '찾아오시는 길' },
] as const;

export const NavigationMenu = () => {
  return (
    <nav className="text-b1-sub hidden items-center gap-2 text-[14px] md:flex">
      {menuItems.map((item, i) => (
        <Fragment key={item.href}>
          {i > 0 && (
            <span aria-hidden className="text-b1-muted">
              ·
            </span>
          )}
          <Link href={item.href} className="hover:text-b1-text transition-colors">
            {item.children}
          </Link>
        </Fragment>
      ))}
    </nav>
  );
};
