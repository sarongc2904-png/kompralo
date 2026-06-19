import type { CSSProperties, ReactNode } from 'react';
import type { Theme } from '@/domain/themes/types';

interface LiquidCardProps {
  children: ReactNode;
  theme: Theme;
  className?: string;
  style?: CSSProperties;
}

export default function LiquidCard({ children, theme, className = '', style }: LiquidCardProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.overlay} 60%, ${theme.colors.surfaceAlt} 100%)`,
        backdropFilter: theme.effects.glass,
        WebkitBackdropFilter: theme.effects.glass,
        // V2 tokens — fall back to v1 values when outside ThemeProviderV2.
        borderRadius: `var(--v2-radius-lg, ${theme.borders.radiusLg}px)`,
        border: `1px solid var(--v2-color-border, ${theme.borders.subtle})`,
        boxShadow: `var(--v2-shadow-card, ${theme.shadows.card})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
