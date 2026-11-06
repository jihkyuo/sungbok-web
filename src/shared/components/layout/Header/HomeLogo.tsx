import Link from 'next/link';

export const HomeLogo = () => {
  return (
    <Link
      href="/"
      className="text-b1-text inline-flex min-h-11 items-center gap-2 no-underline transition-opacity hover:opacity-80"
    >
      <span
        aria-hidden
        className="b1-pulse-dot bg-b1-accent inline-block h-2 w-2 rounded-full"
      />
      <span className="text-body font-extrabold tracking-[-0.02em]">성복교회</span>
    </Link>
  );
};
