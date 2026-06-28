import type { ReactNode, CSSProperties } from 'react';

interface SectionShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: 'default' | 'alt';
  style?: CSSProperties;
}

export default function SectionShell({
  children,
  className = '',
  contentClassName = 'max-w-5xl mx-auto',
  variant = 'default',
  style,
}: SectionShellProps) {
  return (
    <section
      className={`py-20 md:py-28 px-6 md:px-8 transition-colors duration-500 ${className}`}
      style={{
        ...(variant === 'alt' ? { backgroundColor: 'var(--v2-section-bg-alt, transparent)' } : {}),
        ...style,
      }}
    >
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
