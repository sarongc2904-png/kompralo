'use client';

import { useState } from 'react';
import type { FeatureCategory } from '@/domain/features/types';
import type { InvitationFeatureKey, FeatureOverrides, PlanId } from '@/domain/plans/types';
import { activeFeatures } from '@/domain/features/registry';
import { getFeaturesForPlan } from '@/domain/plans/registry';
import { updateFeatureOverrides } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_RANK: Record<PlanId, number> = { basic: 1, premium: 2, deluxe: 3 };
const PLAN_LABEL: Record<PlanId, string> = { basic: 'Basic', premium: 'Premium', deluxe: 'Deluxe' };

const CATEGORY_LABEL: Record<FeatureCategory, string> = {
  core:       'Esenciales',
  engagement: 'Interacción',
  media:      'Media',
  social:     'Social',
  logistics:  'Logística',
  content:    'Contenido',
  ai:         'IA',
};

const CATEGORY_ORDER: FeatureCategory[] = [
  'core', 'engagement', 'media', 'logistics', 'content', 'social', 'ai',
];

// Only customer-editable features that have a planFeatureKey can be toggled.
const toggleableFeatures = activeFeatures.filter((f) => !!f.planFeatureKey && f.editableByCustomer);

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  invitationId: string;
  slug: string;
  planId: PlanId;
  initialOverrides: FeatureOverrides;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FeaturesForm({ invitationId, slug, planId, initialOverrides }: Props) {
  // Working copy of overrides — only keys explicitly different from plan default.
  const [overrides, setOverrides] = useState<FeatureOverrides>(initialOverrides ?? {});
  const [saving, setSaving]       = useState(false);
  const [result, setResult]       = useState<{ success: boolean; message: string } | null>(null);

  // Plan's default features (no overrides applied).
  const planDefaults = getFeaturesForPlan(planId);

  // Effective state of a feature (plan default merged with current overrides).
  function effectiveValue(key: InvitationFeatureKey): boolean {
    return key in overrides ? (overrides[key] ?? false) : (planDefaults[key] ?? false);
  }

  // Whether the plan unlocks a feature at all.
  function planAllows(minimumPlan: PlanId | null): boolean {
    if (!minimumPlan) return false;
    return PLAN_RANK[planId] >= PLAN_RANK[minimumPlan];
  }

  function handleToggle(key: InvitationFeatureKey, minimumPlan: PlanId | null) {
    if (!planAllows(minimumPlan)) return; // gated — no-op

    const current = effectiveValue(key);
    const planDefault = planDefaults[key] ?? false;
    const next = !current;

    setOverrides((prev) => {
      // If toggling back to plan default → remove the override key entirely.
      if (next === planDefault) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: next };
    });

    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    const res = await updateFeatureOverrides({
      id: invitationId,
      slug,
      overrides: overrides as Partial<Record<InvitationFeatureKey, boolean>>,
    });

    setSaving(false);
    if (res.success) notifyPreviewRefresh();
    setResult({ success: res.success, message: res.success ? res.message : res.error });
  }

  // Group active toggleable features by category, in defined order.
  const grouped = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      features: toggleableFeatures.filter((f) => f.category === cat),
    }))
    .filter((g) => g.features.length > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {grouped.map(({ category, features }) => (
        <div key={category}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            {CATEGORY_LABEL[category]}
          </h3>
          <div className="space-y-2">
            {features.map((feat) => {
              const key        = feat.planFeatureKey as InvitationFeatureKey;
              const allowed    = planAllows(feat.minimumPlan);
              const isOn       = effectiveValue(key);
              const isOverride = key in overrides;
              const minPlan    = feat.minimumPlan;

              return (
                <div
                  key={feat.id}
                  className={`flex items-start gap-4 rounded-lg border px-4 py-3 transition-colors ${
                    allowed
                      ? 'border-gray-200 bg-white hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  {/* Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    disabled={!allowed}
                    onClick={() => handleToggle(key, feat.minimumPlan)}
                    className={`relative mt-0.5 flex-shrink-0 h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
                      !allowed
                        ? 'bg-gray-200 cursor-not-allowed'
                        : isOn
                        ? 'bg-blue-600 cursor-pointer'
                        : 'bg-gray-300 cursor-pointer'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        isOn ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${allowed ? 'text-gray-800' : 'text-gray-400'}`}>
                        {feat.label}
                      </span>

                      {/* Plan badge */}
                      {minPlan && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            allowed
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {PLAN_LABEL[minPlan]}
                        </span>
                      )}

                      {/* Override indicator */}
                      {isOverride && allowed && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium">
                          modificado
                        </span>
                      )}

                      {/* Locked badge */}
                      {!allowed && minPlan && (
                        <span className="text-xs text-gray-400">
                          Disponible en {PLAN_LABEL[minPlan]}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${allowed ? 'text-gray-500' : 'text-gray-400'}`}>
                      {feat.description}
                    </p>
                  </div>

                  {/* State label */}
                  <span className={`flex-shrink-0 text-xs font-medium mt-1 ${
                    !allowed ? 'text-gray-300' : isOn ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {!allowed ? '—' : isOn ? 'ON' : 'OFF'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Feedback */}
      {result && (
        <p className={`text-sm font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.message}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {saving ? 'Guardando…' : 'Guardar configuración'}
      </button>
    </form>
  );
}
