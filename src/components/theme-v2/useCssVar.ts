/**
 * Returns a CSS `var()` reference for a --v2-* custom property.
 * The variable is injected at the root by ThemeProviderV2 / InvitationRenderer.
 *
 * Usage:
 *   const bg = useCssVar('--v2-color-page-bg');
 *   // → 'var(--v2-color-page-bg)'
 */
export function useCssVar(name: string): string {
  return `var(${name})`;
}
