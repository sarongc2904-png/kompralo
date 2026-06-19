'use client';

/**
 * Compatibility bridge: wraps a v1 InvitationTheme and renders ThemeProviderV2.
 *
 * This lets any subtree that currently receives a v1 theme opt into the
 * ThemeContextV2 without rewriting the parent. The v1 theme fields are mapped
 * to the nearest v2 equivalents; v2-only fields receive sensible defaults
 * derived from the editorial theme.
 */

import type { ReactNode } from 'react';
import type { InvitationTheme } from '@/domain/themes/types';
import type { InvitationThemeV2, ThemeIdV2 } from '@/domain/themes-v2/types';
import { ThemeProviderV2 } from '@/domain/themes-v2/ThemeProviderV2';
import { resolveTheme } from '@/domain/themes-v2/registry';

// ─── V1 → V2 mapping ─────────────────────────────────────────────────────────

function v1ToV2(v1: InvitationTheme): InvitationThemeV2 {
  // Try to find a native v2 theme by matching v1 id to a v2 id.
  const idMap: Record<string, ThemeIdV2> = {
    champagne: 'editorial',
    floral:    'floral',
    modern:    'modern-dark',
    azure:     'editorial', // no v2 azure yet — fall back to editorial
  };

  const nativeV2 = resolveTheme(idMap[v1.id]);

  // Overlay v1 color values so the CSS vars reflect the actual v1 theme.
  const merged: InvitationThemeV2 = {
    ...nativeV2,
    colors: {
      ...nativeV2.colors,
      pageBackground: v1.colors.pageBackground,
      surface:        v1.colors.surface,
      surfaceAlt:     v1.colors.surfaceAlt,
      textPrimary:    v1.colors.textPrimary,
      textSecondary:  v1.colors.textSecondary,
      accent:         v1.colors.accent,
      accentSoft:     v1.colors.accentSoft,
      border:         v1.colors.border,
      overlay:        v1.colors.overlay,
    },
    typography: {
      ...nativeV2.typography,
      headingClass: v1.typography.headingFont,
      bodyClass:    v1.typography.bodyFont,
      scriptClass:  v1.typography.scriptFont,
    },
    shadows: {
      soft:     v1.shadows.soft,
      card:     v1.shadows.card,
      elevated: v1.shadows.elevated,
      book:     v1.shadows.book,
    },
    effects: {
      ...nativeV2.effects,
      paperTexture: v1.effects.paperTexture,
      grain:        v1.effects.grain,
      particles:    v1.effects.particles,
      parallax:     v1.effects.parallax,
      lightSweep:   v1.effects.lightSweep,
    },
    // Rebuild CSS variables from merged colors so --v2-* vars stay coherent.
    cssVariables: {
      ...nativeV2.cssVariables,
      '--v2-color-page-bg':      v1.colors.pageBackground,
      '--v2-color-surface':      v1.colors.surface,
      '--v2-color-surface-alt':  v1.colors.surfaceAlt,
      '--v2-color-text-primary': v1.colors.textPrimary,
      '--v2-color-text-secondary': v1.colors.textSecondary,
      '--v2-color-accent':       v1.colors.accent,
      '--v2-color-accent-soft':  v1.colors.accentSoft,
      '--v2-color-border':       v1.colors.border,
      '--v2-color-overlay':      v1.colors.overlay,
      '--v2-shadow-card':        v1.shadows.card,
      '--v2-shadow-elevated':    v1.shadows.elevated,
    },
  };

  return merged;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  theme: InvitationTheme;
  injectCssVariables?: boolean;
  className?: string;
  children: ReactNode;
}

export function ThemeProvider({ theme, injectCssVariables = true, className, children }: ThemeProviderProps) {
  const v2Theme = v1ToV2(theme);
  return (
    <ThemeProviderV2 theme={v2Theme} injectCssVariables={injectCssVariables} className={className}>
      {children}
    </ThemeProviderV2>
  );
}
