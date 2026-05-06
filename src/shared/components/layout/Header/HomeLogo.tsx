import Link from 'next/link';

export const HomeLogo = () => {
  return (
    <Link
      href="/"
      className="text-b1-text flex items-center gap-2.5 no-underline transition-opacity hover:opacity-80"
    >
      <span
        aria-hidden
        className="bg-b1-accent text-b1-bg inline-flex h-[26px] w-[26px] items-center justify-center rounded-[4px] text-[13px] font-bold"
      >
        S
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.01em]">
        성복교회
        <span className="b1-mono text-b1-muted ml-1.5 text-[12px] font-medium">SUNGBOK</span>
      </span>
    </Link>
  );
};
