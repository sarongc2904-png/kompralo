'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useThemeV2 } from '@/domain/themes-v2';

interface ThemeCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Glass-morphism card that draws its visual tokens from the active Theme V2.
 * Drop-in for LiquidCard in any component that has ThemeProviderV2 in its tree.
 */
export function ThemeCard({ children, className = '', style: extraStyle }: ThemeCardProps) {
  const theme = useThemeV2();

  const cardStyle: CSSProperties = {
    background: `linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.overlay} 60%, ${theme.colors.surfaceAlt} 100%)`,
    backdropFilter: `${theme.effects.glassBlur} ${theme.effects.glassSaturation}`,
    WebkitBackdropFilter: `${theme.effects.glassBlur} ${theme.effects.glassSaturation}`,
    borderRadius: theme.shapes.radiusLg,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.card,
    ...extraStyle,
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={cardStyle}>
      {children}
    </div>
  );
}
