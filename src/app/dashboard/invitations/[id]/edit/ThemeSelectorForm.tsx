'use client';

import { useState } from 'react';
import { availableThemesV2 } from '@/domain/themes-v2';
import type { InvitationThemeV2 } from '@/domain/themes-v2';
import { updateThemeSelection } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';

// ─── Theme visibility ────────────────────────────────────────────────────────
// Show all 6 selectable themes: 4 editorial/pastel + luxury-champagne + modern-pastel

const VISIBLE_THEME_IDS = new Set([
  'ivory-editorial',
  'pastel-rose-editorial',
  'pastel-sage-editorial',
  'pastel-sky-editorial',
  'luxury-champagne',
  'modern-pastel',
]);

function getVisibleThemes() {
  return availableThemesV2.filter((theme) => VISIBLE_THEME_IDS.has(theme.id));
}

// ─── V1 → V2 display map ─────────────────────────────────────────────────────
// If the invitation currently has a legacy v1 themeId, map it to the
// nearest v2 equivalent for the "currently selected" highlight.
// All legacy themes now resolve to ivory-editorial.

const V1_TO_V2_DISPLAY: Record<string, string> = {
  champagne: 'ivory-editorial',    // Was 'editorial', now ivory-editorial
  modern:    'ivory-editorial',    // Was 'modern-dark', now ivory-editorial
  azure:     'ivory-editorial',    // Was 'editorial', now ivory-editorial
  floral:    'ivory-editorial',    // Was 'floral', now ivory-editorial
  editorial: 'ivory-editorial',    // Map all old themes to ivory-editorial
  'modern-dark': 'ivory-editorial',
  'luxury-gold': 'ivory-editorial',
  'luxury-champagne': 'luxury-champagne',
  'modern-pastel': 'modern-pastel',
  'garden-romance': 'ivory-editorial',
  'boho-terracotta': 'ivory-editorial',
  'black-tie': 'ivory-editorial',
  'pastel-rose-editorial': 'pastel-rose-editorial',
  'pastel-sage-editorial': 'pastel-sage-editorial',
  'pastel-sky-editorial': 'pastel-sky-editorial',
};

function resolveDisplayId(themeId: string): string {
  return V1_TO_V2_DISPLAY[themeId] ?? 'ivory-editorial';
}

// ─── Color swatches preview ───────────────────────────────────────────────────

function ThemeColorSwatches({ theme }: { theme: InvitationThemeV2 }) {
  const swatches = theme.dressCodeSwatches.slice(0, 5);
  return (
    <div className="flex gap-1.5 mt-3">
      {swatches.map((color) => (
        <span
          key={color}
          title={color}
          style={{
            display: 'inline-block',
            width: 20,
            height: 20,
            borderRadius: theme.shapes.radiusSm,
            background: color,
            border: '1px solid rgba(0,0,0,0.10)',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  invitationId: string;
  slug: string;
  currentThemeId: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ThemeSelectorForm({ invitationId, slug, currentThemeId }: Props) {
  const displayCurrent = resolveDisplayId(currentThemeId);
  const [selected, setSelected] = useState<string>(displayCurrent);
  const [saving, setSaving]     = useState(false);
  const [result, setResult]     = useState<{ success: boolean; message: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setResult(null);

    const res = await updateThemeSelection({
      id:      invitationId,
      slug,
      themeId: selected,
    });

    setSaving(false);
    if (res.success) notifyPreviewRefresh();
    setResult({ success: res.success, message: res.success ? res.message : res.error });
  }

  return (
    <div className="space-y-6">
      {/* Theme grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {getVisibleThemes().map((theme) => {
          const isSelected = selected === theme.id;
          const isCurrent  = displayCurrent === theme.id && selected === displayCurrent;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => { setSelected(theme.id); setResult(null); }}
              className="text-left rounded-xl border-2 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{
                borderColor:     isSelected ? '#3B82F6' : '#E8E2DA',
                background:      isSelected ? '#EFF6FF' : '#FFFFFF',
                boxShadow:       isSelected
                  ? '0 0 0 2px rgba(59,130,246,0.20)'
                  : '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              {/* Mini palette preview */}
              <div
                className="w-full h-12 rounded-lg overflow-hidden mb-3"
                style={{
                  background: theme.backgrounds.main,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                {/* Accent strip */}
                <div
                  className="h-1 w-full"
                  style={{ background: theme.colors.accent }}
                />
                {/* Surface sample */}
                <div
                  className="flex items-center justify-center h-full gap-1"
                >
                  <span
                    className="text-xs font-medium"
                    style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.headingFamily }}
                  >
                    {theme.name}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {theme.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                    {theme.description}
                  </p>
                  <ThemeColorSwatches theme={theme} />
                </div>

                {/* Selected / current badges */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {isSelected && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                      Seleccionado
                    </span>
                  )}
                  {isCurrent && !saving && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-medium">
                      Actual
                    </span>
                  )}
                </div>
              </div>

              {/* Shape / effect chips */}
              <div className="flex flex-wrap gap-1 mt-3">
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                  {theme.shapes.cardStyle}
                </span>
                {theme.effects.paperTexture && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    paper
                  </span>
                )}
                {theme.effects.particles && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    partículas
                  </span>
                )}
                {theme.divider.variant === 'ornamental' && theme.divider.ornamentChar && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    {theme.divider.ornamentChar}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {result && (
        <p className={`text-sm font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.message}
        </p>
      )}

      {/* Save button — only enabled when selection differs from current */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || selected === displayCurrent}
        className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {saving ? 'Aplicando…' : 'Aplicar tema'}
      </button>

      {selected === displayCurrent && !saving && (
        <p className="text-xs text-gray-400">
          Este ya es el tema activo. Selecciona otro para cambiar.
        </p>
      )}
    </div>
  );
}
