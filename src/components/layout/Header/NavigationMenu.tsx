import Link from 'next/link';

const menuItems = [
  { href: '/about', children: '교회소개' },
  { href: '/worship', children: '예배안내' },
  { href: '/next-generation', children: '다음세대' },
  { href: '/news', children: '교회소식' },
  { href: '/documents', children: '자료실' },
  { href: '/map', children: '찾아오시는 길' },
] as const;

const MenuItem = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Link href={href} className="text-xl font-bold hover:text-gray-600">
      {children}
    </Link>
  );
};

export const NavigationMenu = () => {
  return (
    <nav className="flex gap-4">
      {menuItems.map(item => (
        <MenuItem key={item.href} href={item.href}>
          {item.children}
        </MenuItem>
      ))}
    </nav>
  );
};
