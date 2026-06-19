import type { ReactNode } from 'react';

interface SectionShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function SectionShell({
  children,
  className = '',
  contentClassName = 'max-w-5xl mx-auto',
}: SectionShellProps) {
  return (
    <section className={`py-20 md:py-28 px-6 md:px-8 bg-transparent ${className}`}>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
