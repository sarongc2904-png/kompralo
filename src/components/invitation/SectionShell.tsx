import type { ReactNode } from 'react';

interface SectionShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: 'default' | 'alt';
}

export default function SectionShell({
  children,
  className = '',
  contentClassName = 'max-w-5xl mx-auto',
  variant = 'default',
}: SectionShellProps) {
  return (
    <section 
      className={`py-20 md:py-28 px-6 md:px-8 transition-colors duration-500 bg-transparent ${className}`}
      style={variant === 'alt' ? { backgroundColor: 'var(--v2-section-bg-alt, transparent)' } : undefined}
    >
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
