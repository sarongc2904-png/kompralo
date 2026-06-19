import { featureRegistry } from '@/domain/features';
import type { FeatureDescriptor, FeatureCategory } from '@/domain/features';

export const metadata = { title: 'Features — Kompralo Admin' };

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  core:       'Core',
  engagement: 'Engagement',
  media:      'Media',
  social:     'Social',
  logistics:  'Logística',
  content:    'Contenido',
  ai:         'Inteligencia Artificial',
};

const CATEGORY_ORDER: FeatureCategory[] = [
  'core', 'engagement', 'media', 'social', 'logistics', 'content', 'ai',
];

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  active:     { label: 'Activa',        bg: '#E8F5E9', text: '#388E3C' },
  comingSoon: { label: 'Próximamente',  bg: '#FFF8E1', text: '#F57F17' },
  hidden:     { label: 'Oculta',        bg: '#F3F3F3', text: '#757575' },
};

const PLAN_BADGE: Record<string, { bg: string; text: string }> = {
  basic:    { bg: '#F3F3F3', text: '#616161' },
  gold:     { bg: '#FFF8E1', text: '#B8860B' },
  platinum: { bg: '#EDE7F6', text: '#512DA8' },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span
      className="inline-block text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded font-medium"
      style={{ background: bg, color: text, whiteSpace: 'nowrap' }}
    >
      {label}
    </span>
  );
}

function FeatureRow({ feature }: { feature: FeatureDescriptor }) {
  const status = STATUS_BADGE[feature.status] ?? STATUS_BADGE.hidden;
  const plan = feature.minimumPlan ? PLAN_BADGE[feature.minimumPlan] : null;

  return (
    <tr style={{ borderBottom: '1px solid #F0EBE4' }}>
      {/* Label + description */}
      <td className="py-3 pr-4" style={{ minWidth: 200 }}>
        <p className="text-sm font-medium" style={{ color: '#1A1410' }}>
          {feature.label}
        </p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9B8878', maxWidth: 320 }}>
          {feature.description}
        </p>
        {feature.planFeatureKey && (
          <p className="text-[10px] mt-1 font-mono" style={{ color: '#C0B0A0' }}>
            {feature.planFeatureKey}
          </p>
        )}
      </td>

      {/* Status */}
      <td className="py-3 pr-4">
        <Badge label={status.label} bg={status.bg} text={status.text} />
      </td>

      {/* Plan */}
      <td className="py-3 pr-4">
        {plan && feature.minimumPlan ? (
          <Badge label={feature.minimumPlan} bg={plan.bg} text={plan.text} />
        ) : (
          <span className="text-xs" style={{ color: '#C0B0A0' }}>—</span>
        )}
      </td>

      {/* Flags */}
      <td className="py-3">
        <div className="flex flex-wrap gap-1">
          {feature.requiresPersistence && (
            <Badge label="Requiere DB" bg="#FBE9E7" text="#BF360C" />
          )}
          {feature.editableByCustomer && (
            <Badge label="Cliente" bg="#E8EAF6" text="#303F9F" />
          )}
          {feature.editableByAdmin && (
            <Badge label="Admin" bg="#E0F2F1" text="#00695C" />
          )}
        </div>
      </td>
    </tr>
  );
}

function CategorySection({ category, features }: { category: FeatureCategory; features: FeatureDescriptor[] }) {
  const active = features.filter((f) => f.status === 'active').length;
  const coming = features.filter((f) => f.status === 'comingSoon').length;

  return (
    <section className="mb-8">
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#3D2B1A' }}>
          {CATEGORY_LABELS[category]}
        </h2>
        <span className="text-xs" style={{ color: '#9B8878' }}>
          {active} activa{active !== 1 ? 's' : ''}
          {coming > 0 ? ` · ${coming} próximamente` : ''}
        </span>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #F0EBE4' }}>
              {['Feature', 'Estado', 'Plan mínimo', 'Flags'].map((h) => (
                <th
                  key={h}
                  className="py-2.5 pr-4 text-left text-[10px] uppercase tracking-widest"
                  style={{ color: '#9B8878', paddingLeft: h === 'Feature' ? '1.25rem' : 0 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <FeatureRow key={f.id} feature={f} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FeaturesPage() {
  const totalActive     = featureRegistry.filter((f) => f.status === 'active').length;
  const totalComingSoon = featureRegistry.filter((f) => f.status === 'comingSoon').length;

  const byCategory = CATEGORY_ORDER.reduce<Record<FeatureCategory, FeatureDescriptor[]>>(
    (acc, cat) => {
      acc[cat] = featureRegistry.filter((f) => f.category === cat);
      return acc;
    },
    {} as Record<FeatureCategory, FeatureDescriptor[]>,
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light" style={{ color: '#1A1410' }}>
          Catálogo de Features
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9B8878' }}>
          {totalActive} activas · {totalComingSoon} próximamente ·{' '}
          {featureRegistry.length} en total
        </p>
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap gap-3 mb-8 p-4 rounded-xl"
        style={{ background: '#FFFFFF', border: '1px solid #E8E2DA' }}
      >
        <span className="text-[10px] uppercase tracking-widest self-center" style={{ color: '#9B8878' }}>
          Leyenda:
        </span>
        <Badge label="Activa"       bg="#E8F5E9" text="#388E3C" />
        <Badge label="Próximamente" bg="#FFF8E1" text="#F57F17" />
        <Badge label="Oculta"       bg="#F3F3F3" text="#757575" />
        <Badge label="Requiere DB"  bg="#FBE9E7" text="#BF360C" />
        <Badge label="Cliente"      bg="#E8EAF6" text="#303F9F" />
        <Badge label="Admin"        bg="#E0F2F1" text="#00695C" />
        <Badge label="basic"        bg="#F3F3F3" text="#616161" />
        <Badge label="gold"         bg="#FFF8E1" text="#B8860B" />
        <Badge label="platinum"     bg="#EDE7F6" text="#512DA8" />
      </div>

      {/* Categories */}
      {CATEGORY_ORDER.map((cat) =>
        byCategory[cat].length > 0 ? (
          <CategorySection key={cat} category={cat} features={byCategory[cat]} />
        ) : null,
      )}
    </div>
  );
}
