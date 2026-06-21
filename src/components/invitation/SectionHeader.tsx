import type { Theme } from '@/domain/themes/types';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  theme: Theme;
  className?: string;
}

export default function SectionHeader({ eyebrow, title, theme, className = '' }: SectionHeaderProps) {
  return (
    <div data-section-header="" className={`text-center mb-12 ${className}`}>
      {eyebrow && (
        <p className={`text-xs uppercase tracking-[0.28em] mb-3 ${theme.accentText} ${theme.bodyFont}`}>
          {eyebrow}
        </p>
      )}
      <h3 className={`text-3xl md:text-4xl font-light tracking-wide ${theme.headingFont} ${theme.bodyText}`} style={{ fontFamily: 'var(--v2-font-heading, inherit)' }}>
        {title}
      </h3>
      <div
        className="w-12 mx-auto mt-6"
        aria-hidden="true"
        style={{ height: '1px', background: `var(--v2-divider-color, ${theme.colors.accent})`, opacity: 0.6 }}
      />
    </div>
  );
}
