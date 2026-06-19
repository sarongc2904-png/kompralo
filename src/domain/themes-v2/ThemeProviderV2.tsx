'use client';

import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from 'react';
import type { InvitationThemeV2 } from '@/domain/themes-v2/types';
import { resolveTheme } from '@/domain/themes-v2/registry';

// ─── Context ──────────────────────────────────────────────────────────────────

interface ThemeContextV2Value {
  theme: InvitationThemeV2;
}

const ThemeContextV2 = createContext<ThemeContextV2Value | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useThemeV2(): InvitationThemeV2 {
  const ctx = useContext(ThemeContextV2);
  if (!ctx) {
    // Outside a provider — return the default theme rather than throwing,
    // so components work in isolation (Storybook, tests, etc.).
    return resolveTheme(null);
  }
  return ctx.theme;
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface ThemeProviderV2Props {
  theme: InvitationThemeV2;
  /** When true, injects CSS variables onto the root wrapper div. Default: true */
  injectCssVariables?: boolean;
  /** Additional className for the root wrapper */
  className?: string;
  children: ReactNode;
}

export function ThemeProviderV2({
  theme,
  injectCssVariables = true,
  className,
  children,
}: ThemeProviderV2Props) {
  const value = useMemo<ThemeContextV2Value>(() => ({ theme }), [theme]);

  // When injectCssVariables is false we skip the wrapper div entirely —
  // the caller is responsible for applying CSS vars (e.g. directly on a root element).
  if (!injectCssVariables) {
    return (
      <ThemeContextV2.Provider value={value}>
        {children}
      </ThemeContextV2.Provider>
    );
  }

  const style = theme.cssVariables as CSSProperties;

  return (
    <ThemeContextV2.Provider value={value}>
      <div style={style} className={className} data-theme-v2={theme.id}>
        {children}
      </div>
    </ThemeContextV2.Provider>
  );
}
