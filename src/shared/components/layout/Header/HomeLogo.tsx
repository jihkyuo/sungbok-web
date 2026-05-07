import Link from 'next/link';

export const HomeLogo = () => {
  return (
    <Link
      href="/"
      className="text-b1-text inline-flex items-center gap-2 no-underline transition-opacity hover:opacity-80"
    >
      <span
        aria-hidden
        className="b1-pulse-dot bg-b1-accent inline-block h-2 w-2 rounded-full"
      />
      <span className="text-[16px] font-extrabold tracking-[-0.02em]">성복교회</span>
    </Link>
  );
};
